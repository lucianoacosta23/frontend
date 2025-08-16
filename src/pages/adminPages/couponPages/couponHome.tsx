import { Link, Outlet } from "react-router";
import '../../../static/css/crudTable.css'

export default function CouponHome() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Página de cupones</h1>
      <p>¡Bienvenido a la página de gestión de cupones!</p>
      <nav>
        <Link to="/admin/coupons">Inicio</Link>
        <Link to="/admin/coupons/getAll/">Ver cupones</Link>
        <Link to="/admin/coupons/getOne/">Ver cupon por ID</Link>
        <Link to="/admin/coupons/add/">Crear cupones</Link>
        <Link to="/admin/coupons/update/">Actualizar cupones</Link>
        
    </nav>
        <Outlet />
    </div>
  );
}
