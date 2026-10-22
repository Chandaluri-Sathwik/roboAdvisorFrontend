import { useNavigate } from 'react-router-dom'
import { AllocationDonut } from '../components/Allocation'
import { Button } from '../components/Button'

export function LandingPage() {
  const navigate = useNavigate()

  return <div className="landing">
    <nav className="landing-nav">
      <div className="brand"><span>✦</span>FinGuide</div>
      <div className="landing-links"><a href="#how">How it works</a><a href="#principles">Our principles</a><Button variant="secondary" onClick={() => navigate('/onboarding')}>Build my plan →</Button></div>
    </nav>
    <section className="hero">
      <div className="hero-copy">
        <p className="pill">● A NEW WAY TO INVEST WITH CLARITY</p>
        <h1>Your financial future,<br /><em>made clearer.</em></h1>
        <p className="hero-text">A thoughtful, goal-based investing experience that adapts to your life — not the other way around.</p>
        <div className="hero-actions"><Button onClick={() => navigate('/onboarding')}>Build my investment plan <span>→</span></Button><button className="text-button" onClick={() => document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' })}>See how it works <b>↓</b></button></div>
        <p className="hero-note">✦ Educational simulation · No real investments or money movement</p>
      </div>
      <div className="hero-art">
        <div className="orbit orbit-one" /><div className="orbit orbit-two" />
        <div className="hero-card growth-card"><p>YOUR PLAN, AT A GLANCE</p><strong>₹50L</strong><span>Wealth goal · 10 years</span><div className="progress-track"><i /></div><small>24% on track</small></div>
        <div className="hero-card allocation-card"><p>SMART ALLOCATION</p><div className="mini-donut"><AllocationDonut allocation={{ equity: 50, debt: 35, gold: 10, cash: 5 }} size={92} /></div><span>Built around you</span></div>
        <div className="floating-leaf">✦</div>
      </div>
    </section>
    <section id="how" className="principles">
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
