import type { ReactNode } from 'react'

export function Topbar({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <header className="topbar">
    <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1></div>
    <div className="top-actions">{action}<button className="bell">⌁<span /></button><div className="avatar">A</div></div>
  </header>
}
