import {chromium} from '/opt/npm-tools/node_modules/playwright/index.mjs';
const [a,b2]=[+process.argv[2],+process.argv[3]];const W=1920,H=1080,FPS=30,OUT=process.argv[4];
const b=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--no-sandbox']});
const p=await b.newPage({viewport:{width:W,height:H}});p.on('pageerror',e=>console.log('PE',e.message));
await p.goto(`http://localhost:8770/anim.html?w=${W}&h=${H}`);await p.waitForFunction('window.ready',null,{timeout:180000});
for(let f=a;f<b2;f++){await p.evaluate(t=>window.renderAt(t),f/FPS);await p.locator('#c').screenshot({path:`${OUT}/f${String(f).padStart(4,'0')}.png`});if(f%30==0)console.log('frame',f)}
await b.close();console.log('done',a,b2);
