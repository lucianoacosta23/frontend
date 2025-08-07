import { Link, Outlet } from "react-router";
import PitchCard from "../../../components/pitchCard.tsx";

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
    </nav>
      <PitchCard imgUrl="https://www.fcbarcelona.com/photo-resources/2021/08/09/276ad270-e5c6-453d-8d9f-212417ad7cb3/Camp-Nou-3.jpg?width=1200&height=750" 
      rating={5}  roof={true} size="FUT5" groundType="Sintético" price={40000}/>
      <PitchCard imgUrl="https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/madrid/santiago-bernabeu_c-david-benito-shutterstock-s2468268069.jpg_1014274486.jpg" 
      rating={3}  roof={false} size="FUT5" groundType="Sintético" price={35000}/>
        <Outlet />
    </div>
  );
}
