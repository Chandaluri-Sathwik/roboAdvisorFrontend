import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApp } from '../store/AppContext'

export function RiskResultPage() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const score = Math.round(profile.willingness * .4 + profile.capacity * .4 + profile.horizon * .2)

  return <div className="result-page">
    <header className="simple-head"><NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink><span>YOUR PLAN IS READY</span></header>
    <section className="result-main">
      <p className="eyebrow">YOUR INVESTING STYLE</p><h1>You’re a <em>{profile.riskProfile}</em><br />investor.</h1><p className="lead">Your profile reflects your comfort with volatility and your investment horizon.</p>
      <div className="risk-score-card"><div className="score-ring"><strong>{score}</strong><small>out of 100</small></div><div><h3>Balanced for your answers</h3><p>Your suggested mix balances growth potential with the level of fluctuation you said you could manage.</p><div className="score-bars"><span>Risk tolerance <i><b style={{ width: `${profile.willingness}%` }} /></i><strong>{profile.willingness}</strong></span></div></div></div>
      <Button onClick={() => navigate('/recommendation')}>See my investment plan →</Button>
    </section>
  </div>
}
