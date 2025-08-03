import { NavLink, Outlet } from "react-router-dom";
import "../static/css/AdminLayout.css"  // Cambiar esta línea

export function AdminLayout(){
    return(
        <>
            <header className="admin-header">
                <div className="admin-nav-container">
                    <h1 className="admin-title">Panel de Administración</h1>
                    <nav className="admin-nav">
                        <NavLink 
                            to="coupons/" 
                            className={({ isActive }) => 
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Cupones
                        </NavLink>
                        <NavLink 
                            to="localities/" 
                            className={({ isActive }) => 
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Localidades
                        </NavLink>
                        <NavLink 
                            to="categories/" 
                            className={({ isActive }) => 
                                isActive ? "nav-link active" : "nav-link"
                            }
                        >
                            Categorías
                        </NavLink>
                    </nav>
                </div>
            </header>
            <main className="admin-content">
                <Outlet />
            </main>
        </>
    )
}