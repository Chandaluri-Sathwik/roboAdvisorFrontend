import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApp } from '../store/AppContext'

export function RiskResultPage() {
  const { profile } = useApp()
  const navigate = useNavigate()
  return <div className="result-page">
    <header className="simple-head"><NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink><span>YOUR PLAN IS READY</span></header>
    <section className="result-main">
      <p className="eyebrow">YOUR EDUCATIONAL RISK PROFILE</p><h1>You’re a <em>{profile.riskProfile}</em><br />investor.</h1><p className="lead">Your {profile.riskTolerance} risk tolerance maps to this profile. The classification is an educational rule, not a professional financial assessment.</p>
      <div className="risk-score-card"><div className="score-ring"><strong>{profile.riskCapPercent ?? '—'}%</strong><small>volatile cap</small></div><div><h3>Goal and horizon constraints</h3><p>Your {profile.goalType.replaceAll('_', ' ')} goal with a {profile.years}-year horizon caps combined equity and commodity exposure. The portfolio may adjust within this cap toward historical return estimates for your assumption; it will not exceed your cap to chase a return.</p></div></div>
      <Button onClick={() => navigate('/recommendation')}>See investment options →</Button>
    </section>
  </div>
}
