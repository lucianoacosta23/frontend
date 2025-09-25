import {Link, useNavigate } from "react-router-dom";
import '../../static/css/homePageNav.css'
import { FaFutbol } from "react-icons/fa";

export function HomePageNav(){
    const navigate = useNavigate()
    const toHome = () => {
        navigate('/')
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
                            <Link to="/login">Iniciar sesión</Link>
                        </li>
                        <li>
                            <Link to ="/about">Sobre nosotros</Link>
                        </li>
                    </ul>   
                </div>
            </header>
    )
}