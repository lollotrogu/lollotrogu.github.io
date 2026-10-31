import {useEffect,useRef} from 'react';

export function NeonDivider({lang,variant}:{lang:'it'|'en';variant:'motion'|'explore'}){
 const element=useRef<HTMLElement>(null);
 useEffect(()=>{
  const el=element.current!;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let visible=false,frame=0;
  const update=()=>{frame=0;if(!visible||reduce.matches)return;const box=el.getBoundingClientRect();const progress=Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height)));el.style.setProperty('--progress',String(progress));el.style.setProperty('--light-shift',`${(progress-.5)*160}px`);el.style.setProperty('--ring-turn',`${(progress-.5)*32}deg`)};
  const schedule=()=>{if(visible&&!frame)frame=requestAnimationFrame(update)};
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;el.dataset.active=String(visible);if(visible){el.classList.add('entered');schedule()}},{rootMargin:'100px'});
  observer.observe(el);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
  return()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule)};
 },[]);
 const motion=variant==='motion';
 const words=lang==='it'?(motion?['Dalla curiosità','al codice.']:['Studiare.','Sperimentare.']):(motion?['From curiosity','to code.']:['Keep learning.','Keep exploring.']);
 return <section ref={element} className={`neon-divider neon-${variant}`} data-active="false" aria-label={words.join(' ')}>
  <div className="neon-world" aria-hidden="true"><div className="neon-aura aura-cyan"/><div className="neon-aura aura-blue"/><div className="neon-grid"/><div className="neon-orbits">{Array.from({length:5},(_,i)=><i key={i} style={{'--index':i} as React.CSSProperties}/>)}</div><div className="neon-beam beam-one"/><div className="neon-beam beam-two"/><div className="neon-horizon"/><div className="neon-particles">{Array.from({length:12},(_,i)=><i key={i} style={{'--x':`${(i*31+7)%100}%`,'--y':`${(i*19+13)%100}%`,'--delay':`${-i*1.3}s`} as React.CSSProperties}/>)}</div></div>
  <div className="neon-copy"><span className="neon-kicker">{lang==='it'?(motion?'IMPARARE → COSTRUIRE':'IDEE IN MOVIMENTO'):(motion?'LEARNING → BUILDING':'IDEAS IN MOTION')}</span><h2><span>{words[0]}</span><span>{words[1]}</span></h2><div className="neon-caption"><i/>{lang==='it'?(motion?'Un passo alla volta. Un progetto alla volta.':'La prossima domanda è già un nuovo inizio.'):(motion?'One step at a time. One project at a time.':'The next question is a new beginning.')}</div></div>
  <div className="neon-edge" aria-hidden="true"><span>{motion?'01 / CONNECTING THE DOTS':'02 / ALWAYS CURIOUS'}</span><span>SCROLL TO EXPLORE ↓</span></div>
 </section>
}
