import { Topbar } from '../components/Topbar'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

export function InsightsPage() {
  const { profile } = useApp()
  const portfolioValue = profile.portfolioValue
  return <>
    <Topbar eyebrow="PERFORMANCE & INSIGHTS" title="Progress, in perspective." />
    <section className="insights-grid">
      <div className="card line-card"><div className="card-title"><div><p className="eyebrow">PORTFOLIO VALUE</p><h2>{formatINR(portfolioValue)}</h2></div><span className="positive">Current API-backed value</span></div><svg viewBox="0 0 600 220" className="line-chart" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#0b766e" stopOpacity=".26" /><stop offset="1" stopColor="#0b766e" stopOpacity="0" /></linearGradient></defs><path d="M0 180 C50 150 70 158 110 132 S170 115 210 128 S270 80 320 100 S370 70 420 84 S480 39 525 56 S570 22 600 30 L600 220 L0 220Z" fill="url(#fill)" /><path d="M0 180 C50 150 70 158 110 132 S170 115 210 128 S270 80 320 100 S370 70 420 84 S480 39 525 56 S570 22 600 30" fill="none" stroke="#0b766e" strokeWidth="4" /></svg><div className="month-axis"><span>Portfolio created</span><span>Current value</span></div></div>
      <div className="card insight-card"><p className="eyebrow">WHAT WE’RE SEEING</p><h3>Your plan has a long runway.</h3><p>With {profile.years} years remaining, normal market movements have time to play out. Staying aligned with your chosen mix matters more than reacting to short-term changes.</p><button>Learn about volatility →</button></div>
      <div className="card stress-card"><p className="eyebrow">HYPOTHETICAL STRESS TEST</p><h3>What if equity fell 20%?</h3><div className="stress-numbers"><div><span>Portfolio impact</span><strong>–10.0%</strong></div><div><span>Illustrative value</span><strong>{formatINR(119160)}</strong></div></div><p>Your debt, gold and cash allocation are intended to reduce—not remove—overall fluctuations.</p></div>
    </section>
  </>
}
