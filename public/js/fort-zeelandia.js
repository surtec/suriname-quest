checkAuth()
toonSpelerBalk()

var LOCATIE_ID = 'fort_zeelandia'
var TOTAAL     = 4

;(function(){
  const CW=600,CH=450
  let cv,cx,running=false,aid
  let ksScore,ksLevens,ksTimer,ksIv,ships,balls,lastSpawn
  function mkShip(){
    const types=[{e:'⛵',w:50,h:40},{e:'🚢',w:60,h:44}]
    const t=types[Math.floor(Math.random()*types.length)]
    const y=50+Math.random()*120
    const spd=1.5+Math.random()*1.5+(35-(ksTimer||35))*0.05
    return{x:CW+t.w,y,vx:-spd,...t,hit:false,hitT:0}
  }
  function drawBg(){
    const sky=cx.createLinearGradient(0,0,0,CH*0.65)
    sky.addColorStop(0,'#0a1520');sky.addColorStop(1,'#1a3010')
    cx.fillStyle=sky;cx.fillRect(0,0,CW,CH*0.65)
    const sea=cx.createLinearGradient(0,CH*0.65,0,CH)
    sea.addColorStop(0,'#0a2040');sea.addColorStop(1,'#061228')
    cx.fillStyle=sea;cx.fillRect(0,CH*0.65,CW,CH*0.35)
    cx.strokeStyle='rgba(72,120,220,0.1)';cx.lineWidth=1
    for(let y=CH*0.68;y<CH;y+=18){cx.beginPath();cx.moveTo(0,y);cx.lineTo(CW,y);cx.stroke()}
    cx.fillStyle='#3a2810';cx.fillRect(0,CH-52,CW,52)
    cx.fillStyle='#4a3820'
    for(let x=0;x<CW;x+=30){cx.fillRect(x,CH-64,22,12)}
    cx.save();cx.translate(CW/2,CH-60)
    cx.fillStyle='#7a6030';cx.beginPath();cx.ellipse(0,0,18,12,0,0,Math.PI*2);cx.fill()
    cx.fillStyle='#4a4030';cx.fillRect(-6,-24,12,24);cx.restore()
  }
  function init(){
    cv=document.getElementById('kanonCanvas')
    cv.width=CW;cv.height=CH;cx=cv.getContext('2d')
    drawBg()
    cx.fillStyle='rgba(0,0,0,0.5)';cx.fillRect(0,0,CW,CH)
    cx.fillStyle='#f0e6c8';cx.font='bold 15px Nunito,sans-serif';cx.textAlign='center'
    cx.fillText('Klik ▶ Speel! om te starten',CW/2,CH/2-10)
    cx.font='13px Nunito,sans-serif';cx.fillStyle='rgba(244,196,48,0.7)'
    cx.fillText('Klik op vijandelijke schepen! ⛵',CW/2,CH/2+16)
  }
  window.startKanonSpel=function(){
    ksScore=0;ksLevens=3;ksTimer=35;ships=[];balls=[];lastSpawn=0
    document.getElementById('ks-score').textContent=ksScore
    document.getElementById('ks-levens').textContent='❤️❤️❤️'
    document.getElementById('ks-timer').textContent=ksTimer
    document.getElementById('ks-start-btn').disabled=true
    document.getElementById('kanonspel-klaar').style.display='none'
    cv.addEventListener('pointerdown',onClick)
    ksIv=setInterval(()=>{
      ksTimer--;document.getElementById('ks-timer').textContent=ksTimer
      if(ksTimer<=0)stopKanon()
    },1000)
    running=true;aid=requestAnimationFrame(loop)
  }
  function onClick(e){
    if(!running)return
    const r=cv.getBoundingClientRect()
    const mx=(e.clientX-r.left)*(CW/r.width),my=(e.clientY-r.top)*(CH/r.height)
    ships.forEach(s=>{
      if(s.hit)return
      if(mx>s.x-s.w/2&&mx<s.x+s.w/2&&my>s.y-s.h/2&&my<s.y+s.h/2){
        s.hit=true;s.hitT=22;ksScore+=10
        document.getElementById('ks-score').textContent=ksScore;speelGeluid('hit')
      }
    })
    balls.push({x:CW/2,y:CH-60,tx:mx,ty:my,done:false})
  }
  function loop(){
    if(!running)return
    const now=performance.now()
    const gap=Math.max(1000,2800-(35-ksTimer)*55)
    if(now-lastSpawn>gap){ships.push(mkShip());lastSpawn=now}
    ships.forEach(s=>{if(!s.hit)s.x+=s.vx;if(s.hitT>0)s.hitT--})
    const escaped=ships.filter(s=>s.x<-70&&!s.hit)
    if(escaped.length){
      escaped.forEach(s=>ships.splice(ships.indexOf(s),1))
      ksLevens=Math.max(0,ksLevens-escaped.length);speelGeluid('mis')
      document.getElementById('ks-levens').textContent='❤️'.repeat(ksLevens)+'🖤'.repeat(3-ksLevens)
      if(ksLevens<=0){stopKanon();return}
    }
    ships=ships.filter(s=>!(s.hit&&s.hitT<=0)&&s.x>-110)
    balls.forEach(b=>{const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy);if(d<8)b.done=true;else{b.x+=dx/d*9;b.y+=dy/d*9}})
    balls=balls.filter(b=>!b.done&&b.y>0)
    drawBg()
    cx.fillStyle='rgba(255,255,200,0.9)'
    balls.forEach(b=>{cx.beginPath();cx.arc(b.x,b.y,5,0,Math.PI*2);cx.fill()})
    ships.forEach(s=>{
      cx.save();cx.font=s.h+'px serif';cx.textAlign='center';cx.textBaseline='middle'
      if(s.hitT>0){
        cx.globalAlpha=0.6+0.4*Math.sin(s.hitT);cx.fillText('💥',s.x,s.y)
        if(s.hitT===18){cx.font='bold 16px Fredoka One,cursive';cx.globalAlpha=1;cx.fillStyle='rgba(244,196,48,0.95)';cx.fillText('+10',s.x,s.y-32)}
      } else cx.fillText(s.e,s.x,s.y)
      cx.restore()
    })
    cx.fillStyle='rgba(0,0,0,0.3)';cx.fillRect(0,0,CW,30)
    cx.fillStyle='#f0e6c8';cx.font='bold 13px Fredoka One,cursive';cx.textAlign='center'
    cx.fillText('⏱️ '+ksTimer+'s',CW/2-70,21)
    cx.fillText('💥 '+ksScore,CW/2,21)
    cx.fillText('❤️'.repeat(Math.max(0,ksLevens))+'🖤'.repeat(Math.max(0,3-ksLevens)),CW/2+65,21)
    aid=requestAnimationFrame(loop)
  }
  function stopKanon(){
    speelGeluid('klaar');running=false;cancelAnimationFrame(aid);clearInterval(ksIv)
    cv.removeEventListener('pointerdown',onClick)
    const msg=ksScore>=80?`🏆 ${ksScore} pts — Fort verdedigd!`:ksScore>=40?`🎉 ${ksScore} pts — Goed gevochten!`:`⚔️ ${ksScore} pts — Oefenen maar!`
    document.getElementById('ksk-score').textContent=msg
    document.getElementById('kanonspel-klaar').style.display='block'
    document.getElementById('ks-start-btn').disabled=false
  }
  window.resetKanonSpel=function(){document.getElementById('kanonspel-klaar').style.display='none';window.startKanonSpel()}
  init()
})()
