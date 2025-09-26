import { Outlet } from "react-router"
import { HomePageNav } from "../pages/homepage/homePageNav"
import HomeFooter from "../pages/homepage/homeFooter"

export function HomeLayout(){
    return (
        <section className="homeLayout">
            <HomePageNav />
            <Outlet />
            <HomeFooter />
        </section>
    )
}