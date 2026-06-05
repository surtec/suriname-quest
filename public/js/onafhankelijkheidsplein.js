checkAuth()
toonSpelerBalk()

function naarSectie(naam) {
  document.querySelectorAll('.page-section').forEach(s => s.classList.remove('actief'))
  document.getElementById('page-' + naam).classList.add('actief')
  window.scrollTo({ top: 0, behavior: 'smooth' })
  if (naam === 'game' && !document.getElementById('memo-start-btn').disabled) {
    startMemoSpel()
  }
}

var LOCATIE_ID = 'onafhankelijkheidsplein'
var TOTAAL     = 4

;(function(){
  const PAREN=[
    ['25 nov. 1975',   'Onafhankelijkheidsdag'],
    ['Johan Ferrier',  'Eerste president'],
    ['Henck Arron',    'Eerste premier'],
    ['Fort Zeelandia', 'Historisch fort Paramaribo'],
    ['Paramaribo',     'Hoofdstad Suriname'],
    ['Jacques Pinas',  'Ontwerper Surinaamse vlag'],
  ]
  let kaarten=[],omgedraaid=[],gevonden=0,pogingen=0,wachten=false,timerIv,memoTimer

  function maakBord(){
    const bord=document.getElementById('memo-bord')
    bord.innerHTML=''
    const items=[]
    PAREN.forEach((p,i)=>{
      items.push({tekst:p[0],paar:i})
      items.push({tekst:p[1],paar:i})
    })
    items.sort(()=>Math.random()-0.5)
    kaarten=items.map((item,idx)=>{
      const div=document.createElement('div')
      div.className='memo-kaart'
      div.innerHTML=`<div class="memo-kaart-inner"><div class="memo-k-voor">🇸🇷</div><div class="memo-k-achter">${item.tekst}</div></div>`
      div.addEventListener('click',()=>klikKaart(idx))
      bord.appendChild(div)
      return{el:div,paar:item.paar,omgedraaid:false,gevonden:false}
    })
  }

  function klikKaart(idx){
    if(wachten)return
    const k=kaarten[idx]
    if(k.omgedraaid||k.gevonden||omgedraaid.length>=2)return
    k.el.classList.add('omgedraaid')
    k.omgedraaid=true
    omgedraaid.push(idx)
    if(omgedraaid.length===2){
      pogingen++
      document.getElementById('memo-pogingen').textContent=pogingen
      const[a,b]=omgedraaid
      if(kaarten[a].paar===kaarten[b].paar){
        kaarten[a].gevonden=kaarten[b].gevonden=true
        kaarten[a].el.classList.add('gevonden')
        kaarten[b].el.classList.add('gevonden')
        omgedraaid=[]
        gevonden++
        document.getElementById('memo-paren').textContent=gevonden+'/6'
        speelGeluid('hit')
        if(gevonden===6)setTimeout(stopMemo,400)
      } else {
        wachten=true
        kaarten[a].el.classList.add('fout')
        kaarten[b].el.classList.add('fout')
        setTimeout(()=>{
          kaarten[a].el.classList.remove('omgedraaid','fout')
          kaarten[b].el.classList.remove('omgedraaid','fout')
          kaarten[a].omgedraaid=kaarten[b].omgedraaid=false
          omgedraaid=[]
          wachten=false
          speelGeluid('mis')
        },1000)
      }
    }
  }

  window.startMemoSpel=function(){
    gevonden=0;pogingen=0;omgedraaid=[];wachten=false;memoTimer=60
    document.getElementById('memo-paren').textContent='0/6'
    document.getElementById('memo-pogingen').textContent='0'
    document.getElementById('memo-timer').textContent=memoTimer
    document.getElementById('memo-start-btn').disabled=true
    document.getElementById('memo-klaar').style.display='none'
    maakBord()
    timerIv=setInterval(()=>{
      memoTimer--
      document.getElementById('memo-timer').textContent=memoTimer
      if(memoTimer<=0)stopMemo()
    },1000)
  }

  function stopMemo(){
    clearInterval(timerIv)
    speelGeluid('klaar')
    const score=gevonden===6?Math.max(50,300-pogingen*10+memoTimer*3):gevonden*30
    const msg=gevonden===6
      ?(pogingen<=8?`🏆 ${score} pts — Geweldig! Alle paren gevonden!`:`🎉 ${score} pts — Alle paren gevonden!`)
      :`🃏 ${gevonden}/6 paren — Probeer opnieuw!`
    document.getElementById('memo-klaar-score').textContent=msg
    document.getElementById('memo-klaar').style.display='block'
    document.getElementById('memo-start-btn').disabled=false
  }

  window.resetMemoSpel=function(){
    document.getElementById('memo-klaar').style.display='none'
    window.startMemoSpel()
  }
})()
