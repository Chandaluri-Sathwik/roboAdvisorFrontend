import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

const steps = ['About you', 'Your finances', 'Your goal', 'Your comfort with risk']
const riskAnswers: Array<[string, number]> = [
  ['Sell most investments', 25],
  ['Reduce some risk and reassess', 48],
  ['Hold and stay invested', 70],
  ['Invest more if my plan allows', 90],
]

export function OnboardingPage() {
  const { profile, setProfile, savePlan } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const goForward = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }
    setIsSaving(true)
    await savePlan()
    setIsSaving(false)
    navigate('/risk-result')
  }

  return <div className="onboarding-page">
    <header className="onboard-head"><NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink><span>Educational investing simulation</span></header>
    <div className="onboard-progress"><span>STEP {step + 1} OF {steps.length}</span><div>{steps.map((item, index) => <i key={item} className={index <= step ? 'done' : ''} />)}</div></div>
    <section className="onboard-content">
      <p className="eyebrow">{steps[step].toUpperCase()}</p>
      {step === 0 && <BasicDetails />}
      {step === 1 && <FinancialSnapshot />}
      {step === 2 && <GoalDetails />}
      {step === 3 && <RiskQuestion />}
      <div className="onboard-actions"><Button variant="ghost" onClick={() => step ? setStep(step - 1) : navigate('/')}>← Back</Button><Button onClick={() => void goForward()}>{isSaving ? 'Saving plan…' : step === 3 ? 'See my result' : 'Continue →'}</Button></div>
    </section>
  </div>
}

function BasicDetails() {
  const { profile, setProfile } = useApp()
  return <><h1>Let’s start with <em>you.</em></h1><p className="lead">A few details help us make the experience feel more relevant.</p><label>Your first name<input value={profile.name} onChange={(event) => setProfile({ name: event.target.value })} /></label><div className="field-row"><label>Age range<select defaultValue="25–34"><option>18–24</option><option>25–34</option><option>35–44</option><option>45–54</option></select></label><label>Employment<select defaultValue="Salaried"><option>Salaried</option><option>Self-employed</option><option>Student</option></select></label></div></>
}

function FinancialSnapshot() {
  const { profile, setProfile } = useApp()
  return <><h1>Your financial <em>snapshot.</em></h1><p className="lead">This helps check whether your plan leaves room for life's essentials.</p><div className="field-row"><label>Monthly take-home income<input type="number" value={profile.income} onChange={(event) => setProfile({ income: Number(event.target.value) })} /></label><label>Monthly expenses<input type="number" value={profile.expenses} onChange={(event) => setProfile({ expenses: Number(event.target.value) })} /></label></div><label>Emergency savings<input type="number" value={profile.emergencyFund} onChange={(event) => setProfile({ emergencyFund: Number(event.target.value) })} /></label><div className="info-strip">Your current monthly surplus is <strong>{formatINR(profile.income - profile.expenses)}</strong>.</div></>
}

function GoalDetails() {
  const { profile, setProfile } = useApp()
  return <><h1>What are you <em>building toward?</em></h1><p className="lead">Choose a meaningful goal. You can always adjust it later.</p><div className="goal-options"><button className="selected">✦ Wealth creation</button><button>⌂ Buy a home</button><button>⌁ Retirement</button><button>◌ Travel</button></div><div className="field-row"><label>Target amount<input type="number" value={profile.goal} onChange={(event) => setProfile({ goal: Number(event.target.value) })} /></label><label>Time horizon (years)<input type="number" value={profile.years} min="1" max="30" onChange={(event) => { const years = Number(event.target.value); setProfile({ years, horizon: Math.min(100, years * 8) }) }} /></label></div><label>Planned monthly contribution<input type="number" value={profile.sip} onChange={(event) => setProfile({ sip: Number(event.target.value) })} /></label></>
}

function RiskQuestion() {
  const { profile, setProfile } = useApp()
  return <><h1>How do you feel about <em>market changes?</em></h1><p className="lead">There is no right answer. Choose the response that feels most natural.</p><div className="risk-question"><p>If your portfolio fell 20% in a market downturn, what would you do?</p>{riskAnswers.map(([answer, score]) => <button key={answer} className={profile.willingness === score ? 'selected' : ''} onClick={() => setProfile({ willingness: score })}>{answer}<span>→</span></button>)}</div></>
}
