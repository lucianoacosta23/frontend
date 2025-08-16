import { Link, Outlet } from "react-router";

export default function PitchHome() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Página de canchas</h1>
      <p>¡Bienvenido a la página de gestión de canchas!</p>
      <nav>
        <Link to="/admin/pitchs">Inicio</Link>
        <Link to="/admin/pitchs/getAll/">Ver canchas</Link>
        <Link to="/admin/pitchs/getOne/">Ver cancha por ID</Link>
        <Link to="/admin/pitchs/add/">Crear canchas</Link>
        <Link to="/admin/pitchs/update/">Actualizar canchas</Link>
        
    </nav>
        <Outlet />
    </div>
  );
}
