import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { DashboardPage } from './pages/DashboardPage'
import { DataNotesPage } from './pages/DataNotesPage'
import { GoalPlannerPage } from './pages/GoalPlannerPage'
import { LandingPage } from './pages/LandingPage'
import { OnboardingPage } from './pages/OnboardingPage'
import { PortfolioPage } from './pages/PortfolioPage'
import { RebalancePage } from './pages/RebalancePage'
import { RecommendationPage } from './pages/RecommendationPage'
import { RiskResultPage } from './pages/RiskResultPage'

export default function App() {
  return <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/onboarding" element={<OnboardingPage />} />
    <Route path="/risk-result" element={<RiskResultPage />} />
    <Route element={<AppLayout />}>
      <Route path="/recommendation" element={<RecommendationPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/goals/:goalId" element={<GoalPlannerPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/rebalance" element={<RebalancePage />} />
      <Route path="/data-notes" element={<DataNotesPage />} />
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
}
