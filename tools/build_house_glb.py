"""Gera assets/models/mosarq-casa.glb — ESTUDO CONCEITUAL (casa térrea 12x8 m, pé-direito 2,70 m).
Uso:  python3 tools/build_house_glb.py
Eixos: X leste(+), Y cima, Z frente/sul(+). Unidades em metros.
"""
import sys, os, json, subprocess, math
import numpy as np
from PIL import Image, ImageFilter
sys.path.insert(0, os.path.dirname(__file__))
from glb_lib import GLB, v3, lookat_quat

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'models', 'mosarq-casa.glb')
rng = np.random.default_rng(7)

def lin(hexs):
    h = hexs.lstrip('#'); c = [int(h[i:i+2], 16) / 255 for i in (0, 2, 4)]
    return tuple(round(((x + .055) / 1.055) ** 2.4 if x > .04045 else x / 12.92, 5) for x in c)

# ---------- texturas procedurais (sem arquivos externos, exceto o azulejo oficial) ----------
def noise(w, h, cw, ch, seed=0):
    r = np.random.default_rng(seed).random((ch, cw)).astype(np.float32)
    return np.asarray(Image.fromarray((r * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), np.float32) / 255

def to_img(a): return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def tex_wood():  # tom neutro, alinhado à paleta (madeira clara)
    S = 512; a = np.zeros((S, S, 3), np.float32); base = np.array([158, 124, 96], np.float32)
    n1 = noise(S, S, 6, 160, 1); n2 = noise(S, S, 24, 220, 2)
    for p in range(8):
        y0, y1 = p * 64, (p + 1) * 64
        tone = .88 + .24 * rng.random()
        a[y0:y1] = base * tone
        a[y0:y1] *= (.86 + .22 * n1[y0:y1, :, None] + .08 * n2[y0:y1, :, None]) 
        a[y0:y0 + 2] *= .55
        j = int(rng.integers(60, 450)); a[y0:y1, j:j + 2] *= .6
    return to_img(a)

def tex_stone():
    S = 512; n = .55 * noise(S, S, 8, 8, 3) + .3 * noise(S, S, 48, 48, 4) + .15 * noise(S, S, 200, 200, 5)
    a = np.array([186, 182, 173], np.float32) * (.82 + .3 * n[..., None]); return to_img(a)

def tex_grass():
    S = 512; n = .5 * noise(S, S, 10, 10, 6) + .3 * noise(S, S, 64, 64, 7) + .2 * noise(S, S, 256, 256, 8)
    a = np.array([98, 112, 78], np.float32) * (.72 + .5 * n[..., None]); return to_img(a)

def tex_plaster():
    S = 256; n = noise(S, S, 128, 128, 9); a = np.array([244, 243, 239], np.float32) * (.975 + .05 * n[..., None]); return to_img(a)

def tex_brick():
    S = 512; a = np.zeros((S, S, 3), np.float32); a[:] = (214, 205, 190); bh, bw = 32, 96
    for r in range(S // bh):
        off = (bw // 2) if r % 2 else 0
        for c in range(-1, S // bw + 1):
            x0 = c * bw + off; tone = .8 + .35 * rng.random()
            col = np.array([168, 90, 58], np.float32) * tone
            xa, xb = max(0, x0 + 3), min(S, x0 + bw - 3)
            if xb > xa: a[r * bh + 3:(r + 1) * bh - 3, xa:xb] = col
    return to_img(a * (.94 + .1 * noise(S, S, 120, 120, 10)[..., None]))

def tex_azulejo():
    svg = os.path.join(ROOT, 'assets', 'azulejo.svg'); png = '/tmp/_azulejo.png'
    try:
        subprocess.run(['rsvg-convert', '-w', '512', '-h', '512', svg, '-o', png], check=True)
        return Image.open(png).convert('RGB')
    except Exception:
        a = np.zeros((512, 512, 3), np.float32); a[:] = (107, 112, 92)
        for i in range(4):
            for j in range(4): a[i * 128 + 8:(i + 1) * 128 - 8, j * 128 + 8:(j + 1) * 128 - 8] = (80, 84, 69)
        return to_img(a)

g = GLB('MOSARQ — Casa (estudo conceitual)')
T = {k: g.texture(k, f()) for k, f in dict(madeira=tex_wood, pedra=tex_stone, grama=tex_grass, reboco=tex_plaster,
                                           tijolo=tex_brick, azulejo=tex_azulejo).items()}
M = g.material
M('paredes', lin('#f5f5f3'), .95, tex=T['reboco'])
M('piso_madeira', (1, 1, 1), .6, tex=T['madeira'])
M('piso_pedra', (1, 1, 1), .55, tex=T['pedra'])
M('madeira_mov', lin('#e8d6c2'), .55, tex=T['madeira'])
M('deck', lin('#b59678'), .75, tex=T['madeira'])
M('tijolo', (1, 1, 1), .9, tex=T['tijolo'])
M('azulejo', (1, 1, 1), .35, tex=T['azulejo'])
M('grama', (1, 1, 1), 1, tex=T['grama'])
M('pedra_bancada', lin('#cfcbc2'), .35, tex=T['pedra'])
M('caminho_pedra', lin('#9b978e'), .8, tex=T['pedra'])
M('tecido_areia', lin('#cdbf9f'), 1)
M('tecido_moss', lin('#6b705c'), 1)
M('tecido_clay', lin('#b4572e'), 1)
M('tecido_linho', lin('#e6dfd0'), 1)
M('terra_escura', lin('#544340'), .55, .15)
M('forro', lin('#f5f5f3'), .95)
M('cobertura', lin('#3f3230'), .8)
M('ceramica', lin('#f7f7f5'), .18)
M('metal', lin('#b9b6ae'), .35, .9)
M('preto', lin('#26211f'), .5, .2)
M('vidro', lin('#cfe0dd'), .05, 0, alpha=.22, double=True)
M('espelho', lin('#dfe7e6'), .03, .6, alpha=.55, double=True)
M('folha_moss', lin('#6b705c'), 1)
M('folha_escura', lin('#4c5242'), 1)
M('folha_clara', lin('#8a9070'), 1)
M('tronco', lin('#544340'), .9)
M('luz', lin('#f5ecd2'), .5, emissive=(1.0, .88, .62))

# ---------- cena ----------
H, TW = 2.70, .16
root = g.node('MOSARQ_Casa_EstudoConceitual', extras=dict(rotulo='Estudo conceitual', unidade='m', alturaPeDireito=H,
                                                          planta=dict(largura=12, profundidade=8)))
grp = {k: g.node(k, root) for k in ['01_Terreno', '02_Estrutura', '03_Cobertura', '04_Esquadrias', '05_Mobiliario_Sala',
                                     '05_Mobiliario_CozinhaJantar', '05_Mobiliario_Suite', '05_Mobiliario_Banheiro',
                                     '06_Deck', '07_Paisagismo', '08_Cameras']}

def wall(geo, mat, axis, fixed, a0, a1, ops=(), t=TW):
    """axis 'x': parede ao longo de X em z=fixed; 'z': ao longo de Z em x=fixed. ops=(centro,larg,peitoril,verga)."""
    def seg(p0, p1, y0, y1):
        if p1 - p0 < 1e-4 or y1 - y0 < 1e-4: return
        c = (((p0 + p1) / 2, (y0 + y1) / 2, fixed) if axis == 'x' else (fixed, (y0 + y1) / 2, (p0 + p1) / 2))
        s = ((p1 - p0, y1 - y0, t) if axis == 'x' else (t, y1 - y0, p1 - p0))
        geo.box(mat, c, s, tile=2)
    cur = a0
    for c, w, s, hd in sorted(ops):
        a, b = c - w / 2, c + w / 2
        seg(cur, a, 0, H); seg(a, b, 0, s); seg(a, b, hd, H); cur = b
    seg(cur, a1, 0, H)

# openings (centro, largura, peitoril, verga)
OPS = dict(
    N=[(-3.0, 1.6, 1.2, 2.2)],
    S=[(-2.7, 3.5, 0.0, 2.3), (0.2, 0.9, 0.0, 2.1), (3.45, 2.0, 0.9, 2.2)],
    W=[(1.0, 1.6, 0.9, 2.2)],
    E=[(1.5, 1.6, 0.9, 2.1), (-2.8, 0.6, 1.5, 2.1)],
    D=[(1.2, 0.9, 0.0, 2.1)],      # divisória social/íntima (x=1)
    B=[(3.0, 0.8, 0.0, 2.1)],      # parede do banheiro (z=-1.6)
)
# ---- 01 Terreno
gt = g.obj('Terreno_Gramado', grp['01_Terreno'], group='terreno', role='terreno', clip=False)
gt.box('grama', (0, -.09, 0), (44, .1, 44), tile=4, clip=False)
for i, (x, z) in enumerate([(0.3, 7.2), (-0.4, 8.5), (0.5, 9.8), (-0.2, 11.1), (0.4, 12.4)]):
    gt.box('caminho_pedra', (x, -.03, z), (1.0, .04, .55), tile=1, clip=False)
gl = g.obj('Laje_Fundacao', grp['02_Estrutura'], group='estrutura', role='estrutura', clip=False)
gl.box('piso_pedra', (0, -.05, 0), (12.4, .1, 8.4), tile=2, clip=False)

# ---- 02 Estrutura
gw = g.obj('Paredes', grp['02_Estrutura'], group='estrutura', role='parede')
wall(gw, 'paredes', 'x', -4, -6.08, 6.08, OPS['N'])
wall(gw, 'paredes', 'x', 4, -6.08, 6.08, OPS['S'])
wall(gw, 'paredes', 'z', -6, -3.92, 3.92, OPS['W'])
wall(gw, 'paredes', 'z', 6, -3.92, 3.92, OPS['E'])
wall(gw, 'paredes', 'z', 1, -3.92, 3.92, OPS['D'])
wall(gw, 'paredes', 'x', -1.6, 1.08, 5.92, OPS['B'])
gc = g.obj('Revestimentos_Fachada', grp['02_Estrutura'], group='estrutura', role='decor', clip=False)
gc.box('tijolo', (-5.22, 1.35, 4.105), (1.7, 2.7, .05), tile=1.5, clip=False)          # painel de tijolo na fachada
gc.box('tijolo', (5.22, 1.35, 4.105), (1.5, 2.7, .05), tile=1.5, clip=False)
gf = g.obj('Pisos', grp['02_Estrutura'], group='estrutura', role='decor', clip=False)
gf.box('piso_madeira', (-2.5, .01, 1.8), (6.84, .02, 4.24), tile=1.2, clip=False)      # sala
gf.box('piso_pedra', (-2.5, .01, -2.1), (6.84, .02, 3.64), tile=1.2, clip=False)       # cozinha/jantar
gf.box('piso_madeira', (3.5, .01, 1.2), (4.84, .02, 5.44), tile=1.2, clip=False)       # suíte
gf.box('azulejo', (3.5, .01, -2.8), (4.84, .02, 2.24), tile=1.0, clip=False)           # banheiro
gf.box('azulejo', (-3.3, 1.05, -3.91), (4.8, .3, .02), tile=0.6, clip=False)           # frontão da bancada
gf.box('azulejo', (2.3, 1.25, -3.91), (1.5, .9, .02), tile=0.6, clip=False)            # parede do lavatório

# ---- 03 Cobertura (laje plana com beiral)
gr = g.obj('Laje_Cobertura', grp['03_Cobertura'], group='cobertura', role='cobertura')
gr.box('cobertura', (0, H + .09, .3), (12.7, .18, 8.9), tile=3, clip=False)
gr.box('forro', (0, H - .01, 0), (11.84, .02, 7.84), tile=2, clip=False)

# ---- 04 Esquadrias
def esq(name, axis, fixed, c, w, s, hd, mull=False, door=False):
    o = g.obj(name, grp['04_Esquadrias'], group='esquadria', role='esquadria', clip=False)
    a, b, fr, d = c - w / 2, c + w / 2, .06, .10
    def bar(p0, p1, y0, y1):
        ctr = (((p0 + p1) / 2, (y0 + y1) / 2, fixed) if axis == 'x' else (fixed, (y0 + y1) / 2, (p0 + p1) / 2))
        sz = ((p1 - p0, y1 - y0, d) if axis == 'x' else (d, y1 - y0, p1 - p0))
        o.box('terra_escura', ctr, sz, clip=False)
    bar(a, a + fr, s, hd); bar(b - fr, b, s, hd); bar(a, b, hd - fr, hd)
    if s > 0: bar(a, b, s, s + fr)
    if mull: bar(c - fr / 2, c + fr / 2, s, hd)
    y0, y1 = (s + fr if s > 0 else 0.0), hd - fr
    ctr = (c, (y0 + y1) / 2, fixed) if axis == 'x' else (fixed, (y0 + y1) / 2, c)
    sz = (w - 2 * fr, y1 - y0, .012) if axis == 'x' else (.012, y1 - y0, w - 2 * fr)
    o.box('vidro', ctr, sz, clip=False)
    return o
esq('Janela_Cozinha_N', 'x', -4, *OPS['N'][0])
esq('Porta_Janela_Sala_S', 'x', 4, *OPS['S'][0], mull=True)
esq('Janela_Suite_S', 'x', 4, *OPS['S'][2])
esq('Janela_Sala_O', 'z', -6, *OPS['W'][0])
esq('Janela_Suite_L', 'z', 6, *OPS['E'][0])
esq('Janela_Banheiro_L', 'z', 6, *OPS['E'][1])
gd = g.obj('Portas', grp['04_Esquadrias'], group='esquadria', role='porta')
gd.box('terra_escura', (-.25 + .02, 1.05, 3.45), (.04, 2.1, .9), clip=True)   # entrada, aberta para dentro
gd.box('madeira_mov', (1.53, 1.05, 0.75 + .02), (.9, 2.1, .04), clip=True)    # suíte, aberta para a suíte
gd.box('madeira_mov', (3.8, 1.05, -1.72), (.9, 2.1, .04), clip=True)          # banheiro: porta de correr, aberta, rente à parede

# ---- helpers de mobiliário
def furn(name, parent, pos, group, fn, role='mobiliario'):
    o = g.obj(name, grp[parent], pos=pos, group=group, role=role); fn(o); return o

def chair(o, cx, cz, back):   # back = -1 / +1 (sinal em z do encosto)
    o.box('madeira_mov', (cx, .45, cz), (.44, .05, .44), clip=True)
    for dx in (-.19, .19):
        for dz in (-.19, .19): o.box('terra_escura', (cx + dx, .21, cz + dz), (.04, .42, .04), clip=True)
    o.box('madeira_mov', (cx, .74, cz + back * .20), (.44, .45, .04), clip=True)

# ---- 05 Sala
def f_sofa(o):
    o.rbox('tecido_areia', (0, .21, 0), (2.2, .42, .9), .05)
    o.rbox('tecido_linho', (-.5, .49, -.04), (.98, .14, .7), .05, clip=False); o.rbox('tecido_linho', (.5, .49, -.04), (.98, .14, .7), .05, clip=False)
    o.rbox('tecido_areia', (0, .66, .33), (2.2, .48, .24), .06)
    for sx in (-1, 1): o.rbox('tecido_areia', (sx * 1.02, .55, 0), (.16, .26, .9), .04, clip=False)
    o.rbox('tecido_clay', (-.8, .66, -.06), (.45, .38, .14), .05, clip=False)
    o.rbox('tecido_moss', (.8, .66, -.06), (.45, .38, .14), .05, clip=False)
furn('Sofa', '05_Mobiliario_Sala', (-3.2, 0, 1.95), 'sala', f_sofa)
def f_mesa_centro(o):
    o.rbox('pedra_bancada', (0, .17, 0), (.9, .34, .4), .03); o.rbox('madeira_mov', (0, .375, 0), (1.1, .05, .6), .02)
furn('Mesa_de_Centro', '05_Mobiliario_Sala', (-3.2, 0, .7), 'sala', f_mesa_centro)
furn('Tapete_Sala', '05_Mobiliario_Sala', (-3.2, 0, 1.2), 'sala', lambda o: o.box('tecido_linho', (0, .026, 0), (3.0, .012, 2.4), clip=False), role='decor')
def f_poltrona(o):
    o.rbox('tecido_clay', (0, .2, 0), (.8, .4, .8), .06); o.rbox('tecido_clay', (-.33, .5, 0), (.14, .5, .8), .05)
    o.rbox('tecido_clay', (.02, .45, 0), (.6, .12, .66), .04, clip=False)
furn('Poltrona', '05_Mobiliario_Sala', (-5.0, 0, .5), 'sala', f_poltrona)
def f_estante(o):
    o.box('madeira_mov', (0, 1.0, 0), (.4, 2.0, 1.8), tile=1)
    for y in (.5, 1.0, 1.5): o.box('terra_escura', (.01, y, 0), (.4, .02, 1.78), clip=False)
    for i, (y, c) in enumerate([(.62, 'tecido_moss'), (1.12, 'tecido_clay'), (1.62, 'tecido_linho')]):
        o.box(c, (.06, y, -.4 + i * .35), (.22, .22, .2), clip=False)
furn('Estante', '05_Mobiliario_Sala', (-5.72, 0, -.5), 'sala', f_estante)
def f_planta(o):
    o.cyl('terra_escura', (0, .2, 0), .22, .4, seg=20, rt=.2); o.sph('folha_moss', (0, .78, 0), .35, .45, .35, clip=True)
    o.sph('folha_clara', (.12, 1.0, .05), .22, .28, .22, clip=False)
furn('Planta_Vaso_Sala', '05_Mobiliario_Sala', (-5.35, 0, 3.4), 'sala', f_planta)
def f_luminaria(o):
    o.cyl('metal', (0, .8, 0), .018, 1.6, seg=10); o.cyl('metal', (0, .02, 0), .16, .04, seg=20)
    o.cyl('luz', (0, 1.62, 0), .2, .26, seg=24, rt=.15, clip=True, caps=False)
furn('Luminaria_Piso', '05_Mobiliario_Sala', (-4.75, 0, 2.95), 'sala', f_luminaria)

# ---- 05 Cozinha / Jantar
def f_bancada(o):
    o.rbox('madeira_mov', (0, .43, 0), (4.8, .86, .6), .02, tile=1)
    o.box('pedra_bancada', (0, .88, .01), (4.84, .04, .64), tile=1, clip=False)
    o.box('metal', (-1.5, .905, 0), (.55, .01, .4), clip=False)                       # cuba
    o.box('preto', (-.3, .905, 0), (.6, .01, .44), clip=False)                        # cooktop
    for i in range(4): o.cyl('metal', (-.46 + i * .21, .915, 0), .045, .01, seg=14, clip=False)
    o.cyl('metal', (-1.5, 1.08, -.2), .015, .32, seg=8, clip=False)                   # torneira
furn('Bancada_Cozinha', '05_Mobiliario_CozinhaJantar', (-3.3, 0, -3.62), 'cozinha', f_bancada)
def f_aereo(o):
    o.box('madeira_mov', (0, 1.85, 0), (1.45, .7, .35), tile=1)
    for i in range(2): o.box('terra_escura', (-.3 + i * .6, 1.85, .18), (.02, .5, .01), clip=False)
furn('Armario_Aereo', '05_Mobiliario_CozinhaJantar', (-5.0, 0, -3.72), 'cozinha', f_aereo)
def f_gel(o):
    o.rbox('metal', (0, .9, 0), (.7, 1.8, .7), .03); o.box('preto', (-.22, 1.0, .355), (.02, .8, .01), clip=False)
furn('Geladeira', '05_Mobiliario_CozinhaJantar', (-5.5, 0, -2.85), 'cozinha', f_gel)
def f_mesa(o):
    o.box('madeira_mov', (0, .73, 0), (2.0, .05, 1.0), tile=1)
    for sx in (-1, 1): o.box('pedra_bancada', (sx * .7, .35, 0), (.15, .7, .8), tile=1)
    o.cyl('madeira_mov', (0, .76, 0), .12, .02, seg=16, clip=False)
    o.sph('folha_moss', (0, .92, 0), .13, .2, .13, clip=False)
furn('Mesa_de_Jantar', '05_Mobiliario_CozinhaJantar', (-3.0, 0, -1.9), 'cozinha', f_mesa)
def f_cadeiras(o):
    for cx in (-.5, .5):
        chair(o, cx, -.88 , -1)   # lado norte (encosto ao norte)
        chair(o, cx, .88 , 1)     # lado sul
furn('Cadeiras_Jantar', '05_Mobiliario_CozinhaJantar', (-3.0, 0, -1.9), 'cozinha', f_cadeiras)
def f_pendente(o):
    o.cyl('preto', (0, 2.25, 0), .008, .9, seg=6, clip=False); o.sph('luz', (0, 1.78, 0), .17, .15, .17, clip=False)
furn('Pendente_A', '05_Mobiliario_CozinhaJantar', (-3.5, 0, -1.9), 'cozinha', f_pendente, role='decor')
furn('Pendente_B', '05_Mobiliario_CozinhaJantar', (-2.5, 0, -1.9), 'cozinha', f_pendente, role='decor')

# ---- 05 Suíte
def f_cama(o):
    o.rbox('madeira_mov', (0, .15, 0), (2.2, .3, 1.7), .03)
    o.rbox('tecido_linho', (-.02, .4, 0), (2.1, .2, 1.6), .06)
    o.box('tecido_moss', (1.05, .425, 0), (.1, .85, 1.9), clip=True)                      # cabeceira (alinhada ao peitoril: 0,85 < 0,90)
    o.rbox('tecido_clay', (-.45, .515, 0), (.6, .03, 1.62), .01, clip=False)              # manta
    for z in (-.4, .4): o.rbox('tecido_linho', (.7, .56, z), (.4, .12, .6), .05, clip=False)
furn('Cama_Casal', '05_Mobiliario_Suite', (4.8, 0, 1.5), 'suite', f_cama)
def f_criado(o):
    o.rbox('madeira_mov', (0, .23, 0), (.4, .46, .4), .02); o.cyl('luz', (0, .62, 0), .09, .18, seg=16, rt=.06, clip=False)
furn('Criado_Mudo_A', '05_Mobiliario_Suite', (5.7, 0, .33), 'suite', f_criado)
furn('Criado_Mudo_B', '05_Mobiliario_Suite', (5.7, 0, 2.67), 'suite', f_criado)
def f_armario(o):
    o.box('madeira_mov', (0, 1.1, 0), (1.3, 2.2, .6), tile=1)
    for i in range(2): o.box('terra_escura', (-.32 + i * .64, 1.05, .31), (.02, 1.9, .01), clip=False)
furn('Guarda_Roupa', '05_Mobiliario_Suite', (1.8, 0, -1.22), 'suite', f_armario)
furn('Banco_Pe_Cama', '05_Mobiliario_Suite', (3.3, 0, 1.5), 'suite',
     lambda o: (o.rbox('tecido_areia', (0, .22, 0), (.4, .44, 1.2), .04), o.box('madeira_mov', (0, .02, 0), (.3, .04, 1.1), clip=False)))
furn('Tapete_Suite', '05_Mobiliario_Suite', (4.3, 0, 1.5), 'suite', lambda o: o.box('tecido_areia', (0, .026, 0), (2.6, .012, 2.2), clip=False), role='decor')

# ---- 05 Banheiro
def f_lavatorio(o):
    o.rbox('madeira_mov', (0, .4, 0), (1.4, .8, .5), .02, tile=1)
    o.box('pedra_bancada', (0, .82, 0), (1.44, .04, .54), tile=1, clip=False)
    o.rbox('ceramica', (-.25, .87, 0), (.5, .1, .36), .05, clip=False)
    o.cyl('metal', (-.25, .97, -.2), .012, .2, seg=8, clip=False)
    o.box('espelho', (0, .87 + .85, -.235), (1.2, .9, .02), clip=False)
furn('Lavatorio_Bancada', '05_Mobiliario_Banheiro', (2.3, 0, -3.65), 'banheiro', f_lavatorio)
def f_bacia(o):
    o.rbox('ceramica', (0, .2, .06), (.38, .4, .5), .06); o.rbox('ceramica', (0, .6, -.16), (.38, .4, .2), .04)
furn('Bacia_Sanitaria', '05_Mobiliario_Banheiro', (4.2, 0, -3.6), 'banheiro', f_bacia)
def f_box(o):
    o.box('pedra_bancada', (0, .015, 0), (1.1, .03, 1.1), tile=1, clip=False)
    o.box('vidro', (-.55, 1.0, 0), (.012, 2.0, 1.1), clip=False); o.box('vidro', (0, 1.0, .55), (1.1, 2.0, .012), clip=False)
    o.cyl('metal', (.5, 2.0, 0), .08, .02, seg=18, clip=False); o.cyl('metal', (.54, 1.5, 0), .012, 1.0, seg=8, clip=False)
furn('Box_Chuveiro', '05_Mobiliario_Banheiro', (5.35, 0, -2.45), 'banheiro', f_box, role='decor')
furn('Toalheiro', '05_Mobiliario_Banheiro', (1.6, 0, -2.7), 'banheiro',
     lambda o: (o.box('tecido_linho', (-.03, 1.2, 0), (.03, .5, .35), clip=False), o.cyl('metal', (-.06, 1.2, 0), .008, .6, seg=6, clip=False)), role='decor')

# ---- 06 Deck
gdk = g.obj('Deck_Madeira', grp['06_Deck'], group='deck', role='deck')
gdk.box('deck', (0, .03, 5.09), (10.4, .06, 2.02), tile=1.2)
for x in np.linspace(-5, 5, 6): gdk.box('terra_escura', (x, -.02, 5.09), (.08, .06, 1.9), clip=False)
def f_banco_deck(o):
    o.rbox('madeira_mov', (0, .22, 0), (2.2, .44, .45), .03); o.box('terra_escura', (0, .02, 0), (2.0, .04, .38), clip=False)
furn('Banco_Deck', '06_Deck', (-2.7, .06, 5.5), 'deck', f_banco_deck)
def f_mesa_deck(o):
    o.cyl('madeira_mov', (0, .72, 0), .45, .04, seg=28); o.cyl('terra_escura', (0, .35, 0), .05, .7, seg=14)
    o.cyl('terra_escura', (0, .02, 0), .3, .04, seg=24)
furn('Mesa_Lateral_Deck', '06_Deck', (2.6, .06, 5.3), 'deck', f_mesa_deck)
for i, x in enumerate((1.7, 3.5)):
    furn(f'Cadeira_Deck_{i+1}', '06_Deck', (x, .06, 5.9), 'deck',
         lambda o: (o.rbox('tecido_moss', (0, .3, 0), (.6, .06, .6), .02), o.rbox('tecido_moss', (0, .6, .3), (.6, .55, .08), .03),
                    [o.box('terra_escura', (dx, .15, dz), (.05, .3, .05)) for dx in (-.25, .25) for dz in (-.25, .25)]))

# ---- 07 Paisagismo
def tree(name, x, z, hh, r, mat='folha_moss'):
    def f(o):
        o.cyl('tronco', (0, hh * .25, 0), .14, hh * .5, seg=14, rt=.1)
        o.sph(mat, (0, hh * .62, 0), r, r * .85, r, seg=18, rings=12)
        o.sph('folha_clara', (r * .45, hh * .78, r * .2), r * .55, r * .5, r * .55, seg=14, rings=8, clip=False)
    furn(name, '07_Paisagismo', (x, -.04, z), 'paisagismo', f, role='paisagismo')
tree('Arvore_01', -9.0, 2.0, 5.2, 1.7); tree('Arvore_02', 9.2, 1.0, 4.6, 1.5, 'folha_escura')
tree('Arvore_03', 8.5, -6.5, 5.5, 1.8); tree('Arvore_04', -8.6, -6.0, 4.4, 1.4, 'folha_escura')
tree('Arvore_05', -9.2, 8.5, 3.8, 1.3); tree('Arvore_06', 9.5, 9.0, 4.2, 1.5)
def shrub(name, x, z, r, mat):
    furn(name, '07_Paisagismo', (x, -.04, z), 'paisagismo', lambda o: o.sph(mat, (0, r * .8, 0), r, r * .8, r, seg=14, rings=8), role='paisagismo')
for i, (x, z, r, m) in enumerate([(-6.8, 5.0, .6, 'folha_moss'), (-7.5, 6.2, .5, 'folha_clara'), (6.9, 5.0, .55, 'folha_escura'),
                                  (7.9, 6.4, .65, 'folha_moss'), (-6.9, -3.5, .7, 'folha_escura'), (7.0, -3.2, .6, 'folha_moss'),
                                  (-2.0, 9.0, .5, 'folha_clara'), (2.4, 10.0, .55, 'folha_moss'), (-3.4, 11.5, .6, 'folha_escura'), (3.6, 12.2, .5, 'folha_moss')]):
    shrub(f'Arbusto_{i+1:02d}', x, z, r, m)
furn('Canteiro_Fachada', '07_Paisagismo', (0, -.04, 6.9), 'paisagismo',
     lambda o: (o.rbox('pedra_bancada', (-3.6, .15, 0), (3.4, .3, .6), .04), o.rbox('pedra_bancada', (3.9, .15, 0), (2.4, .3, .6), .04),
                [o.sph('folha_moss', (-3.6 + i * .65, .55, 0), .3, .28, .3, seg=10, rings=6, clip=False) for i in range(-2, 3)],
                [o.sph('folha_clara', (3.9 + i * .6, .52, 0), .26, .24, .26, seg=10, rings=6, clip=False) for i in range(-1, 2)]), role='paisagismo')

# ---- 08 Cameras (as 5 vistas do tour + geral)
CAMS = [
    ('cam_geral',          'Visão geral',            (14.0, 9.0, 15.0), (0.0, 1.2, 0.5), 35),
    ('cam_sala',           'Sala de estar',          (-0.55, 1.6, 3.3), (-4.2, 0.9, 0.9), 62),
    ('cam_cozinha_jantar', 'Cozinha e jantar',       (-0.55, 1.6, -0.6), (-3.8, 0.9, -3.0), 62),
    ('cam_suite',          'Suíte',                  (1.55, 1.6, 3.45), (4.9, 0.7, 1.2), 62),
    ('cam_banheiro',       'Banheiro',               (1.55, 1.6, -2.3), (4.4, 0.9, -3.4), 62),
    ('cam_jardim',         'Jardim e deck',          (0.9, 1.7, 10.5), (-0.5, 1.0, 4.2), 50),
]
cam_nodes = []
for nm, label, p, tg, fov in CAMS:
    ci = g.camera(nm, fov)
    cam_nodes.append(g.node(nm, grp['08_Cameras'], t=p, q=lookat_quat(p, tg), camera=ci,
                            extras=dict(ambiente=label, alvo=list(tg), pos=list(p))))

# ---------- verificação ----------
def world_boxes(o):
    return [(lo + o['pos'], hi + o['pos']) for lo, hi in o['geo'].boxes]
EPS = .003
def inter(a, b):
    d = np.minimum(a[1], b[1]) - np.maximum(a[0], b[0]); return bool((d > EPS).all())
objs = g.objects
solid = [o for o in objs if o['role'] in ('mobiliario', 'parede', 'porta', 'deck', 'paisagismo') and o['geo'].boxes]
col = []
for i, a in enumerate(solid):
    for b in solid[i + 1:]:
        if a['role'] == 'parede' and b['role'] in ('parede',): continue
        if a['role'] == 'deck' and b['role'] in ('mobiliario',) and b['pos'][1] > .05: continue   # mobília sobre o deck: apoio, não colisão
        if b['role'] == 'deck' and a['role'] in ('mobiliario',) and a['pos'][1] > .05: continue
        if {a['role'], b['role']} == {'deck', 'parede'}: continue
        hit = [(x, y) for x in world_boxes(a) for y in world_boxes(b) if inter(x, y)]
        if hit: col.append((a['name'], b['name']))
cam_issues = []
blockers = [(lo, hi) for o in solid if o['role'] != 'paisagismo' for lo, hi in world_boxes(o)] + \
           [(lo, hi) for o in solid if o['role'] == 'paisagismo' for lo, hi in world_boxes(o)]
for nm, label, p, tg, fov in CAMS:
    P = v3(*p)
    for lo, hi in blockers:
        if ((P > lo - .20) & (P < hi + .20)).all(): cam_issues.append((nm, 'dentro/junto de geometria'))
    if nm not in ('cam_geral', 'cam_jardim'):
        inside = abs(P[0]) < 5.92 and abs(P[2]) < 3.92 and 0.3 < P[1] < H - .2
        if not inside: cam_issues.append((nm, 'fora do volume interno'))
extras = dict(titulo='MOSARQ — Casa (estudo conceitual)', rotulo='Estudo conceitual', unidades='metros',
              eixos='Y para cima; +Z = frente/sul', coleccoes=list(grp.keys()),
              cameras=[c[0] for c in CAMS], pe_direito=H, espessura_paredes=TW)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
size = g.finalize(OUT, [root], extras)
tris = sum(g.accessors[pr['indices']]['count'] // 3 for m in g.meshes for pr in m['primitives'])
rep = dict(arquivo='assets/models/mosarq-casa.glb', bytes=size, kb=round(size / 1024, 1), triangulos=tris,
           nos=len(g.nodes), malhas=len(g.meshes), materiais=len(g.materials), texturas=len(g.textures),
           colisoes_mobiliario=col, problemas_camera=cam_issues,
           cameras={c[0]: dict(ambiente=c[1], pos=c[2], alvo=c[3], fov=c[4]) for c in CAMS})
json.dump(rep, open(os.path.join(ROOT, 'docs', 'glb-relatorio.json'), 'w'), ensure_ascii=False, indent=2)
print(json.dumps({k: rep[k] for k in ('kb', 'triangulos', 'nos', 'malhas', 'materiais', 'texturas', 'colisoes_mobiliario', 'problemas_camera')}, ensure_ascii=False, indent=1))
