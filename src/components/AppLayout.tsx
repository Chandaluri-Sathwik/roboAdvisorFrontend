import { NavLink, Outlet } from 'react-router-dom'
import { Assistant } from './Assistant'
import { Button } from './Button'
import { useApp } from '../store/AppContext'

export function AppLayout() {
  const { profile, syncStatus, syncError, restorePlan } = useApp()
  const navigation = [
    ['Dashboard', '/dashboard', '⌂'],
    ['My goals', `/goals/${profile.goalId ?? 'demo'}`, '◎'],
    ['Portfolio', '/portfolio', '◔'],
  ]

  return <div className="app-shell">
    <aside className="sidebar">
      <NavLink to="/" className="brand"><span>✦</span>FinGuide</NavLink>
      <p className="sidebar-label">WEALTH PLANNING</p>
      <nav>{navigation.map(([label, href, icon]) => <NavLink key={href} to={href} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}><b>{icon}</b>{label}</NavLink>)}</nav>
      <div className="sidebar-bottom"><button className="advisor-mini" onClick={() => window.dispatchEvent(new Event('finguide:open-assistant'))}><span>AI</span><div><strong>FinGuide Local</strong><small>Local portfolio assistant</small></div></button><NavLink to="/" className="nav-item"><b>⌂</b>Home</NavLink></div>
    </aside>
    <main className="main-content">
      {syncStatus !== 'idle' && <div className={`sync-notice ${syncStatus}`} role={syncStatus === 'offline' ? 'alert' : 'status'}>
        <span>{syncStatus === 'synced'
          ? 'Plan restored or saved to the API and MongoDB.'
          : syncStatus === 'restoring'
            ? 'Restoring your saved plan from MongoDB…'
            : syncStatus === 'syncing'
              ? 'Saving your plan…'
              : syncError}</span>
        {syncStatus === 'offline' && profile.userId && <Button variant="ghost" onClick={() => { void restorePlan() }}>Retry restore</Button>}
      </div>}
      <Outlet />
    </main>
    <Assistant />
  </div>
}
