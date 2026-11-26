"""Mini-biblioteca glTF 2.0 (GLB) para o estudo conceitual MOSARQ.
Sem dependências além de numpy e Pillow. Unidades: metros. Eixos: Y para cima, +Z = frente/sul.
"""
import json, math, struct, io
import numpy as np
from PIL import Image

def v3(*a): return np.array(a, dtype=np.float64)

def yaw_matrix(deg):
    c, s = math.cos(math.radians(deg)), math.sin(math.radians(deg))
    return np.array([[c, 0, s], [0, 1, 0], [-s, 0, c]])

def quat_from_matrix(m):
    t = m[0, 0] + m[1, 1] + m[2, 2]
    if t > 0:
        s = math.sqrt(t + 1) * 2
        return [(m[2, 1] - m[1, 2]) / s, (m[0, 2] - m[2, 0]) / s, (m[1, 0] - m[0, 1]) / s, 0.25 * s]
    i = int(np.argmax([m[0, 0], m[1, 1], m[2, 2]]))
    if i == 0:
        s = math.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2
        return [0.25 * s, (m[0, 1] + m[1, 0]) / s, (m[0, 2] + m[2, 0]) / s, (m[2, 1] - m[1, 2]) / s]
    if i == 1:
        s = math.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2
        return [(m[0, 1] + m[1, 0]) / s, 0.25 * s, (m[1, 2] + m[2, 1]) / s, (m[0, 2] - m[2, 0]) / s]
    s = math.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2
    return [(m[0, 2] + m[2, 0]) / s, (m[1, 2] + m[2, 1]) / s, 0.25 * s, (m[1, 0] - m[0, 1]) / s]

def yaw_quat(deg):
    h = math.radians(deg) / 2
    return [0, math.sin(h), 0, math.cos(h)]

def lookat_quat(pos, target, up=(0, 1, 0)):
    f = v3(*target) - v3(*pos); f /= np.linalg.norm(f)
    r = np.cross(f, v3(*up)); r /= np.linalg.norm(r)
    u = np.cross(r, f)
    m = np.column_stack([r, u, -f])
    return quat_from_matrix(m)

FACES = [
    ((1, 0, 0), (0, 0, -1), (0, 1, 0)), ((-1, 0, 0), (0, 0, 1), (0, 1, 0)),
    ((0, 1, 0), (1, 0, 0), (0, 0, -1)), ((0, -1, 0), (1, 0, 0), (0, 0, 1)),
    ((0, 0, 1), (1, 0, 0), (0, 1, 0)), ((0, 0, -1), (-1, 0, 0), (0, 1, 0)),
]

class Geo:
    """Acumula geometria por material em coordenadas locais do objeto."""
    def __init__(self):
        self.prims = {}      # material -> dict(p,n,t,i)
        self.boxes = []      # AABBs locais (min,max) para verificação de colisão

    def _p(self, mat):
        return self.prims.setdefault(mat, dict(p=[], n=[], t=[], i=[]))

    def _add(self, mat, P, N, T, I):
        d = self._p(mat); base = sum(len(x) for x in d['p'])
        d['p'].append(np.asarray(P, np.float32)); d['n'].append(np.asarray(N, np.float32))
        d['t'].append(np.asarray(T, np.float32)); d['i'].append(np.asarray(I, np.uint32) + base)

    def box(self, mat, c, s, tile=1.0, clip=True, yaw=0):
        c = v3(*c); h = v3(*s) / 2
        P, N, T, I = [], [], [], []
        R = yaw_matrix(yaw) if yaw else None
        for k, (n, u, v) in enumerate(FACES):
            n, u, v = v3(*n), v3(*u), v3(*v)
            hn, hu, hv = abs(n @ h), abs(u @ h), abs(v @ h)
            cu, cv = c @ u, c @ v
            b = len(P)
            for su, sv in ((-1, -1), (1, -1), (1, 1), (-1, 1)):
                p = c + n * hn + u * hu * su + v * hv * sv
                P.append(p); N.append(n); T.append(((cu + su * hu) / tile, 1 - (cv + sv * hv) / tile))
            I += [b, b + 1, b + 2, b, b + 2, b + 3]
        P = np.array(P); N = np.array(N)
        if R is not None:
            P = (P - c) @ R.T + c; N = N @ R.T
        self._add(mat, P, N, T, I)
        if clip:
            if R is not None:
                corners = np.array([[x, y, z] for x in (-1, 1) for y in (-1, 1) for z in (-1, 1)]) * h
                corners = corners @ R.T + c
                self.boxes.append((corners.min(0), corners.max(0)))
            else:
                self.boxes.append((c - h, c + h))

    def rbox(self, mat, c, s, r=0.04, tile=1.0, clip=True, div=3):
        c = v3(*c); h = v3(*s) / 2; r = min(r, float(h.min()) * 0.98)
        def axis(hh):
            a = [-hh, -hh + r / 3, -hh + 2 * r / 3, -hh + r]
            return a + [-x for x in reversed(a)]
        P, N, T, I = [], [], [], []
        inner = h - r
        for n, u, v in FACES:
            n, u, v = v3(*n), v3(*u), v3(*v)
            hu, hv = abs(u @ h), abs(v @ h)
            au, av = axis(hu), axis(hv)
            b = len(P)
            for sv in av:
                for su in au:
                    p = n * abs(n @ h) + u * su + v * sv
                    q = np.clip(p, -inner, inner)
                    d = p - q
                    L = np.linalg.norm(d)
                    if L > 1e-9:
                        nn = d / L; pp = q + nn * r
                    else:
                        nn = n; pp = p
                    P.append(pp + c); N.append(nn)
                    T.append(((c @ u + su) / tile, 1 - (c @ v + sv) / tile))
            m = len(au)
            for j in range(len(av) - 1):
                for i2 in range(m - 1):
                    a = b + j * m + i2
                    I += [a, a + 1, a + m + 1, a, a + m + 1, a + m]
        self._add(mat, P, N, T, I)
        if clip: self.boxes.append((c - h, c + h))

    def cyl(self, mat, c, r, h, seg=24, rt=None, tile=1.0, clip=True, caps=True):
        rt = r if rt is None else rt
        c = v3(*c); P, N, T, I = [], [], [], []
        slope = (r - rt) / h
        for i in range(seg + 1):
            a = 2 * math.pi * i / seg
            ca, sa = math.cos(a), math.sin(a)
            nn = v3(ca, slope, sa); nn /= np.linalg.norm(nn)
            P.append(c + v3(r * ca, -h / 2, r * sa)); N.append(nn); T.append((i / seg * 2 * math.pi * r / tile, 0))
            P.append(c + v3(rt * ca, h / 2, rt * sa)); N.append(nn); T.append((i / seg * 2 * math.pi * r / tile, h / tile))
        for i in range(seg):
            a = 2 * i
            I += [a, a + 3, a + 2, a, a + 1, a + 3]
        if caps:
            for top, rr, y in ((True, rt, h / 2), (False, r, -h / 2)):
                if rr <= 1e-6: continue
                b = len(P)
                P.append(c + v3(0, y, 0)); N.append(v3(0, 1 if top else -1, 0)); T.append((0.5, 0.5))
                for i in range(seg + 1):
                    a = 2 * math.pi * i / seg
                    P.append(c + v3(rr * math.cos(a), y, rr * math.sin(a))); N.append(v3(0, 1 if top else -1, 0))
                    T.append((0.5 + 0.5 * math.cos(a) * rr / max(r, rt), 0.5 + 0.5 * math.sin(a) * rr / max(r, rt)))
                for i in range(seg):
                    I += ([b, b + 2 + i, b + 1 + i] if top else [b, b + 1 + i, b + 2 + i])
        self._add(mat, P, N, T, I)
        if clip:
            R = max(r, rt); self.boxes.append((c - v3(R, h / 2, R), c + v3(R, h / 2, R)))

    def sph(self, mat, c, rx, ry=None, rz=None, seg=16, rings=10, clip=True, tile=1.0):
        ry = rx if ry is None else ry; rz = rx if rz is None else rz
        c = v3(*c); P, N, T, I = [], [], [], []
        for j in range(rings + 1):
            th = math.pi * j / rings
            for i in range(seg + 1):
                ph = 2 * math.pi * i / seg
                nx, ny, nz = math.sin(th) * math.cos(ph), math.cos(th), math.sin(th) * math.sin(ph)
                P.append(c + v3(rx * nx, ry * ny, rz * nz))
                nn = v3(nx / rx, ny / ry, nz / rz); nn /= np.linalg.norm(nn); N.append(nn)
                T.append((i / seg, j / rings))
        m = seg + 1
        for j in range(rings):
            for i in range(seg):
                a = j * m + i
                if j != 0: I += [a, a + 1, a + m]
                if j != rings - 1: I += [a + 1, a + m + 1, a + m]
        self._add(mat, P, N, T, I)
        if clip: self.boxes.append((c - v3(rx, ry, rz), c + v3(rx, ry, rz)))

    def bounds(self):
        if not self.boxes: return None
        return (np.min([b[0] for b in self.boxes], 0), np.max([b[1] for b in self.boxes], 0))


class GLB:
    def __init__(self, title):
        self.nodes, self.meshes, self.materials, self.cameras = [], [], [], []
        self.matidx, self.images, self.textures, self.texidx = {}, [], [], {}
        self.bufferViews, self.accessors = [], []
        self.bin = bytearray()
        self.children = {}
        self.title = title
        self.objects = []      # registro p/ verificação: dict(name, node, pos, yaw, geo, group)

    # --- binário ---
    def _view(self, data, target=None):
        while len(self.bin) % 4: self.bin += b'\0'
        off = len(self.bin); self.bin += data
        bv = dict(buffer=0, byteOffset=off, byteLength=len(data))
        if target: bv['target'] = target
        self.bufferViews.append(bv); return len(self.bufferViews) - 1

    def _acc(self, arr, ctype, atype, target, minmax=False):
        bv = self._view(arr.tobytes(), target)
        a = dict(bufferView=bv, componentType=ctype, count=int(len(arr)), type=atype)
        if minmax:
            a['min'] = [float(x) for x in arr.min(0)]; a['max'] = [float(x) for x in arr.max(0)]
        self.accessors.append(a); return len(self.accessors) - 1

    # --- texturas e materiais ---
    def texture(self, name, img):
        if name in self.texidx: return self.texidx[name]
        buf = io.BytesIO(); img.save(buf, 'JPEG', quality=82, optimize=True)
        bv = self._view(buf.getvalue())
        self.images.append(dict(bufferView=bv, mimeType='image/jpeg', name=name))
        self.textures.append(dict(sampler=0, source=len(self.images) - 1, name=name))
        self.texidx[name] = len(self.textures) - 1; return self.texidx[name]

    def material(self, name, color, rough=0.85, metal=0.0, tex=None, emissive=None, alpha=None, double=False):
        m = dict(name=name, pbrMetallicRoughness=dict(baseColorFactor=list(color) + ([alpha] if alpha is not None else [1.0]),
                                                      roughnessFactor=rough, metallicFactor=metal))
        if tex is not None: m['pbrMetallicRoughness']['baseColorTexture'] = dict(index=tex)
        if emissive: m['emissiveFactor'] = list(emissive)
        if alpha is not None: m['alphaMode'] = 'BLEND'
        if double: m['doubleSided'] = True
        self.materials.append(m); self.matidx[name] = len(self.materials) - 1

    # --- cena ---
    def node(self, name, parent=None, t=None, q=None, extras=None, camera=None):
        n = dict(name=name)
        if t is not None and any(abs(x) > 1e-9 for x in t): n['translation'] = [round(float(x), 5) for x in t]
        if q is not None and q != [0, 0, 0, 1]: n['rotation'] = [round(float(x), 6) for x in q]
        if extras: n['extras'] = extras
        if camera is not None: n['camera'] = camera
        self.nodes.append(n); idx = len(self.nodes) - 1
        if parent is not None: self.children.setdefault(parent, []).append(idx)
        return idx

    def camera(self, name, yfov_deg, znear=0.05, zfar=200):
        self.cameras.append(dict(name=name, type='perspective', perspective=dict(yfov=math.radians(yfov_deg), znear=znear, zfar=zfar)))
        return len(self.cameras) - 1

    def attach(self, node, geo):
        prims = []
        for mat, d in geo.prims.items():
            P = np.concatenate(d['p']); N = np.concatenate(d['n']); T = np.concatenate(d['t']); I = np.concatenate(d['i'])
            ind_type = 5125
            prims.append(dict(attributes=dict(POSITION=self._acc(P, 5126, 'VEC3', 34962, True), NORMAL=self._acc(N, 5126, 'VEC3', 34962),
                                              TEXCOORD_0=self._acc(T, 5126, 'VEC2', 34962)),
                              indices=self._acc(I.astype(np.uint32), ind_type, 'SCALAR', 34963), material=self.matidx[mat]))
        if not prims: return
        self.meshes.append(dict(name=self.nodes[node]['name'], primitives=prims))
        self.nodes[node]['mesh'] = len(self.meshes) - 1

    def obj(self, name, parent, pos=(0, 0, 0), yaw=0, group='', clip=True, role='furniture', extras=None):
        """Cria um nó com geometria local. Retorna Geo."""
        n = self.node(name, parent, t=pos, q=yaw_quat(yaw) if yaw else None, extras=extras)
        g = Geo()
        self.objects.append(dict(name=name, node=n, pos=v3(*pos), yaw=yaw, geo=g, group=group, clip=clip, role=role))
        return g

    def finalize(self, path, root_nodes, extras):
        for o in self.objects: self.attach(o['node'], o['geo'])
        for p, ch in self.children.items(): self.nodes[p]['children'] = ch
        j = dict(asset=dict(version='2.0', generator='MOSARQ build_house_glb.py', extras=extras),
                 scene=0, scenes=[dict(name=self.title, nodes=root_nodes)], nodes=self.nodes, meshes=self.meshes,
                 materials=self.materials, accessors=self.accessors, bufferViews=self.bufferViews,
                 buffers=[dict(byteLength=len(self.bin))], samplers=[dict(magFilter=9729, minFilter=9987, wrapS=10497, wrapT=10497)])
        if self.cameras: j['cameras'] = self.cameras
        if self.images: j['images'] = self.images; j['textures'] = self.textures
        js = json.dumps(j, separators=(',', ':')).encode()
        js += b' ' * (-len(js) % 4)
        b = bytes(self.bin) + b'\0' * (-len(self.bin) % 4)
        out = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(b))
        out += struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(b), 0x004E4942) + b
        open(path, 'wb').write(out)
        return len(out)

    # --- verificação de colisão (AABB mundo) ---
    def world_aabb(self, o):
        g = o['geo']
        if not g.boxes: return None
        R = yaw_matrix(o['yaw']) if o['yaw'] else np.eye(3)
        pts = []
        for lo, hi in g.boxes:
            for x in (lo[0], hi[0]):
                for y in (lo[1], hi[1]):
                    for z in (lo[2], hi[2]): pts.append(R @ v3(x, y, z) + o['pos'])
        pts = np.array(pts); return pts.min(0), pts.max(0)
