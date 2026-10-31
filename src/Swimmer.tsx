import {useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw} from 'lucide-react';

type V=[number,number,number];
const add=(a:V,b:V):V=>a.map((v,i)=>v+b[i]) as V;
const sub=(a:V,b:V):V=>a.map((v,i)=>v-b[i]) as V;
const mul=(a:V,n:number):V=>a.map(v=>v*n) as V;
const unit=(a:V):V=>mul(a,1/Math.max(1e-10,Math.hypot(...a)));
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
type Face={vertices:V[];color:string};

// Procedural 3D geometry, articulated in world coordinates and perspective-projected.
// Motion is illustrative, not a measured or clinically validated stroke.
export function Swimmer({lang}:{lang:'it'|'en'}){
 const canvas=useRef<HTMLCanvasElement>(null),host=useRef<HTMLDivElement>(null);
 const[paused,setPaused]=useState(false),[skeleton,setSkeleton]=useState(true);
 const state=useRef({paused:false,skeleton:true,yaw:-.38,pitch:.48,drag:false,lastX:0,lastY:0,time:0});
 state.current.paused=paused;state.current.skeleton=skeleton;
 useEffect(()=>{
  const el=canvas.current!,container=host.current!,ctx=el.getContext('2d')!;
  let w=600,h=450,raf=0,prev=0,visible=false,lastDraw=0,lastStaticKey="";
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const resize=new ResizeObserver(([e])=>{w=e.contentRect.width;h=Math.max(240,Math.min(520,w*.74));lastStaticKey="";const d=Math.min(devicePixelRatio,w<600?1.5:2);el.width=w*d;el.height=h*d;el.style.height=h+'px';ctx.setTransform(d,0,0,d,0,0)});resize.observe(container);
  const visibility=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting});visibility.observe(container);
  const project=(p:V)=>{const a=state.current.yaw,b=state.current.pitch;const x=p[0]*Math.cos(a)+p[2]*Math.sin(a),z=-p[0]*Math.sin(a)+p[2]*Math.cos(a);const y=p[1]*Math.cos(b)-z*Math.sin(b),depth=p[1]*Math.sin(b)+z*Math.cos(b);const scale=Math.min(w/5.5,h/4.1)*7/(7+depth);return {x:w/2+x*scale,y:h/2+y*scale,z:depth,scale}};
  const frame=(stamp:number)=>{
   raf=requestAnimationFrame(frame);const dt=prev?Math.min((stamp-prev)/1000,.05):0;prev=stamp;if(!visible||document.hidden)return;
   const st=state.current;
   const staticKey=[st.yaw,st.pitch,st.skeleton,w,h].join(':');
   const still=st.paused||reduce.matches;
   if(still&&lastStaticKey===staticKey)return;
   const interval=w<600?1000/30:1000/60;
   if(!still&&stamp-lastDraw<interval){st.time+=dt;return}
   lastDraw=stamp;lastStaticKey=still?staticKey:'';
   if(!still)st.time+=dt;
   const t=st.time*1.8,roll=Math.sin(t)*.17;
   const local=(p:V):V=>[p[0],p[1]*Math.cos(roll)-p[2]*Math.sin(roll),p[1]*Math.sin(roll)+p[2]*Math.cos(roll)];
   ctx.clearRect(0,0,w,h);
   const water=ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,w*.65);water.addColorStop(0,'#174e8f');water.addColorStop(1,'#071c39');ctx.fillStyle=water;ctx.fillRect(0,0,w,h);
   // Pool floor and lane markings in the same 3D scene.
   for(let x=-5;x<=5;x+=.5){const a=project([x,.8,-3]),b=project([x,.8,3]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(109,185,255,.09)';ctx.lineWidth=1;ctx.stroke()}
   for(let z=-3;z<=3;z+=.5){const a=project([-5,.8,z]),b=project([5,.8,z]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='rgba(109,185,255,.09)';ctx.stroke()}
   for(const z of [-1.8,1.8]){const a=project([-5,.65,z]),b=project([5,.65,z]);ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle='#68b4ff50';ctx.stroke();ctx.setLineDash([])}
   // Anatomical joints: alternating freestyle recovery/pull and flutter kick.
   const joints:V[]=[[1.12,0,0],[.66,0,-.34],[.66,0,.34],[-.42,0,-.22],[-.42,0,.22]];
   for(let side=0;side<2;side++){const p=t+side*Math.PI,z=side===0?-.34:.34;const shoulder:V=[.66,0,z];const elbow:V=[.66+.66*Math.cos(p),.46*Math.sin(p),z+(side===0?-.08:.08)];const wrist:V=[elbow[0]+.59*Math.cos(p+.26),elbow[1]+.38*Math.sin(p+.26),z+(side===0?-.14:.14)];joints.push(shoulder,elbow,wrist)}
   for(let side=0;side<2;side++){const z=side===0?-.22:.22,p=t*2+side*Math.PI;const hip:V=[-.42,0,z],knee:V=[-1.14,.16*Math.sin(p),z],ankle:V=[-1.89,.29*Math.sin(p+.3),z],toe:V=[-2.15,.29*Math.sin(p+.3)+.04,z];joints.push(hip,knee,ankle,toe)}
   const edges:[number,number][]=[[0,1],[0,2],[1,2],[1,3],[2,4],[3,4],[5,6],[6,7],[8,9],[9,10],[11,12],[12,13],[13,14],[15,16],[16,17],[17,18]];
   const faces:Face[]=[];
   const segment=(start:V,end:V,r1:number,r2:number,color:string)=>{const axis=unit(sub(end,start)),u=unit(cross(axis,Math.abs(axis[1])>.9?[1,0,0]:[0,1,0])),v=cross(axis,u);const rings=[start,end].map((center,ring)=>Array.from({length:12},(_,i)=>{const angle=i*Math.PI/6;return local(add(center,add(mul(u,Math.cos(angle)*(ring?r2:r1)),mul(v,Math.sin(angle)*(ring?r2:r1)))))}));for(let i=0;i<12;i++)faces.push({vertices:[rings[0][i],rings[0][(i+1)%12],rings[1][(i+1)%12],rings[1][i]],color})};
   const ellipsoid=(center:V,radii:V,color:string)=>{const point=(a:number,b:number):V=>local(add(center,[Math.cos(a)*Math.cos(b)*radii[0],Math.sin(a)*radii[1],Math.cos(a)*Math.sin(b)*radii[2]]));for(let lat=0;lat<8;lat++)for(let lon=0;lon<14;lon++){const a=-Math.PI/2+lat*Math.PI/8,b=lon*Math.PI/7;faces.push({vertices:[point(a,b),point(a+Math.PI/8,b),point(a+Math.PI/8,b+Math.PI/7),point(a,b+Math.PI/7)],color})}};
   ellipsoid([.14,0,0],[.76,.20,.35],'body');ellipsoid([-.46,0,0],[.22,.20,.26],'suit');segment([.72,0,0],[.98,0,0],.13,.13,'body');ellipsoid([1.18,-.02,0],[.27,.22,.23],'cap');
   for(const [a,b] of [[5,6],[6,7],[8,9],[9,10],[11,12],[12,13],[15,16],[16,17]] as [number,number][]){const leg=a>=11;segment(joints[a],joints[b],leg?.13:.085,leg?.085:.06,'body')}
   for(const i of [6,9,12,16])ellipsoid(joints[i],[.09,.09,.09],'body');for(const i of [7,10])ellipsoid(add(joints[i],[.08,0,0]),[.16,.045,.08],'body');for(const i of [13,17]){segment(joints[i],joints[i+1],.075,.035,'body')}
   const palette={body:[99,164,228],suit:[15,48,103],cap:[24,89,179]};
   faces.sort((a,b)=>b.vertices.reduce((s,v)=>s+project(v).z,0)/b.vertices.length-a.vertices.reduce((s,v)=>s+project(v).z,0)/a.vertices.length);
   for(const f of faces){const ps=f.vertices.map(project);const normal=unit(cross(sub(f.vertices[1],f.vertices[0]),sub(f.vertices[2],f.vertices[0])));const light=.58+Math.max(0,-normal[1]*.65-normal[2]*.5+normal[0]*.15)*.42;const base=palette[f.color as keyof typeof palette];ctx.beginPath();ps.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.fillStyle=`rgb(${base.map(v=>Math.round(v*light)).join(',')})`;ctx.fill();ctx.strokeStyle='rgba(135,197,255,.07)';ctx.lineWidth=.5;ctx.stroke()}
   // Goggles make the swimmer orientation legible.
   const eye1=project(local([1.3,-.16,-.15])),eye2=project(local([1.3,-.16,.15]));ctx.beginPath();ctx.moveTo(eye1.x,eye1.y);ctx.lineTo(eye2.x,eye2.y);ctx.strokeStyle='#9cdfff';ctx.lineWidth=5;ctx.stroke();
   if(st.skeleton){ctx.shadowBlur=4;ctx.shadowColor='#b1f5ff';for(const[a,b]of edges){const p=project(local(joints[a])),q=project(local(joints[b]));ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle='rgba(188,249,255,.88)';ctx.lineWidth=1.3;ctx.stroke()}joints.forEach(p=>{const q=project(local(p));ctx.beginPath();ctx.arc(q.x,q.y,3.1,0,Math.PI*2);ctx.fillStyle='#e0fbff';ctx.fill()});ctx.shadowBlur=0}
   // Small particles rise through the water, independently of the articulated model.
   for(let i=0;i<18;i++){const bx=((i*127.31)%w),by=h-((st.time*20+i*47)%h);ctx.beginPath();ctx.arc(bx+Math.sin(st.time+i)*8,by,1.5+i%3,0,Math.PI*2);ctx.strokeStyle='#a9daff28';ctx.lineWidth=1;ctx.stroke()}
  };raf=requestAnimationFrame(frame);
  return()=>{cancelAnimationFrame(raf);resize.disconnect();visibility.disconnect()};
 },[]);
 return <div className="swim-scene" ref={host}><div className="scene-label"><span><i/>AiSwimmingAnalyzer</span><span>3D MOTION STUDY</span></div><canvas ref={canvas} role="img" aria-label={lang==='it'?'Modello tridimensionale di un nuotatore a stile libero con grafo scheletrico animato':'Three-dimensional freestyle swimmer with an animated skeletal graph'} onPointerDown={e=>{state.current.drag=true;state.current.lastX=e.clientX;state.current.lastY=e.clientY;e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{const s=state.current;if(s.drag){s.yaw+=(e.clientX-s.lastX)*.008;s.pitch=Math.max(-.8,Math.min(1.2,s.pitch+(e.clientY-s.lastY)*.008));s.lastX=e.clientX;s.lastY=e.clientY}}} onPointerUp={()=>{state.current.drag=false}} onPointerCancel={()=>{state.current.drag=false}}/><div className="scene-controls"><button onClick={()=>setPaused(!paused)} aria-pressed={paused}>{paused?<Play size={15}/>:<Pause size={15}/>} {lang==='it'?(paused?'Riprendi':'Pausa'):(paused?'Play':'Pause')}</button><button onClick={()=>setSkeleton(!skeleton)} aria-pressed={skeleton}>{lang==='it'?'Scheletro':'Skeleton'} <span>{skeleton?'ON':'OFF'}</span></button><button onClick={()=>{state.current.yaw=-.38;state.current.pitch=.48}} aria-label={lang==='it'?'Ripristina vista':'Reset view'}><RotateCcw size={15}/></button></div><div className="scene-caption">{lang==='it'?'Trascina per ruotare · Movimento illustrativo, non dati di un atleta':'Drag to rotate · Illustrative motion, not athlete data'}</div></div>
}
