import { BrowserRouter, Routes, Route } from 'react-router'
import '../../static/css/App.css'
import {AdminLayout} from '../../layout/AdminLayout.tsx';
import LocalityHome from '../adminPages/localityPages/localityHome.tsx';
import AdminDashboard from '../adminPages/adminDashboard.tsx';
import CouponHome from '../adminPages/couponPages/couponHome.tsx';
import CouponGetAll from '../adminPages/couponPages/couponGetAll.tsx';
import CouponGetOne from '../adminPages/couponPages/couponGetOne.tsx';
import CouponAdd from '../adminPages/couponPages/couponAdd.tsx';
import CouponUpdate from '../adminPages/couponPages/couponUpdate.tsx';
import PitchHome from '../adminPages/pitchPages/pitchHome.tsx';
import PitchGetAll from '../adminPages/pitchPages/pitchGetAll.tsx';
import PitchGetOne from '../adminPages/pitchPages/pitchGetOne.tsx';
import PitchAdd from '../adminPages/pitchPages/pitchAdd.tsx';
import PitchUpdate from '../adminPages/pitchPages/pitchUpdate.tsx';
import { LoginPage } from '../loginPage.tsx';
import UserHome from '../adminPages/userPages/userHome.tsx';
import CategoryHome from '../adminPages/categoryPages/categoryHome.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='login/' element={<LoginPage/>}/>
        <Route path="admin/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="coupons/" element={<CouponHome />}>
            <Route path="getAll/" element={<CouponGetAll />}/>
            <Route path='getOne/' element={<CouponGetOne />}/>
            <Route path='add/' element={<CouponAdd />}/>
            <Route path='update/' element={<CouponUpdate />}/>
          </Route>
          <Route path="pitchs/" element={<PitchHome />}>
            <Route path="getAll/" element={<PitchGetAll />}/>
            <Route path='getOne/' element={<PitchGetOne />}/>
            <Route path='add/' element={<PitchAdd />}/>
            <Route path='update/' element={<PitchUpdate />}/>
          </Route>
          <Route path="localities/" element={<LocalityHome />} />
          <Route path="categories/" element={<CategoryHome />} />
          <Route path="users/" element={<UserHome />} />
        </Route>
      </Routes>
  </BrowserRouter>
  )
}

export default App
