checkAuth()
toonSpelerBalk()

var LOCATIE_ID = 'inheemsen_dorp'
var TOTAAL     = 4

;(function(){
  const CW=600,CH=450
  const PADS=[{x:118,y:165},{x:300,y:142},{x:482,y:165},{x:118,y:315},{x:300,y:338},{x:482,y:315}]
  const FISH=[{e:'🐟',pts:10,dur:1500},{e:'🐠',pts:15,dur:1100},{e:'🦐',pts:20,dur:900}]
  let cv,cx,running=false,aid
  let vsScore,vsTimer,vsIv,pads,lastSpawn
  function mkP(p){return{...p,r:54,fish:null,t:0,maxT:0,pop:0,flash:0,fpts:0}}
  function bg(){
    const g=cx.createLinearGradient(0,0,0,CH)
    g.addColorStop(0,'#04200b');g.addColorStop(1,'#07350f')
    cx.fillStyle=g;cx.fillRect(0,0,CW,CH)
    cx.strokeStyle='rgba(34,197,94,0.07)';cx.lineWidth=1
    for(let y=22;y<CH;y+=28){cx.beginPath();cx.moveTo(0,y);cx.lineTo(CW,y);cx.stroke()}
  }
  function drawPad(p){
    cx.save();cx.beginPath();cx.ellipse(p.x,p.y,p.r,p.r*0.55,0,0,Math.PI*2)
    cx.fillStyle=p.fish?'rgba(22,163,74,0.45)':'rgba(10,80,30,0.55)'
    cx.strokeStyle=p.fish?'rgba(74,222,128,0.65)':'rgba(20,100,50,0.5)'
    cx.lineWidth=2;cx.fill();cx.stroke();cx.restore()
    if(p.fish&&p.pop>0.05){
      cx.save();cx.translate(p.x,p.y-p.r*0.25)
      cx.scale(Math.min(1,p.pop),Math.min(1,p.pop))
      cx.font='26px serif';cx.textAlign='center';cx.textBaseline='middle'
      cx.fillText(p.fish.e,0,0);cx.restore()
    }
    if(p.flash>0){
      cx.save();cx.font='bold 15px sans-serif'
      cx.fillStyle=`rgba(244,196,48,${p.flash/25})`
      cx.textAlign='center';cx.fillText('+'+p.fpts,p.x,p.y-p.r-10);cx.restore()
      p.flash--
    }
  }
  function init(){
    cv=document.getElementById('visCanvas')
    cv.width=CW;cv.height=CH;cx=cv.getContext('2d')
    bg()
    cx.fillStyle='rgba(0,0,0,0.48)';cx.fillRect(0,0,CW,CH)
    cx.fillStyle='#f0e6c8';cx.font='bold 15px Nunito,sans-serif';cx.textAlign='center'
    cx.fillText('Klik ▶ Vissen! om te starten',CW/2,CH/2-10)
    cx.font='13px Nunito,sans-serif';cx.fillStyle='rgba(74,222,128,0.7)'
    cx.fillText('Klik op vissen om ze te vangen 🐟',CW/2,CH/2+16)
  }
  window.startVisSpel=function(){
    vsScore=0;vsTimer=35;pads=PADS.map(mkP);lastSpawn=0
    document.getElementById('vs-score').textContent=vsScore
    document.getElementById('vs-timer').textContent=vsTimer
    document.getElementById('vs-start-btn').disabled=true
    document.getElementById('visspel-klaar').style.display='none'
    cv.addEventListener('pointerdown',clickFish)
    vsIv=setInterval(()=>{
      vsTimer--;document.getElementById('vs-timer').textContent=vsTimer
      if(vsTimer<=0)stopVis()
    },1000)
    running=true;aid=requestAnimationFrame(loop)
  }
  function clickFish(e){
    if(!running)return
    const r=cv.getBoundingClientRect()
    const mx=(e.clientX-r.left)*(CW/r.width),my=(e.clientY-r.top)*(CH/r.height)
    pads.forEach(p=>{
      if(!p.fish||p.flash>0)return
      if(Math.hypot(mx-p.x,my-p.y)<p.r+10){
        p.fpts=p.fish.pts;p.flash=25;p.pop=0;p.fish=null
        vsScore+=p.fpts;document.getElementById('vs-score').textContent=vsScore;speelGeluid('hit')
      }
    })
  }
  function loop(){
    if(!running)return
    const now=performance.now()
    const gap=Math.max(650,1600-(35-vsTimer)*22)
    if(now-lastSpawn>gap){
      const free=pads.filter(p=>!p.fish&&p.flash<=0)
      if(free.length){
        const p=free[Math.floor(Math.random()*free.length)]
        const ft=FISH[Math.floor(Math.random()*FISH.length)]
        p.fish=ft;p.t=0;p.maxT=ft.dur+Math.random()*400;p.pop=0;lastSpawn=now
      }
    }
    pads.forEach(p=>{
      if(p.fish){p.t+=16;p.pop=Math.min(1.1,p.pop+0.09);if(p.t>=p.maxT){p.fish=null;p.pop=0}}
    })
    bg();pads.forEach(drawPad)
    cx.fillStyle='rgba(0,0,0,0.28)';cx.fillRect(0,0,CW,30)
    cx.fillStyle='#f0e6c8';cx.font='bold 14px Fredoka One,cursive';cx.textAlign='center'
    cx.fillText('⏱️ '+vsTimer+'s',CW/2-55,21);cx.fillText('🎣 '+vsScore,CW/2+55,21)
    if(vsTimer<=8){cx.fillStyle=`rgba(239,68,68,${0.15+0.12*Math.sin(Date.now()/150)})`;cx.fillRect(0,0,CW,CH)}
    aid=requestAnimationFrame(loop)
  }
  function stopVis(){
    speelGeluid('klaar');running=false;cancelAnimationFrame(aid);clearInterval(vsIv)
    cv.removeEventListener('pointerdown',clickFish)
    const msg=vsScore>=120?`🏆 ${vsScore} pts — Geweldig visser!`:vsScore>=70?`🎉 ${vsScore} pts — Goed gedaan!`:`🐟 ${vsScore} pts — Oefenen maar!`
    document.getElementById('vsk-score').textContent=msg
    document.getElementById('visspel-klaar').style.display='block'
    document.getElementById('vs-start-btn').disabled=false
  }
  window.resetVisSpel=function(){document.getElementById('visspel-klaar').style.display='none';window.startVisSpel()}
  init()
})()
