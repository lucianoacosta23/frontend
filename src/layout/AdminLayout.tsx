import { NavLink } from "react-router";


export function AdminLayout(){
    return(
        <header>
            <nav>
                <NavLink to="/admin/coupons">Coupons</NavLink>
                <NavLink to="/admin/localities">Localities</NavLink>
                <NavLink to="/admin/categories">Categories</NavLink>
            </nav>
        </header>
    )
}