import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import { DataProvider } from './context/DataContext'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Investments from './pages/Investments'
import Income from './pages/Income'
import Payments from './pages/Payments'

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="investments" element={<Investments />} />
            <Route path="income" element={<Income />} />
            <Route path="payments" element={<Payments />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}

export default App
