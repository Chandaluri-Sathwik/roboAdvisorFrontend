import { colors, labels, type Allocation } from '../data/demo'
import { formatINR } from '../lib/finance'

export function AllocationLegend({
  allocation,
  contributionAmount,
  contributionLabel,
}: {
  allocation: Allocation
  contributionAmount?: number
  contributionLabel?: string
}) {
  return <div className="allocation-list">
    {(Object.keys(allocation) as (keyof Allocation)[]).map((key) => <div className="allocation-row" key={key}>
      <span><i style={{ background: colors[key] }} />{labels[key]}</span>
      <div className="allocation-row-values">
        <strong>{allocation[key]}%</strong>
        {contributionAmount !== undefined && <small>
          {formatINR(contributionAmount * allocation[key] / 100)}{contributionLabel ? ` ${contributionLabel}` : ''}
        </small>}
      </div>
    </div>)}
  </div>
}

export function AllocationDonut({ allocation, size = 162 }: { allocation: Allocation; size?: number }) {
  const stops = (Object.keys(allocation) as (keyof Allocation)[]).reduce(
    (result, key) => {
      const start = result.total
      result.total += allocation[key]
      result.stops.push(`${colors[key]} ${start}% ${result.total}%`)
      return result
    },
    { total: 0, stops: [] as string[] },
  ).stops.join(', ')

  return <div className="donut" style={{ width: size, height: size, background: `conic-gradient(${stops})` }}>
    <div><strong>100%</strong><small>allocated</small></div>
  </div>
}
