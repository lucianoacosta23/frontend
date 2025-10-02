import { Link, Outlet } from "react-router";
import '../../../static/css/categories/categoryHome.css'

function CategoryHome() {
  return (
    <div className="user-home-container">
      <h1>Gestión de Categorías</h1>
      
      <div className="menu-section">
        <nav className="user-menu">
          <Link to="getAll/" className="menu-item">
            Ver Categorías
          </Link>
          <Link to="create/" className="menu-item">
            Agregar Categoría
          </Link>
        </nav>
      </div>

      <div className="content-area">
        <Outlet />
      </div>
    </div>
  );
}

export default CategoryHome;
