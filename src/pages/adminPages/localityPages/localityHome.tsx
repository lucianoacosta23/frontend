import { Link, Outlet } from "react-router";
import '../../../static/css/users/userHome.css';

const UserHome = () => {
  return (
    <div className="user-home-container">
      <h1>Gestión de Localidades</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Localidades
          </Link>
          <Link to="create/" className="menu-item">
            Agregar Localidad
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
};

export default UserHome;
