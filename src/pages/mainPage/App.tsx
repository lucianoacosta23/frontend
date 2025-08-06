import { BrowserRouter, Routes, Route } from 'react-router'
import '../../static/css/App.css'
import {AdminLayout} from '../../layout/AdminLayout.tsx';
import LocalityHome from '../adminPages/localityPages/localityHome.tsx';
import CouponHome from '../adminPages/couponPages/couponHome.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin/" element={<AdminLayout />}>
          <Route path="coupons/" element={<CouponHome />} />
          <Route path="localities/" element={<LocalityHome />} />
          <Route path="categories/" element={<div>Categories Page</div>} />
        </Route>
      </Routes>
  </BrowserRouter>
  )
}

export default App
