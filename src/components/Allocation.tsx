import { colors, labels, type Allocation } from '../data/demo'

export function AllocationLegend({ allocation }: { allocation: Allocation }) {
  return <div className="allocation-list">
    {(Object.keys(allocation) as (keyof Allocation)[]).map((key) => <div className="allocation-row" key={key}>
      <span><i style={{ background: colors[key] }} />{labels[key]}</span>
      <strong>{allocation[key]}%</strong>
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
