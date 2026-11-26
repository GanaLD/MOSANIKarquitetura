import * as THREE from 'https://esm.sh/three@0.181.2';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const rooms={living:{title:'Sala de estar',focus:[-2.9,.9,1.1],camera:[-.4,3.5,6.8]},kitchen:{title:'Cozinha e jantar',focus:[-3,.8,-2.5],camera:[-.1,4.1,.2]},bedroom:{title:'Suíte',focus:[3.5,.7,1],camera:[5.7,3.2,5.8]},bath:{title:'Banheiro',focus:[4.5,.7,-2.8],camera:[3.8,4.5,.8]},garden:{title:'Jardim',focus:[0,0,4.9],camera:[8,5,12]}};
const brand=getComputedStyle(document.documentElement);
const token=name=>brand.getPropertyValue(name).trim();
function setup(host,hero){
 const scene=new THREE.Scene();scene.background=new THREE.Color(hero?'#d1bea6':'#dcd9ce');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.setClearColor(scene.background);
 host.prepend(renderer.domElement);host.classList.add('ready');
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',hero?'Planta arquitetônica que se transforma em residência tridimensional':'Residência tridimensional com ambientes selecionáveis');
 scene.add(new THREE.HemisphereLight(0xfff8ea,0x767868,2.3));
 const sun=new THREE.DirectionalLight(0xffe9cd,2.5);sun.position.set(-7,12,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16});scene.add(sun);
 const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 const m={paper:mat(token('--paper')),stone:mat('#bdb09b'),moss:mat(token('--moss')),clay:mat(token('--clay')),wood:mat('#9d7453'),glass:new THREE.MeshPhysicalMaterial({color:'#91b0a7',transparent:true,opacity:.48,roughness:.15,metalness:.1,side:THREE.DoubleSide}),dark:mat('#45483c'),ground:mat('#919774')};
 const elements=[];let index=0;
 function box(group,name,x,z,w,d,h,material,y=0){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m[material]);mesh.position.set(x,y+h/2,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=name;mesh.userData={group,order:index++,fullY:mesh.position.y,fullHeight:h};scene.add(mesh);elements.push(mesh);return mesh
 }
 box('site','Terreno',0,0,18,14,.12,'ground',-.4);box('base','Fundação',0,0,12,8,.22,'stone',-.22);
 const wall=(name,x,z,w,d,h=2.7,y=0)=>box('walls',name,x,z,w,d,h,'paper',y);
 wall('Parede norte',0,-4,12,.16);wall('Oeste',-6,0,.16,8);wall('Leste',6,0,.16,8);
 wall('Fachada lateral',-5,4,2,.16);wall('Fachada entrada',1,4,2,.16);wall('Fachada lateral direita',5.3,4,1.4,.16);wall('Verga da fachada',0,4,12,.16,.45,2.3);
 wall('Separação social e íntima',1,-2.3,.16,3.4);wall('Divisão da suíte',1,2.2,.16,3.6);
 wall('Banheiro A',2,-1.6,2,.16);wall('Banheiro B',4.8,-1.6,2.4,.16);
 box('frames','Janela principal',-2.7,4,3.5,.07,2.2,'glass',.2);box('frames','Janela da suíte',3.45,4,2,.07,2.2,'glass',.2);
 box('roof','Cobertura plana',0,0,12.7,8.7,.22,'moss',2.7);
 box('garden','Deck',0,5.15,10,1.9,.12,'wood',-.15);
 for(const [x,z] of [[-7,-4],[-7,2],[7,-3],[7,3]]){box('land','Tronco',x,z,.24,.24,1.5,'wood',-.2);box('land','Copa',x,z,1.4,1.4,1.4,'moss',1.3)}
 box('living','Tapete',-2.8,1.25,3.6,2.5,.035,'stone');box('living','Sofá',-3.5,1,1.1,2.2,.45,'moss');box('living','Encosto do sofá',-4,1,.2,2.2,.44,'moss',.45);box('living','Mesa de centro',-1.9,1.4,.8,1,.38,'wood');
 box('kitchen','Bancada',-3,-3.4,4.8,1,.9,'wood');box('kitchen','Pedra da bancada',-3,-3.4,4.9,1.05,.05,'stone',.9);box('kitchen','Mesa de jantar',-2.7,-1.3,2,1,.75,'wood');
 box('bedroom','Base da cama',3.65,.8,1.7,2.2,.37,'wood');box('bedroom','Colchão',3.65,.8,1.7,2.2,.21,'paper',.37);box('bedroom','Manta',3.65,1.43,1.72,.7,.06,'clay',.58);
 box('bath','Lavatório',5.4,-2.9,.9,.9,.85,'stone');box('bath','Bacia',3.5,-3.3,.55,.7,.44,'paper');
 if(hero){
  box('desk','Mesa de trabalho',0,0,45,30,.24,'wood',-.61);
  box('desk','Papel da planta',0,0,17,12,.025,'paper',-.47);
  const ruler=box('desk','Escalímetro',-2,6,7,.35,.12,'stone',-.44);ruler.rotation.y=-.12;
  const pencil=box('desk','Lapiseira',8,1,.08,4,.09,'dark',-.43);pencil.rotation.y=.28;
  const lineMaterial=new THREE.LineBasicMaterial({color:0x606e5d});
  for(const obj of elements.filter(o=>o.userData.group==='walls')){
   const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(obj.geometry.parameters.width,.01,obj.geometry.parameters.depth)),lineMaterial);
   edge.position.set(obj.position.x,-.44,obj.position.z);scene.add(edge)
  }
 }
 const camFrom=new THREE.Vector3(12,12,15),lookFrom=new THREE.Vector3(),look=new THREE.Vector3();
 let selection=hero?'overview':'living',started=performance.now(),frame=0,visible=false,finished=false;
 camera.position.set(12,12,15);
 function select(room){if(!rooms[room])return;cancelAnimationFrame(frame);camFrom.copy(camera.position);lookFrom.copy(look);selection=room;started=performance.now();finished=false;draw()}
 if(!hero){document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.room)))}
 function draw(now=performance.now()){
  if(!visible)return;frame=0;
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();
  const duration=hero?6500:1700;
  const t=reduced.matches?1:Math.min(1,(now-started)/duration);
  const ease=t*t*(3-2*t);
  if(hero){camera.position.set(8+5*ease,20-11*ease,17-3*ease);camera.lookAt(0,.2,0)}
  else{const target=rooms[selection];const end=target?target.camera:[12,12,15],focus=target?target.focus:[0,0,0];
   camera.position.lerpVectors(camFrom,new THREE.Vector3(...end),ease);camera.position.y+=Math.sin(Math.PI*t)*3;
   look.lerpVectors(lookFrom,new THREE.Vector3(...focus),ease);camera.lookAt(look)}
  const stages={site:.70,base:.12,walls:.25,frames:.45,roof:.58,garden:.67,land:.72,desk:0};
  for(const o of elements){
   const {group,order,fullY,fullHeight}=o.userData;
   let amount=1;o.visible=true;
   if(hero&&group!=='desk')amount=THREE.MathUtils.clamp((t-(stages[group]??.48))/.2,0,1);
   if(!hero&&selection!=='overview'){
    if(group==='roof'||group==='walls'||group==='frames')o.visible=false;
    if(group===selection) {const q=THREE.MathUtils.clamp((t-.32-(order%4)*.045)/.42,0,1);amount=1+1.8*(q-1)**3+.8*(q-1)**2}
   }
   o.scale.y=Math.max(.001,amount);o.position.y=fullY+(amount-1)*fullHeight/2;if(amount<=0)o.visible=false
  }
  renderer.render(scene,camera);finished=t>=1;
  if(!finished)frame=requestAnimationFrame(draw)
 }
 const schedule=()=>{if(visible){cancelAnimationFrame(frame);frame=requestAnimationFrame(draw)}};
 const size=new ResizeObserver(schedule);size.observe(host);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible)schedule();else cancelAnimationFrame(frame)});intersection.observe(host);
 renderer.domElement.addEventListener('webglcontextlost',()=>{visible=false;size.disconnect();intersection.disconnect();renderer.dispose();renderer.domElement.remove();host.classList.remove('ready')},{once:true})
}

/* ---------- Tour 3D com modelo GLB (estudo conceitual) ---------- */
const GLB_URL=new URL('./models/mosarq-casa.glb',import.meta.url).href;
const CAM_BY_ROOM={living:'cam_sala',kitchen:'cam_cozinha_jantar',bedroom:'cam_suite',bath:'cam_banheiro',garden:'cam_jardim'};
async function tourGLB(host){
 const base='https://esm.sh/three@0.181.2/examples/jsm/';
 const [{GLTFLoader},{RoomEnvironment}]=await Promise.all([import(base+'loaders/GLTFLoader.js'),import(base+'environments/RoomEnvironment.js')]);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.NeutralToneMapping;renderer.toneMappingExposure=.82;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene();scene.background=new THREE.Color('#dfe4de');
 const pmrem=new THREE.PMREMGenerator(renderer);const envTex=pmrem.fromScene(new RoomEnvironment(),.04).texture;scene.environment=envTex;scene.environmentIntensity=.6;
 scene.add(new THREE.HemisphereLight(0xfff8ea,0x8a8474,.7));
 const sun=new THREE.DirectionalLight(0xffe9cd,1.9);sun.position.set(-8,14,10);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;
 Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:50});scene.add(sun);
 const gltf=await new GLTFLoader().loadAsync(GLB_URL);
 scene.add(gltf.scene);
 const cams={};gltf.scene.traverse(o=>{
  if(o.isCamera)cams[o.name]=o;
  if(o.isMesh){const t=o.material&&o.material.transparent;o.castShadow=!t;o.receiveShadow=true;if(t)o.renderOrder=2}
 });
 gltf.scene.updateMatrixWorld(true);
 const camera=new THREE.PerspectiveCamera(60,1,.05,200);
 const pose=name=>{const c=cams[name];const p=new THREE.Vector3(),q=new THREE.Quaternion();c.getWorldPosition(p);c.getWorldQuaternion(q);return {p,q,fov:c.fov}};
 let from=pose('cam_sala'),to=from,started=0,anim=false,visible=false,frame=0,yaw=0,pitch=0,dragging=false,lastX=0,lastY=0;
 camera.position.copy(from.p);camera.quaternion.copy(from.q);camera.fov=from.fov;
 const cur={p:from.p.clone(),q:from.q.clone(),fov:from.fov};
 const look=new THREE.Quaternion(),eY=new THREE.Euler(0,0,0,'YXZ');
 function select(room){
  const name=CAM_BY_ROOM[room];if(!name||!cams[name])return;
  from={p:cur.p.clone(),q:cur.q.clone(),fov:cur.fov};to=pose(name);yaw=0;pitch=0;
  started=performance.now();anim=!reduced.matches;if(!anim){cur.p.copy(to.p);cur.q.copy(to.q);cur.fov=to.fov}
  request()
 }
 function request(){if(visible&&!frame)frame=requestAnimationFrame(tick)}
 function tick(now){
  frame=0;if(!visible)return;
  const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  if(anim){
   const t=Math.min(1,(now-started)/1500),e=t*t*(3-2*t);
   cur.p.lerpVectors(from.p,to.p,e);cur.q.slerpQuaternions(from.q,to.q,e);cur.fov=THREE.MathUtils.lerp(from.fov,to.fov,e);
   if(t>=1)anim=false
  }
  camera.position.copy(cur.p);camera.fov=cur.fov;
  eY.set(pitch,yaw,0);look.setFromEuler(eY);camera.quaternion.copy(cur.q).multiply(look);
  camera.updateProjectionMatrix();renderer.render(scene,camera);
  if(anim||dragging)request()
 }
 const el=renderer.domElement;el.style.touchAction='pan-y';el.style.cursor='grab';
 el.setAttribute('role','img');el.setAttribute('aria-label','Residência em 3D, estudo conceitual. Use os botões para trocar de ambiente; arraste para olhar ao redor.');
 el.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;el.setPointerCapture(e.pointerId);el.style.cursor='grabbing'});
 el.addEventListener('pointermove',e=>{if(!dragging)return;yaw=THREE.MathUtils.clamp(yaw+(e.clientX-lastX)*-.004,-.7,.7);pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*-.003,-.35,.35);lastX=e.clientX;lastY=e.clientY;request()});
 const end=()=>{dragging=false;el.style.cursor='grab'};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
 document.querySelectorAll('[data-room]').forEach(b=>b.addEventListener('click',()=>select(b.dataset.room)));
 host.prepend(el);host.classList.add('ready');
 const size=new ResizeObserver(request);size.observe(host);
 const io=new IntersectionObserver(([en])=>{visible=en.isIntersecting;if(visible)request();else{cancelAnimationFrame(frame);frame=0}});io.observe(host);
 const dispose=()=>{visible=false;cancelAnimationFrame(frame);size.disconnect();io.disconnect();scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{for(const k in m){if(m[k]&&m[k].isTexture)m[k].dispose()}m.dispose()})}});envTex.dispose();pmrem.dispose();renderer.dispose()};
 el.addEventListener('webglcontextlost',()=>{dispose();el.remove();host.classList.remove('ready');try{setup(host,false)}catch(err){console.warn('WebGL indisponível',err)}},{once:true});
 addEventListener('pagehide',dispose,{once:true});
 visible=true;request();return true
}

for(const [selector,hero] of [['.draft',true],['.scene',false]]){
 const host=document.querySelector(selector);if(!host)continue;
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){observer.disconnect();const fallback=()=>{try{setup(host,hero)}catch(error){console.warn('WebGL indisponível',error)}};
   if(hero)fallback();else tourGLB(host).catch(error=>{console.warn('Modelo GLB indisponível; usando cena procedural',error);host.classList.remove('ready');host.querySelector('canvas')?.remove();fallback()})}},{rootMargin:'200px'});observer.observe(host)
}
