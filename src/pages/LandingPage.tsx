import { useNavigate } from 'react-router-dom'
import { AllocationDonut } from '../components/Allocation'
import { Button } from '../components/Button'

export function LandingPage() {
  const navigate = useNavigate()

  return <div className="landing">
    <nav className="landing-nav">
      <div className="brand"><span>✦</span>FinGuide</div>
      <div className="landing-links"><a href="#principles">Our principles</a><Button variant="secondary" onClick={() => navigate('/onboarding')}>Build my plan →</Button></div>
    </nav>
    <section className="hero">
      <div className="hero-copy">
        <p className="pill">● EDUCATIONAL INVESTING PROTOTYPE</p>
        <h1>Your financial future,<br /><em>explored with clarity.</em></h1>
        <p className="hero-text">A goal-based investing demo that helps you explore a risk profile, sample allocations, and contribution ideas without implying a live recommendation.</p>
        <div className="hero-actions"><Button onClick={() => navigate('/onboarding')}>Build my demo plan <span>→</span></Button><button className="text-button" onClick={() => document.getElementById('principles')?.scrollIntoView({ behavior: 'smooth' })}>Our principles <b>↓</b></button></div>
        <p className="hero-note">✦ Educational simulation · Not a personalized recommendation or live investment action</p>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="hero-card growth-card"><p>SAMPLE PLAN PREVIEW</p><strong>₹50L</strong><span>Example wealth goal · 10 years</span><div className="progress-track"><i /></div><small>Illustrative only</small></div>
        <div className="hero-card allocation-card"><p>ILLUSTRATIVE MIX</p><div className="mini-donut"><AllocationDonut allocation={{ equity: 55, debt: 35, commodity: 10 }} size={92} /></div><span>Equity / Debt / Commodity example</span></div>
        <div className="floating-leaf">✦</div>
      </div>
    </section>
    <section className="principles">
      <p className="eyebrow">INVESTING, MADE HUMAN</p><h2>A better way to build wealth</h2>
      <div id="principles" className="principle-grid">
        {[
          ['01', 'Start with what matters', 'Your goals, time horizon and everyday finances shape the plan.'],
          ['02', 'Invest with intention', 'A diversified illustration built around the level of risk you can live with.'],
          ['03', 'Stay on course', 'Clear progress, gentle guidance and simulated rebalancing when things drift.'],
        ].map(([number, heading, body]) => <article key={number}><span>{number}</span><h3>{heading}</h3><p>{body}</p></article>)}
      </div>
    </section>
  </div>
}
