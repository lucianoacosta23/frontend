import {Link, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import '../../static/css/homePageNav.css'

export function HomePageNav(){
    const navigate = useNavigate()
    const toHome = () => {
        navigate('/')
    }
    const storedUser = localStorage.getItem('user')
    const handleLogout = () =>{
        localStorage.clear() 
        alert('sesion cerrada')
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
                    </ul>   
                </div>
            </header>
    )
}