import {Link, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import '../../static/css/homePageNav.css'
import { jwtDecode } from "jwt-decode";
import type { UserData } from "../../types/userData";
interface HomePageNavProps {
  showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function HomePageNav({ showNotification }: HomePageNavProps){
    const navigate = useNavigate()
    const toHome = () => {
        navigate('/')
    }
    let userData = undefined
    const storedUser = localStorage.getItem('user')
    if(storedUser){
        userData = jwtDecode(storedUser) as UserData
    }
    const handleLogout = () =>{
        localStorage.clear() 
        showNotification("Sesión cerrada con éxito", "success");
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
                            {!storedUser && 
                            <Link to="/login">Iniciar sesión</Link>}
                            {storedUser &&
                            <Link to="/" onClick={handleLogout}>Cerrar sesión</Link>}
                        </li>
                        <li>
                            <Link to ="/about">Sobre nosotros</Link>
                        </li>
                        <li>
                            <Link to="/pitchs">Lista de Canchas</Link>
                        </li>
                        {(userData?.category == 'admin') &&
                        <li>
                            <Link to="/admin">Admin Dashboard</Link>
                        </li>}
                        {(userData?.category == 'business_owner') &&
                        <li>
                            <Link to="/myBusiness">Mi negocio</Link> 
                        </li>}  
                    </ul>   
                </div>
            </header>
    )
}