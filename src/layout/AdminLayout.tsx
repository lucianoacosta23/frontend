import { NavLink, Outlet } from "react-router-dom";
import "../static/css/AdminLayout.css";
import { useState } from "react";
import { FaBars, FaTimes, FaUsers, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";

export function AdminLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    return (
        <div className="admin-container">
            {/* Sidebar para desktop */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">AC</div>
                    <div className="sidebar-title">Admin Canchas</div>
                </div>
                
                <nav className="sidebar-nav">

                    <NavLink 
                        to="" 
                        end
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaBars /></div>
                        <div className="nav-text">Dashboard</div>
                    </NavLink>

                    <NavLink 
                        to="users/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaUsers /></div>
                        <div className="nav-text">Usuarios</div>
                    </NavLink>
                    
                    <NavLink 
                        to="localities/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaMapMarkerAlt /></div>
                        <div className="nav-text">Localidades</div>
                    </NavLink>
                    
                    <NavLink 
                        to="coupons/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaTicketAlt /></div>
                        <div className="nav-text">Cupones</div>
                    </NavLink>
                </nav>
            </aside>

            {/* Header móvil */}
            <header className="mobile-header">
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className="mobile-logo">
                    <div className="mobile-logo-icon">AC</div>
                    <div className="mobile-logo-text">Admin Canchas</div>
                </div>
            </header>

            {/* Sidebar móvil */}
            <div className={`mobile-sidebar ${mobileMenuOpen ? 'active' : ''}`}>
                <nav className="sidebar-nav">
                    <NavLink 
                        to="users/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaUsers /></div>
                        <div className="nav-text">Usuarios</div>
                    </NavLink>
                    
                    <NavLink 
                        to="localities/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaMapMarkerAlt /></div>
                        <div className="nav-text">Localidades</div>
                    </NavLink>
                    
                    <NavLink 
                        to="coupons/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaTicketAlt /></div>
                        <div className="nav-text">Cupones</div>
                    </NavLink>
                </nav>
            </div>

            {/* Overlay para móvil */}
            <div 
                className={`menu-overlay ${mobileMenuOpen ? 'active' : ''}`} 
                onClick={toggleMobileMenu}
            />

            {/* Contenido principal */}
            <main className="admin-content">
                <Outlet />
            </main>
        </div>
    );
}