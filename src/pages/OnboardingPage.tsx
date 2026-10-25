import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApp } from '../store/AppContext'
import type { PlanProfile } from '../types/plan'

const steps = ['About you', 'Your plan', 'Risk comfort']
const goals = [
  ['wealth_creation', 'Wealth creation'],
  ['home', 'Buy a home'],
  ['education', 'Education'],
  ['retirement', 'Retirement'],
  ['other', 'Other goal'],
]

export function OnboardingPage() {
  const { profile, setProfile, savePlan, syncStatus, syncError } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const goForward = async () => {
    const message = validationMessage(step, profile)
    if (message) {
      setError(message)
      return
    }

    setError('')
    if (step < steps.length - 1) {
      setStep(step + 1)
      return
    }

    setIsSaving(true)
    try {
      const saved = await savePlan(profile)
      if (saved) navigate('/risk-result')
      else setError('')
    } finally {
      setIsSaving(false)
    }
  }

  return <div className="onboarding-page">
    <header className="onboard-head"><NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink><span>Educational investing simulation</span></header>
    <div className="onboard-progress"><span>STEP {step + 1} OF {steps.length}</span><div>{steps.map((item, index) => <i key={item} className={index <= step ? 'done' : ''} />)}</div></div>
    <section className="onboard-content">
      <p className="eyebrow">{steps[step].toUpperCase()}</p>
      <p className="required-note"><span aria-hidden="true">*</span> Required</p>
      {step === 0 && <BasicDetails />}
      {step === 1 && <GoalDetails />}
      {step === 2 && <RiskQuestion />}
      {(error || (syncStatus === 'offline' ? syncError : null)) && <p className="form-error" role="alert">{error || syncError}</p>}
      <div className="onboard-actions">
        <Button variant="ghost" onClick={() => { setError(''); step ? setStep(step - 1) : navigate('/') }}>← Back</Button>
        <Button disabled={isSaving} onClick={() => void goForward()}>{isSaving ? 'Saving plan…' : step === steps.length - 1 ? 'See my result' : 'Continue →'}</Button>
      </div>
    </section>
  </div>
}

function BasicDetails() {
  const { profile, setProfile } = useApp()
  return <><h1>Let’s start with <em>you.</em></h1><p className="lead">Your name is used to create your educational plan.</p><label>Your first name <RequiredMark /><input required value={profile.name} onChange={(event) => setProfile({ name: event.target.value })} /></label></>
}

function GoalDetails() {
  const { profile, setProfile } = useApp()

  return <><h1>Set your <em>investment plan.</em></h1><p className="lead">Choose a goal, time horizon, contribution style, and an annual return assumption to explore.</p>
    <fieldset><legend>Primary financial goal <RequiredMark /></legend><div className="goal-options">{goals.map(([value, label]) => <button type="button" key={value} className={profile.goalType === value ? 'selected' : ''} onClick={() => setProfile({ goalType: value })}>{label}</button>)}</div></fieldset>
    {profile.goalType === 'other' && <label>Describe your goal <RequiredMark /><input required value={profile.customGoalName} onChange={(event) => setProfile({ customGoalName: event.target.value })} /></label>}
    <label>Investment horizon <RequiredMark /><select required value={profile.years || ''} onChange={(event) => setProfile({ years: Number(event.target.value) })}><option value="" disabled>Select a time horizon</option><option value="1">Up to 1 year</option><option value="3">1–3 years</option><option value="5">3–5 years</option><option value="10">5–10 years</option><option value="15">More than 10 years</option></select></label>
    <fieldset><legend>How would you like to invest? <RequiredMark /></legend><ChoiceButtons value={profile.investmentType} onChange={(value) => setProfile({ investmentType: value as PlanProfile['investmentType'] })} choices={ [['one_time', 'One-time investment'], ['monthly', 'Monthly investment']] } /></fieldset>
    {profile.investmentType === 'one_time' && <label>One-time investment amount (INR) <RequiredMark /><input required min="1" type="number" value={profile.initial || ''} onChange={(event) => setProfile({ initial: Number(event.target.value) })} /></label>}
    {profile.investmentType === 'monthly' && <label>Monthly investment amount (INR) <RequiredMark /><input required min="1" type="number" value={profile.sip || ''} onChange={(event) => setProfile({ sip: Number(event.target.value) })} /></label>}
    <label>Expected annual return assumption (%) <RequiredMark /><input required min="0" max="100" step="0.1" type="number" value={profile.expectedReturnPercent} onChange={(event) => setProfile({ expectedReturnPercent: Number(event.target.value) })} /><small>Used for the projection and to adjust the portfolio toward historical return estimates within your risk cap. It is not a promise or forecast, and the target may not be achievable within that cap.</small></label>
  </>
}

function RiskQuestion() {
  const { profile, setProfile } = useApp()
  const options: Array<['low' | 'moderate' | 'high', string, string]> = [
    ['low', 'Low risk', 'I prefer lower fluctuations, even if growth may be slower.'],
    ['moderate', 'Moderate risk', 'I can accept some fluctuations for potential growth.'],
    ['high', 'High risk', 'I can accept larger fluctuations and possible losses.'],
  ]
  return <><h1>Your <em>risk comfort.</em></h1><p className="lead">Risk tolerance maps to a portfolio profile. Your goal type and horizon can constrain volatile exposure.</p>
    <div className="risk-question"><p>Which level best describes you? <RequiredMark /></p>{options.map(([value, label, description]) => <button type="button" key={value} className={profile.riskTolerance === value ? 'selected' : ''} aria-pressed={profile.riskTolerance === value} onClick={() => setProfile({ riskTolerance: value })}><span><strong>{label}</strong><small>{description}</small></span><b>→</b></button>)}</div>
  </>
}

function RequiredMark() {
  return <span className="required-mark" aria-label="required">*</span>
}

function ChoiceButtons({ value, onChange, choices }: { value: string; onChange: (value: string) => void; choices: Array<[string, string]> }) {
  return <div className="choice-buttons">{choices.map(([choiceValue, label]) => <button type="button" key={choiceValue} className={value === choiceValue ? 'selected' : ''} aria-pressed={value === choiceValue} onClick={() => onChange(choiceValue)}>{label}</button>)}</div>
}

function validationMessage(step: number, profile: PlanProfile): string {
  if (step === 0 && !profile.name.trim()) return 'Enter your name to continue.'
  if (step === 1) {
    if (!profile.goalType || profile.years < 1) return 'Choose a goal and investment horizon.'
    if (profile.goalType === 'other' && !profile.customGoalName.trim()) return 'Describe your financial goal to continue.'
    if (!profile.investmentType) return 'Choose one-time or monthly investing.'
    if (profile.investmentType === 'one_time' && profile.initial <= 0) return 'Enter a one-time investment amount.'
    if (profile.investmentType === 'monthly' && profile.sip <= 0) return 'Enter your monthly investment amount.'
    if (!Number.isFinite(profile.expectedReturnPercent) || profile.expectedReturnPercent < 0 || profile.expectedReturnPercent > 100) return 'Enter an expected annual return between 0% and 100%.'
  }
  if (step === 2 && !profile.riskTolerance) return 'Choose your risk comfort to continue.'
  return ''
}
