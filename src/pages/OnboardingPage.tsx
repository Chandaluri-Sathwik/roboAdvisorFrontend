import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import { useApp } from '../store/AppContext'
import type { PlanProfile } from '../types/plan'

const steps = ['About you', 'Your goal', 'Your comfort with risk']
const riskToleranceAnswers: Array<[string, number]> = [
  ['I prefer stable returns, even if growth is lower', 20],
  ['I can accept some fluctuations for better long-term growth', 50],
  ['I am comfortable with larger fluctuations for higher growth potential', 75],
  ['I can accept significant fluctuations in pursuit of maximum growth', 95],
]
const goals = [
  ['wealth_creation', '✦ Wealth creation'],
  ['home', '⌂ Buy a home'],
  ['education', '⌁ Education'],
  ['retirement', '◌ Retirement'],
  ['other', 'Other goal'],
]

export function OnboardingPage() {
  const { profile, setProfile, savePlan } = useApp()
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

    const capacity = profile.willingness
    const horizon = Math.min(100, profile.years * 8)
    const completedProfile = { ...profile, capacity, horizon }
    setIsSaving(true)
    setProfile({ capacity, horizon })
    await savePlan(completedProfile)
    setIsSaving(false)
    navigate('/risk-result')
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
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="onboard-actions">
        <Button variant="ghost" onClick={() => { setError(''); step ? setStep(step - 1) : navigate('/') }}>← Back</Button>
        <Button onClick={() => void goForward()}>{isSaving ? 'Saving plan…' : step === 2 ? 'See my result' : 'Continue →'}</Button>
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
  const showsInitialAmount = profile.investmentType === 'one_time' || profile.investmentType === 'both'
  const showsMonthlyAmount = profile.investmentType === 'monthly' || profile.investmentType === 'both'

  return <><h1>What are you <em>building toward?</em></h1><p className="lead">Choose a meaningful goal. You can always adjust it later.</p>
    <fieldset><legend>Primary financial goal <RequiredMark /></legend><div className="goal-options">{goals.map(([value, label]) => <button type="button" key={value} className={profile.goalType === value ? 'selected' : ''} onClick={() => setProfile({ goalType: value })}>{label}</button>)}</div></fieldset>
    {profile.goalType === 'other' && <label>Describe your goal <RequiredMark /><input required value={profile.customGoalName} onChange={(event) => setProfile({ customGoalName: event.target.value })} /></label>}
    <div className="field-row">
      <label>Target amount <RequiredMark /><input required min="1" type="number" value={profile.goal || ''} onChange={(event) => setProfile({ goal: Number(event.target.value) })} /></label>
      <label>Investment horizon <RequiredMark /><select required value={profile.years || ''} onChange={(event) => setProfile({ years: Number(event.target.value) })}><option value="" disabled>Select a time horizon</option><option value="1">Less than 1 year</option><option value="2">1–3 years</option><option value="4">3–5 years</option><option value="7">5–10 years</option><option value="12">More than 10 years</option></select></label>
    </div>
    <fieldset><legend>How would you like to invest? <RequiredMark /></legend><ChoiceButtons value={profile.investmentType} onChange={(investmentType) => setProfile({ investmentType: investmentType as PlanProfile['investmentType'] })} choices={[['one_time', 'One-time investment'], ['monthly', 'Monthly investment'], ['both', 'Both']]} /></fieldset>
    {showsInitialAmount && <label>One-time investment amount <RequiredMark /><input required min="1" type="number" value={profile.initial || ''} onChange={(event) => setProfile({ initial: Number(event.target.value) })} /></label>}
    {showsMonthlyAmount && <label>Planned monthly contribution <RequiredMark /><input required min="1" type="number" value={profile.sip || ''} onChange={(event) => setProfile({ sip: Number(event.target.value) })} /></label>}
  </>
}

function RiskQuestion() {
  const { profile, setProfile } = useApp()
  return <><h1>Your <em>risk and return preferences.</em></h1><p className="lead">Your answers help us infer the level of risk that fits your educational plan.</p>
    <div className="risk-question"><p>Which statement best describes your comfort with investment returns? <RequiredMark /></p>{riskToleranceAnswers.map(([answer, score]) => <button type="button" key={answer} className={profile.willingness === score ? 'selected' : ''} onClick={() => setProfile({ willingness: score })}>{answer}<span>→</span></button>)}</div>
    <label>Expected annual return range <small>(optional — does not change your risk score)</small><select value={profile.expectedReturnRange} onChange={(event) => setProfile({ expectedReturnRange: event.target.value as PlanProfile['expectedReturnRange'] })}><option value="">Select an expected return range</option><option value="4_6">4–6%</option><option value="7_10">7–10%</option><option value="11_15">11–15%</option><option value="over_15">More than 15%</option></select></label>
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
    if (!profile.goalType || profile.goal <= 0 || profile.years < 1) return 'Choose a goal and enter a valid target amount and investment horizon.'
    if (profile.goalType === 'other' && !profile.customGoalName.trim()) return 'Describe your financial goal to continue.'
    if (!profile.investmentType) return 'Choose whether you are making a one-time, monthly, or combined investment.'
    if ((profile.investmentType === 'one_time' || profile.investmentType === 'both') && profile.initial <= 0) return 'Enter a one-time investment amount.'
    if ((profile.investmentType === 'monthly' || profile.investmentType === 'both') && profile.sip <= 0) return 'Enter your planned monthly contribution.'
  }
  if (step === 2 && profile.willingness < 0) return 'Answer the risk-preference question to see your result.'
  return ''
}
