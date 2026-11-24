import * as THREE from 'https://esm.sh/three@0.181.2';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const rooms={living:{title:'Sala de estar',focus:[-2.9,.9,1.1],camera:[-.4,3.5,6.8]},kitchen:{title:'Cozinha e jantar',focus:[-3,.8,-2.5],camera:[-.1,4.1,.2]},bedroom:{title:'Suíte',focus:[3.5,.7,1],camera:[5.7,3.2,5.8]},bath:{title:'Banheiro',focus:[4.5,.7,-2.8],camera:[3.8,4.5,.8]},garden:{title:'Jardim',focus:[0,0,4.9],camera:[8,5,12]}};
const shared={};
function setup(host,hero){
 const scene=new THREE.Scene();scene.background=new THREE.Color(hero?'#d1bea6':'#dcd9ce');
 const camera=new THREE.PerspectiveCamera(38,1,.1,100);
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.setClearColor(scene.background);
 host.prepend(renderer.domElement);host.classList.add('ready');
 renderer.domElement.setAttribute('role','img');renderer.domElement.setAttribute('aria-label',hero?'Planta arquitetônica que se transforma em residência tridimensional':'Residência tridimensional com ambientes selecionáveis');
 scene.add(new THREE.HemisphereLight(0xfff8ea,0x767868,2.3));
 const sun=new THREE.DirectionalLight(0xffe9cd,2.5);sun.position.set(-7,12,9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16});scene.add(sun);
 const mat=(color,roughness=.85)=>new THREE.MeshStandardMaterial({color,roughness});
 const m={paper:mat('#ede7da'),stone:mat('#bdb09b'),moss:mat('#747865'),clay:mat('#a84e36'),wood:mat('#9d7453'),glass:new THREE.MeshPhysicalMaterial({color:'#91b0a7',transparent:true,opacity:.48,roughness:.15,metalness:.1,side:THREE.DoubleSide}),dark:mat('#45483c'),ground:mat('#919774')};
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
   const edge=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(obj.scale.x||obj.geometry.parameters.width,.01,obj.geometry.parameters.depth)),lineMaterial);
   edge.position.set(obj.position.x,-.44,obj.position.z);scene.add(edge)
  }
 }
 const camFrom=new THREE.Vector3(12,12,15),lookFrom=new THREE.Vector3(),look=new THREE.Vector3();
 let selection='overview',started=performance.now(),frame=0,visible=false,finished=false;
 camera.position.set(12,12,15);
 function select(room){if(!rooms[room])return;camFrom.copy(camera.position);lookFrom.copy(look);selection=room;started=performance.now();finished=false;draw()}
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
for(const [selector,hero] of [['.draft',true],['.scene',false]]){
 const host=document.querySelector(selector);if(!host)continue;
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){observer.disconnect();try{setup(host,hero)}catch(error){console.warn('WebGL indisponível',error)}}},{rootMargin:'200px'});observer.observe(host)
}