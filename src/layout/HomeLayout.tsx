import { Outlet } from "react-router"
import { HomePageNav } from "../pages/homepage/homePageNav"
import { useState } from "react"
import HomeFooter from "../pages/homepage/homeFooter"
import Toast from "../components/Toast"

export function HomeLayout(){
    // 🎯 NUEVOS ESTADOS PARA EL TOAST
        const [showToast, setShowToast] = useState(false);
        const [toastMessage, setToastMessage] = useState('');
        const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('success');
    
        // 🎯 FUNCIÓN PARA MOSTRAR TOAST
        const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
            setToastMessage(message);
            setToastType(type);
            setShowToast(true);
        };
    
        // 🎯 FUNCIÓN PARA CERRAR TOAST
        const closeToast = () => {
            setShowToast(false);
        };
    return (
        <section className="homeLayout">
            <HomePageNav showNotification={showNotification}/>
            <Outlet context={{showNotification}}/>
            <HomeFooter />
            <Toast
            message={toastMessage}
            type={toastType}
            isVisible={showToast}
            onClose={closeToast}
            duration={4000}
            />
        </section>
    )
}