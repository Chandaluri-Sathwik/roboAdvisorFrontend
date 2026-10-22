import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApp } from '../store/AppContext'

export function RiskResultPage() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const score = Math.round(profile.willingness * .4 + profile.capacity * .4 + profile.horizon * .2)
  const emergencyMonths = Math.round(profile.emergencyFund / profile.expenses)

  return <div className="result-page">
    <header className="simple-head"><NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink><span>YOUR PLAN IS READY</span></header>
    <section className="result-main">
      <p className="eyebrow">YOUR INVESTING STYLE</p><h1>You’re a <em>{profile.riskProfile}</em><br />investor.</h1><p className="lead">Your profile reflects how you feel about volatility, your financial cushion and your 10-year goal.</p>
      <div className="risk-score-card"><div className="score-ring"><strong>{score}</strong><small>out of 100</small></div><div><h3>Balanced for progress</h3><p>You have a stable base and a long enough horizon to seek growth, while keeping meaningful diversification in place.</p><div className="score-bars"><span>Risk willingness <i><b style={{ width: `${profile.willingness}%` }} /></i><strong>{profile.willingness}</strong></span><span>Financial capacity <i><b style={{ width: `${profile.capacity}%` }} /></i><strong>{profile.capacity}</strong></span></div></div></div>
      <div className="suitability">✓ <span><strong>Financial foundation looks sound.</strong> Your emergency savings cover roughly {emergencyMonths} months of expenses in this demo.</span></div>
      <Button onClick={() => navigate('/recommendation')}>See my investment plan →</Button>
    </section>
  </div>
}
