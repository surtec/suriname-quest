checkAuth()
toonSpelerBalk()

function naarSectie(naam) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('actief'))
  document.getElementById('page-' + naam).classList.add('actief')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

var LOCATIE_ID = 'plantage'
var TOTAAL     = 5

function showStreak(n) {
  const toast = document.getElementById('streak-toast')
  toast.textContent = n >= 5 ? '🔥 Perfecte reeks!' : `🔥 ${n} op rij goed!`
  toast.classList.add('show')
  setTimeout(() => toast.classList.remove('show'), 2000)
}

async function toonResultaat() {
  const el = document.getElementById('resultaat')
  el.style.display = 'block'
  el.scrollIntoView({ behavior: 'smooth', block: 'center' })

  let icon, titel, kleur, sterren
  if (score === TOTAAL) {
    icon = '🏆'; titel = 'Meester historicus!'; kleur = '#86efac'; sterren = '⭐⭐⭐⭐⭐'; launchConfetti()
  } else if (score >= 4) {
    icon = '🎉'; titel = 'Uitstekend!'; kleur = '#fbbf24'; sterren = '⭐⭐⭐⭐'
  } else if (score >= 3) {
    icon = '👍'; titel = 'Goed gedaan!'; kleur = '#fb923c'; sterren = '⭐⭐⭐'
  } else if (score >= 2) {
    icon = '💪'; titel = 'Bijna!'; kleur = '#fca5a5'; sterren = '⭐⭐'
  } else {
    icon = '📚'; titel = 'Lees het nog eens!'; kleur = '#f87171'; sterren = '⭐'
  }

  document.getElementById('resultaat-icon').textContent   = icon
  document.getElementById('resultaat-titel').style.color  = kleur
  document.getElementById('resultaat-titel').textContent  = titel
  document.getElementById('result-sterren').textContent   = sterren
  document.getElementById('resultaat-tekst').textContent  = `${score} van de ${TOTAAL} vragen goed`
  document.getElementById('resultaat-punten').textContent = `+${score * 100} punten!`

  try {
    const speler = await laadSpeler()
    if (!speler) return
    const quizResultaten = speler.quizResultaten || {}
    quizResultaten[LOCATIE_ID] = { score, totaal: TOTAAL, gespeeldOp: new Date().toISOString() }
    const voltooid = [...new Set([...(speler.completedLocations || []), LOCATIE_ID])]
    await slaVoortgangOp({
      quizResultaten,
      punten:             (speler.punten || 0) + score * 100,
      completedLocations: voltooid,
    })
    document.getElementById('player-points').textContent = ((speler.punten || 0) + score * 100) + ' punten'
  } catch (e) { console.error(e) }
}

;(function(){
  const CW=600,CH=410,GY=340,PX=100
  let cv,cx,running=false,aid
  let mlScore,mlLevens,mlTimer,mlIv,obstacles,ply,lastObs,gameSpd
  function mkObs(){
    const types=[{e:'⛓️',h:36},{e:'🌾',h:40},{e:'🪓',h:32}]
    const t=types[Math.floor(Math.random()*types.length)]
    return{x:CW+30,y:GY-t.h+12,w:28,...t,passed:false}
  }
  function drawBg(){
    const sky=cx.createLinearGradient(0,0,0,GY)
    sky.addColorStop(0,'#1a0c00');sky.addColorStop(1,'#3a1a05')
    cx.fillStyle=sky;cx.fillRect(0,0,CW,GY)
    cx.fillStyle='#3a2010';cx.fillRect(0,GY,CW,CH-GY)
    cx.fillStyle='#4a2a18';cx.fillRect(0,GY,CW,5)
    cx.fillStyle='rgba(20,8,0,0.7)'
    for(let i=0;i<6;i++){cx.fillRect(48+i*95,GY-126,14,126);cx.beginPath();cx.arc(55+i*95,GY-130,31,0,Math.PI*2);cx.fill()}
  }
  function init(){
    cv=document.getElementById('marronCanvas')
    cv.width=CW;cv.height=CH;cx=cv.getContext('2d')
    drawBg()
    cx.fillStyle='rgba(0,0,0,0.5)';cx.fillRect(0,0,CW,CH)
    cx.fillStyle='#f0e6c8';cx.font='bold 15px Nunito,sans-serif';cx.textAlign='center'
    cx.fillText('Klik ▶ Loop! om te starten',CW/2,CH/2-10)
    cx.font='13px Nunito,sans-serif';cx.fillStyle='rgba(248,113,113,0.8)'
    cx.fillText('SPATIE of tik het scherm om te springen!',CW/2,CH/2+16)
  }
  function doJump(){if(ply&&ply.onGround){ply.vy=-12;ply.onGround=false;speelGeluid('spring')}}
  window.startMarronSpel=function(){
    mlScore=0;mlLevens=3;mlTimer=40;obstacles=[];lastObs=0;gameSpd=3.5
    ply={y:GY,vy:0,onGround:true,flash:0}
    document.getElementById('ml-score').textContent=mlScore
    document.getElementById('ml-levens').textContent='❤️❤️❤️'
    document.getElementById('ml-timer').textContent=mlTimer
    document.getElementById('ml-start-btn').disabled=true
    document.getElementById('marronspel-klaar').style.display='none'
    cv.addEventListener('pointerdown',doJump)
    document.addEventListener('keydown',onKey)
    mlIv=setInterval(()=>{
      mlTimer--;document.getElementById('ml-timer').textContent=mlTimer
      mlScore+=5;document.getElementById('ml-score').textContent=mlScore
      gameSpd=3.5+(40-mlTimer)*0.1
      if(mlTimer<=0)stopMarron()
    },1000)
    running=true;aid=requestAnimationFrame(loop)
  }
  function onKey(e){if((e.code==='Space'||e.key===' ')&&running){e.preventDefault();doJump()}}
  function loop(){
    if(!running)return
    const now=performance.now()
    const gap=Math.max(900,2200-(40-mlTimer)*28)
    if(now-lastObs>gap){obstacles.push(mkObs());lastObs=now}
    ply.vy+=0.65;ply.y+=ply.vy
    if(ply.y>=GY){ply.y=GY;ply.vy=0;ply.onGround=true}
    if(ply.flash>0)ply.flash--
    obstacles.forEach(o=>o.x-=gameSpd)
    obstacles=obstacles.filter(o=>o.x>-60)
    obstacles.forEach(o=>{
      if(o.passed)return
      const py=ply.y-30
      if(PX+14>o.x-o.w/2&&PX-14<o.x+o.w/2&&py+30>o.y&&py<o.y+o.h){
        o.passed=true;mlLevens=Math.max(0,mlLevens-1);speelGeluid('mis')
        document.getElementById('ml-levens').textContent='❤️'.repeat(mlLevens)+'🖤'.repeat(3-mlLevens)
        ply.flash=30;ply.vy=-7
        if(mlLevens<=0){stopMarron();return}
      }
      if(o.x+o.w/2<PX-20)o.passed=true
    })
    drawBg()
    cx.font='30px serif';cx.textAlign='center';cx.textBaseline='bottom'
    obstacles.forEach(o=>cx.fillText(o.e,o.x,o.y+o.h))
    cx.save();cx.translate(PX,ply.y);cx.scale(-1,1)
    if(ply.flash>0)cx.globalAlpha=0.5+0.5*Math.sin(ply.flash*0.6)
    cx.font='32px serif';cx.textAlign='center';cx.textBaseline='bottom'
    cx.fillText('🏃',0,0);cx.restore()
    cx.fillStyle='rgba(0,0,0,0.3)';cx.fillRect(0,0,CW,30)
    cx.fillStyle='#f0e6c8';cx.font='bold 13px Fredoka One,cursive';cx.textAlign='center'
    cx.fillText('⏱️ '+mlTimer+'s',CW/2-70,21)
    cx.fillText('🏃 '+mlScore,CW/2,21)
    cx.fillText('❤️'.repeat(Math.max(0,mlLevens))+'🖤'.repeat(Math.max(0,3-mlLevens)),CW/2+68,21)
    aid=requestAnimationFrame(loop)
  }
  function stopMarron(){
    speelGeluid('klaar');running=false;cancelAnimationFrame(aid);clearInterval(mlIv)
    cv.removeEventListener('pointerdown',doJump)
    document.removeEventListener('keydown',onKey)
    const msg=mlScore>=200?`🏆 ${mlScore} pts — Vrijheid gewonnen!`:mlScore>=120?`🎉 ${mlScore} pts — Goed gevlucht!`:`🏃 ${mlScore} pts — Ren harder!`
    document.getElementById('mlk-score').textContent=msg
    document.getElementById('marronspel-klaar').style.display='block'
    document.getElementById('ml-start-btn').disabled=false
  }
  window.resetMarronSpel=function(){document.getElementById('marronspel-klaar').style.display='none';window.startMarronSpel()}
  init()
})()
