import { NavLink, Outlet } from 'react-router-dom'
import { Assistant } from './Assistant'

const navigation = [
  ['Dashboard', '/dashboard', '⌂'],
  ['My goals', '/goals/demo', '◎'],
  ['Portfolio', '/portfolio', '◔'],
  ['Insights', '/insights', '↗'],
]

export function AppLayout() {
  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink>
      <p className="sidebar-label">WEALTH PLANNING</p>
      <nav>{navigation.map(([label, href, icon]) => <NavLink key={href} to={href} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><b>{icon}</b>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><button className="advisor-mini"><span>AI</span><div><strong>FinGuide AI</strong><small>Assistant is online</small></div></button><NavLink to="/" className="nav-item"><b>?</b>Help centre</NavLink></div>
    </aside>
    <main className="main-content"><Outlet /></main>
    <Assistant />
  </div>
}
