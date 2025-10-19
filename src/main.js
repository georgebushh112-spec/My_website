import './style.css'

// Load Chart.js from CDN by injecting a script tag
function loadChartJs(){
  return new Promise((resolve, reject)=>{
    if(window.Chart) return resolve(window.Chart)
    const s = document.createElement('script')
    s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
    s.onload = ()=>resolve(window.Chart)
    s.onerror = reject
    document.head.appendChild(s)
  })
}

// Mock price data generator (random walk)
function generateMockPrices(points=30, start=200){
  const prices = []
  let p = start
  for(let i=0;i<points;i++){
    const change = (Math.random()-0.45) * (start*0.02)
    p = Math.max(5, p + change)
    prices.push(Number(p.toFixed(2)))
  }
  return prices
}

async function init(){
  // price elements
  const priceEl = document.getElementById('price')
  const changeEl = document.getElementById('change')

  // chart
  await loadChartJs()
  const ctx = document.getElementById('priceChart')
  const prices = generateMockPrices(40, 220)
  const labels = prices.map((_,i)=>`-${40-i}d`)

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets:[{label:'Price',data:prices,borderColor:'rgba(232,33,39,0.95)',backgroundColor:'rgba(232,33,39,0.12)',fill:true,tension:0.25}]
    },
    options:{
      plugins:{legend:{display:false}},
      scales:{x:{display:false}}
    }
  })

  // show latest price
  const latest = prices[prices.length-1]
  const prev = prices[prices.length-2] || latest
  priceEl.textContent = `$${latest.toLocaleString()}`
  const diff = latest - prev
  const pct = prev?((diff/prev)*100):0
  changeEl.textContent = `${diff>=0?'+':''}${diff.toFixed(2)} (${pct.toFixed(2)}%)`
  changeEl.style.color = diff>=0? '#10b981':'#ef4444'

  // update chart periodically with small random moves to simulate live
  setInterval(()=>{
    const last = chart.data.datasets[0].data.slice(-1)[0]
    const next = Number((last + (Math.random()-0.5)*2).toFixed(2))
    chart.data.datasets[0].data.push(next)
    chart.data.datasets[0].data.shift()
    chart.update('none')
    priceEl.textContent = `$${next.toLocaleString()}`
  }, 4500)

  // calculator
  const amount = document.getElementById('amount')
  const years = document.getElementById('years')
  const annual = document.getElementById('annual')
  const calcBtn = document.getElementById('calcBtn')
  const resultEl = document.getElementById('result')

  function calc(){
    const P = Number(amount.value) || 0
    const r = (Number(annual.value) || 0)/100
    const n = Number(years.value) || 0
    const FV = P * Math.pow(1 + r, n)
    resultEl.innerHTML = `Future value: <strong>$${FV.toLocaleString(undefined,{maximumFractionDigits:2})}</strong>`
  }
  calcBtn.addEventListener('click', calc)
  calc()
}

init().catch(err=>console.error(err))
