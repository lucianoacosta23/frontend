import { BrowserRouter, Routes, Route } from 'react-router'
import '../../static/css/App.css'
import {AdminLayout} from '../../layout/AdminLayout.tsx';
import LocalityHome from '../adminPages/localityPages/localityHome.tsx';
import AdminDashboard from '../adminPages/adminDashboard.tsx';
import CouponHome from '../adminPages/couponPages/couponHome.tsx';
import CouponGetAll from '../adminPages/couponPages/couponGetAll.tsx';
import CouponGetOne from '../adminPages/couponPages/couponGetOne.tsx';
import CouponAdd from '../adminPages/couponPages/couponAdd.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="admin/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="coupons/" element={<CouponHome />}>
            <Route path="getAll/" element={<CouponGetAll />}/>
            <Route path='getOne/' element={<CouponGetOne />}/>
            <Route path='add/' element={<CouponAdd />}/>
          </Route>
          <Route path="localities/" element={<LocalityHome />} />
          <Route path="categories/" element={<div>Categories Page</div>} />
        </Route>
      </Routes>
  </BrowserRouter>
  )
}

export default App
