import { useNavigate } from 'react-router-dom'
import { AllocationDonut, AllocationLegend } from '../components/Allocation'
import { Button } from '../components/Button'
import { Topbar } from '../components/Topbar'
import { colors, productCatalogue, type Allocation } from '../data/demo'
import { formatINR } from '../lib/finance'
import { useApp } from '../store/AppContext'

export function RecommendationPage() {
  const { profile } = useApp()
  const navigate = useNavigate()
  const allocation = profile.targetAllocation

  return <>
    <Topbar eyebrow="YOUR PERSONAL PLAN" title="A portfolio with purpose." action={<Button variant="secondary" onClick={() => navigate('/goals/demo')}>Edit goal</Button>} />
    <section className="page-grid recommendation">
      <div>
        <div className="card plan-summary"><p className="eyebrow">YOUR {profile.riskProfile.toUpperCase()} PORTFOLIO</p><h2>Built for a {profile.years}-year journey</h2><p>A diversified illustrative mix designed to balance potential growth with smoother ground beneath your feet.</p><div className="allocation-visual"><AllocationDonut allocation={allocation} /><AllocationLegend allocation={allocation} /></div></div>
        <div className="card callout-card"><span>✦</span><div><h3>Why this mix?</h3><p>Equity supports long-term growth. Debt, gold and cash provide diversification and help manage volatility along the way.</p></div><button>Read our approach →</button></div>
      </div>
      <aside>
        <div className="card contribution-card"><p className="eyebrow">YOUR CONTRIBUTIONS</p><div><span>Starting amount</span><strong>{formatINR(profile.initial)}</strong></div><div><span>Monthly SIP</span><strong>{formatINR(profile.sip)}</strong></div><hr /><p>You will see exactly how every contribution is allocated before anything happens.</p></div>
        <div className="card product-card"><p className="eyebrow">WHAT’S INSIDE</p>{productCatalogue.map((product) => <div className="product-row" key={product.name}><i style={{ background: colors[product.className as keyof Allocation] }} /><span><strong>{product.name}</strong><small>{product.type}</small></span><b>{product.fee}</b></div>)}</div>
      </aside>
    </section>
    <div className="sticky-cta"><span>This is an illustrative plan — not a guarantee of returns.</span><Button onClick={() => navigate('/dashboard')}>Start exploring my plan →</Button></div>
  </>
}
