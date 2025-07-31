import { NavLink } from "react-router";


export function AdminLayout(){
    return(
        <header>
            <nav>
                <NavLink to="/coupons">Coupons</NavLink>
                <NavLink to="/localities">Localities</NavLink>
                <NavLink to="/categories">Categories</NavLink>
            </nav>
        </header>
    )
}