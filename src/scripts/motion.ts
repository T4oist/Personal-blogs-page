// Native, scoped effects. Aborting the page stops observers, listeners and frames.
export function setupMotion(signal: AbortSignal) {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let userPaused = false;
  try { userPaused = localStorage.getItem('motion') === 'paused'; } catch {}
  const paused = () => userPaused || reduced.matches;
  const toggle = document.querySelector<HTMLButtonElement>('[data-motion-toggle]');
  const canvas = document.querySelector<HTMLCanvasElement>('#curiosity-field');
  const ctx = canvas?.getContext('2d');
  const field = document.querySelector<HTMLElement>('[data-art-field]');
  const heroType = document.querySelector<HTMLElement>('[data-hero-type]');
  const ribbons = Array.from(document.querySelectorAll<HTMLElement>('[data-scroll-type]'));
  let frame = 0, scrollFrame = 0, visible = true;
  let width = 0, height = 0, angle = .35, lastTime = 0;
  let pointerX = 0, pointerY = 0, easedX = 0, easedY = 0;
  let ink = '', paper = '';
  const xLabel = document.querySelector('[data-coordinate-x]');
  const yLabel = document.querySelector('[data-coordinate-y]');

  function draw() {
    if (!ctx || !canvas) return;
    ctx.clearRect(0,0,width,height);
    const mobile = width < 680;
    const cx = width * (mobile ? .69 : .73) + easedX * 18;
    const cy = height * (mobile ? .66 : .51) + easedY * 12;
    const radius = Math.min(height * (mobile ? .23 : .44), width * .27);
    // A receding ground plane, clipped away from the text.
    ctx.save();
    ctx.beginPath();
    ctx.rect(mobile ? 0 : width*.43, mobile ? height*.52 : 0,width,height);
    ctx.clip();
    ctx.strokeStyle = ink;
    ctx.lineWidth = .65;
    ctx.globalAlpha = .22;
    for (let i=-12;i<=12;i++) {
      ctx.beginPath(); ctx.moveTo(cx+i*12,cy-25);
      ctx.lineTo(cx+i*110,height+100); ctx.stroke();
    }
    for (let i=0;i<12;i++) {
      const y=cy-25 + Math.pow(i/11,2)*(height-cy+130);
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(width,y); ctx.stroke();
    }
    ctx.restore();
    // Rotated latitude / longitude sphere, with a gently breathing silhouette.
    const project = (u:number,v:number) => {
      const ripple = 1+.045*Math.sin(u*5+angle*3)*Math.sin(v*3+angle);
      const x = radius*ripple*Math.sin(v)*Math.cos(u);
      const y = radius*ripple*Math.cos(v);
      const z = radius*ripple*Math.sin(v)*Math.sin(u);
      const turn = angle + easedX*.8;
      const tilt = -.4 + easedY*.45;
      const rx=x*Math.cos(turn)+z*Math.sin(turn);
      const rz=-x*Math.sin(turn)+z*Math.cos(turn);
      const ry=y*Math.cos(tilt)-rz*Math.sin(tilt);
      const depth=y*Math.sin(tilt)+rz*Math.cos(tilt);
      const scale=550/(550-depth);
      return [cx+rx*scale,cy+ry*scale];
    };
    ctx.fillStyle=paper;
    ctx.beginPath(); ctx.ellipse(cx,cy,radius*1.07,radius*1.07,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle=ink; ctx.lineWidth=.75; ctx.globalAlpha=.8;
    for(let ring=1;ring<22;ring++) {
      ctx.beginPath();
      for(let segment=0;segment<=96;segment++) {
        const [x,y]=project(segment/96*Math.PI*2,ring/22*Math.PI);
        segment ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha=.35;
    for(let ring=0;ring<20;ring++) {
      ctx.beginPath();
      for(let segment=0;segment<=64;segment++) {
        const [x,y]=project(ring/20*Math.PI*2,segment/64*Math.PI);
        segment ? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha=1;
  }
  function tick(time:number) {
    frame=0;
    if (signal.aborted || paused() || !visible || document.hidden || !ctx) return;
    angle += Math.min(time-lastTime || 16,40)*.00013;
    lastTime=time;
    easedX+=(pointerX-easedX)*.045;
    easedY+=(pointerY-easedY)*.045;
    draw();
    frame=requestAnimationFrame(tick);
  }
  function start() {
    if(!frame && !paused() && visible && !document.hidden && ctx) frame=requestAnimationFrame(tick);
  }
  function scrollEffects() {
    scrollFrame=0;
    if(paused()) return;
    if(heroType) {
      const y=Math.min(scrollY,700);
      heroType.style.transform=`translateY(${y*.075}px) scaleY(${1-y*.00015})`;
    }
    ribbons.forEach(ribbon=>{
      const rect=ribbon.parentElement!.getBoundingClientRect();
      if(rect.bottom>0 && rect.top<innerHeight) ribbon.style.transform=`translateX(${-(innerHeight-rect.top)*.13}px)`;
    });
  }
  const sync = () => {
    root.classList.toggle('motion-paused',paused());
    if(toggle) {
      toggle.disabled=reduced.matches;
      toggle.setAttribute('aria-pressed',String(paused()));
      const label=reduced.matches ? '已遵循系统减少动态效果设置' : paused() ? '开启动效' : '暂停动态效果';
      toggle.setAttribute('aria-label',label); toggle.title=label;
      toggle.querySelector('span')!.textContent=paused() ? '▷' : 'Ⅱ';
    }
    cancelAnimationFrame(frame); frame=0;
    if(paused()) {
      if(heroType) heroType.style.transform='';
      ribbons.forEach(ribbon=>ribbon.style.transform='');
      easedX=0; easedY=0; draw();
    } else { scrollEffects(); start(); }
  };
  toggle?.addEventListener('click',()=>{
    userPaused=!userPaused;
    try { localStorage.setItem('motion',userPaused?'paused':'active'); } catch {}
    sync();
  },{signal});
  reduced.addEventListener('change',sync,{signal});
  document.addEventListener('visibilitychange',()=>{ cancelAnimationFrame(frame); frame=0; start(); },{signal});
  window.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(scrollEffects);},{signal,passive:true});
  const colors = () => {
    const css=getComputedStyle(root);
    ink=css.getPropertyValue('--c-text').trim();
    paper=css.getPropertyValue('--c-bg').trim();
    draw();
  };
  window.addEventListener('theme-change',colors,{signal});
  const resize = new ResizeObserver(()=>{
    if(!canvas || !field || !ctx) return;
    width=field.clientWidth; height=field.clientHeight;
    const dpr=Math.min(devicePixelRatio || 1,2);
    canvas.width=Math.round(width*dpr); canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0); draw();
  });
  if(field) resize.observe(field);
  const inView = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.target===field) { visible=entry.isIntersecting; if(visible) start(); else {cancelAnimationFrame(frame);frame=0;} }
      else if(entry.isIntersecting) {entry.target.classList.add('is-revealed');inView.unobserve(entry.target);}
    });
  },{threshold:.08});
  if(field) inView.observe(field);
  document.querySelectorAll('[data-reveal]').forEach(el=>inView.observe(el));
  field?.addEventListener('pointermove',event=>{
    if(paused() || !fine.matches) return;
    const rect=field.getBoundingClientRect();
    pointerX=(event.clientX-rect.left)/rect.width*2-1;
    pointerY=(event.clientY-rect.top)/rect.height*2-1;
    if(xLabel)xLabel.textContent=pointerX.toFixed(2);
    if(yLabel)yLabel.textContent=pointerY.toFixed(2);
  },{signal,passive:true});
  field?.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0;},{signal});

  document.querySelectorAll<HTMLElement>('[data-work-row]').forEach(row=>{
    row.addEventListener('pointermove',event=>{
      if(paused() || !fine.matches) return;
      const rect=row.getBoundingClientRect();
      row.style.setProperty('--preview-x',`${Math.max(140,Math.min(rect.width-140,event.clientX-rect.left))}px`);
    },{signal,passive:true});
  });
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach(link=>{
    const reset=()=>{link.style.removeProperty('--magnet-x');link.style.removeProperty('--magnet-y');};
    link.addEventListener('pointermove',event=>{
      if(paused() || !fine.matches) return;
      const rect=link.getBoundingClientRect();
      link.style.setProperty('--magnet-x',`${((event.clientX-rect.left)/rect.width-.5)*28}px`);
      link.style.setProperty('--magnet-y',`${((event.clientY-rect.top)/rect.height-.5)*28}px`);
    },{signal,passive:true});
    link.addEventListener('pointerleave',reset,{signal});
    toggle?.addEventListener('click',reset,{signal});
  });
  const scrambles = new Map<HTMLElement,number>();
  document.querySelectorAll<HTMLElement>('[data-scramble]').forEach(label=>{
    const original=label.textContent || '';
    const restore=()=>{clearInterval(scrambles.get(label));scrambles.delete(label);label.textContent=original;};
    label.parentElement?.addEventListener('pointerenter',()=>{
      if(paused() || !fine.matches) return;
      restore(); let step=0;
      const alphabet='01<>/{}';
      scrambles.set(label,window.setInterval(()=>{
        if(paused() || step>=original.length) {restore();return;}
        label.textContent=original.split('').map((char,i)=>i<step?char:alphabet[Math.floor(Math.random()*alphabet.length)]).join('');
        step+=.7;
      },36));
    },{signal});
    label.parentElement?.addEventListener('pointerleave',restore,{signal});
    signal.addEventListener('abort',restore,{once:true});
  });
  colors(); sync();
  signal.addEventListener('abort',()=>{
    cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame);
    resize.disconnect(); inView.disconnect();
  },{once:true});
}
