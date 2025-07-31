import { BrowserRouter, Routes, Route } from 'react-router'
import '../../static/css/App.css'
import {AdminLayout} from '../../layout/AdminLayout.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin/" element={<AdminLayout />}>
          <Route path="coupons" />
          <Route path="localities" />
          <Route path="categories" />
        </Route>
      </Routes>
  </BrowserRouter>
  )
}

export default App
