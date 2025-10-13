import {Link, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import '../../static/css/homePageNav.css'
import { jwtDecode } from "jwt-decode";
import type { UserData } from "../../types/userData";
import { useState, useEffect } from "react"; //  AGREGAR ESTOS IMPORTS

interface HomePageNavProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function HomePageNav({ showNotification }: HomePageNavProps){
    const navigate = useNavigate()
    
    //  USAR ESTADO PARA QUE SE ACTUALICE
    const [userData, setUserData] = useState<UserData | undefined>(undefined);
    const [storedUser, setStoredUser] = useState<string | null>(null);
    
    //  FUNCIÓN PARA VERIFICAR AUTENTICACIÓN
    const checkAuth = () => {
        const user = localStorage.getItem('user');
        setStoredUser(user);
        
        if (user) {
            try {
                const decoded = jwtDecode(user) as UserData;
                setUserData(decoded);
            } catch (error) {
                console.error('Error decodificando token:', error);
                localStorage.removeItem('user');
                setStoredUser(null);
                setUserData(undefined);
            }
        } else {
            setUserData(undefined);
        }
    };
    
    //  VERIFICAR AL MONTAR Y CUANDO CAMBIE EL localStorage
    useEffect(() => {
        checkAuth();
        
        // Escuchar cambios en localStorage
        const handleStorageChange = () => {
            checkAuth();
        };
        
        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);
    
    const toHome = () => {
        navigate('/')
    }
    
    const handleLogout = () => {
        localStorage.removeItem('user');
        showNotification("Sesión cerrada con éxito", "success");
        //  ACTUALIZAR ESTADO INMEDIATAMENTE
        setStoredUser(null);
        setUserData(undefined);
    }
    
    return(
        <header className="homeHeader">
                <div className="Nav">
                    <h1 className="companyName" onClick={toHome}>
                        <div className="navIcon"><FaFutbol /></div>
                        FútbolYa
                    </h1>
                    <ul>
                        <li>
                            <Link to="/about">Sobre nosotros</Link>
                        </li>
                        
                        <li>
                            <Link to="/reserve-pitch">Lista de Canchas</Link>
                        </li>
                        {(userData?.category === 'admin') &&
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>}
                        {(userData?.category === 'business_owner') &&
                        <li>
                            <Link to="/myBusiness">Mi negocio</Link> 
                        </li>}
                        {(userData?.category === 'user') &&
                        <li>
                            <Link to="/registerBusiness">Registrar negocio</Link> 
                        </li>}
                        {storedUser &&
                        <li>
                            <Link to="/myReservations">Mis reservas</Link>
                        </li>}
                        <li>
                            {!storedUser && 
                            <Link to="/login">Iniciar sesión</Link>}
                            {storedUser &&
                            <Link to="/" onClick={handleLogout}>Cerrar sesión</Link>}
                        </li>  
                        
                    </ul>   
                </div>
            </header>
    )
}