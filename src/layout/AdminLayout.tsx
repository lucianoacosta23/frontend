import { NavLink, Outlet, Navigate } from "react-router-dom";
import "../static/css/AdminLayout.css";
import { useState } from "react";
import { FaBars, FaTimes, FaUsers, FaMapMarkerAlt, FaTicketAlt,FaArrowAltCircleLeft,FaFutbol } from "react-icons/fa";
import type { UserData } from "../types/userData.js";
import {jwtDecode} from 'jwt-decode'

export function AdminLayout() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const storedUser = localStorage.getItem('user')
    if(!storedUser){
        alert('sesion no iniciada')
        return <Navigate to="/login"/> //temporal
    }
    const userData = jwtDecode(storedUser) as UserData
    const handleLogout = () =>{
        localStorage.clear() //temporal
        alert('sesion cerrada')
    }

    return (
        <div className="admin-container">
            {/* Sidebar para desktop */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <div className="sidebar-logo">{userData.name.substring(0,2)}</div>
                    <div className="sidebar-title">{userData.name}</div>
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
                    <NavLink 
                        to="pitchs/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                    >
                        <div className="nav-icon"><FaFutbol /></div>
                        <div className="nav-text">Canchas</div>
                    </NavLink>

                    <NavLink to="../login/" className="nav-item" onClick={handleLogout}><div className="nav-icon"><FaArrowAltCircleLeft /></div>Cerrar sesión</NavLink>
                </nav>
            </aside>

            {/* Header móvil */}
            <header className="mobile-header">
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                    {mobileMenuOpen ? <FaTimes /> : <FaBars />}
                </button>
                <div className="mobile-logo">
                    <div className="mobile-logo-icon">{userData.name.substring(0,2)}</div>
                    <div className="mobile-logo-text">{userData.name}</div>
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
                    <NavLink 
                        to="pitchs/" 
                        className={({ isActive }) => 
                            `nav-item ${isActive ? 'active' : ''}`
                        }
                        onClick={toggleMobileMenu}
                    >
                        <div className="nav-icon"><FaFutbol /></div>
                        <div className="nav-text">Canchas</div>
                    </NavLink>
                    <a className="nav-item" onClick={handleLogout}><div className="nav-icon"><FaArrowAltCircleLeft /></div>Cerrar sesión</a>
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