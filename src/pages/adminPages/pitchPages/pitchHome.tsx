import { Link, Outlet, useOutletContext } from "react-router";
import '../../../static/css/crudTable.css'

export default function PitchHome() {
  const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
  return (
    <div style={{ padding: '2rem' }}>
        <div className="crud-home-container">
          <h1 className="crud-title">Gestión de Canchas</h1>
          <div className="menu-section">
            <nav className="crud-menu">
              <Link to="/admin/pitchs" className="menu-item">
              Inicio
              </Link>
              <Link to="/admin/pitchs/getAll/" className="menu-item">
              Ver canchas
              </Link>
              <Link to="/admin/pitchs/add/" className="menu-item">
                Agregar Canchas
              </Link>
              <Link to="/admin/pitchs/getOne/" className="menu-item">
              Ver cancha por ID
              </Link>
              <Link to="/admin/pitchs/update/" className="menu-item">
              Actualizar canchas
              </Link>
            </nav>
          </div>

          <div className="content-area">
            <Outlet context={{showNotification}}/>
          </div>
        </div>
      </div>)
}
