import '../static/css/loginPage.css'
import { useState } from 'react';
import type { UserData } from '../types/userData.js';
import Toast from '../components/Toast.js';
import type { ApiError } from '../types/apiError.js';
import { errorHandler } from '../types/apiError.js';


export function LoginPage(){
    const [loginPage, changePage] = useState<boolean>(true);
    
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

    async function login(user:UserData){
        try{
        const response = await fetch('http://localhost:3000/api/login',{method:"POST",
                headers: { 'Content-Type': 'application/json',}, 
                body: JSON.stringify(user)})
                if(!response.ok){
                const errors = await response.json()
                throw errors
            }
            const token = await response.json()

            localStorage.setItem('user', JSON.stringify(token))
            window.location.reload(); // recarga para que detecte el nuevo token
        }catch(err:unknown){
            showNotification(errorHandler(err),'error');}
    }

    async function register(user:UserData){
        try{
        const response = await fetch('http://localhost:3000/api/login/register',{method:"POST",
                headers: { 'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(user)})
                if(!response.ok){
                const errors: ApiError = await response.json()
                throw errors
            }
            alert('Usuario creado con éxito')
            login(user)
        }catch(err:unknown){
            showNotification(errorHandler(err), 'error');
        }
    }

    const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const user:UserData = {
                email:String(formData.get("mail")),
                password:String(formData.get("pass")),
            }
            if(user) {
                login(user);
            }
          };

    const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const user:UserData = {
                email:String(formData.get("mail")),
                password:String(formData.get("pass")),
                name:String(formData.get("name")),
                surname:String(formData.get("surname")),
                phoneNumber:String(formData.get("phone")) || undefined,
                category:'user' // por defecto, el register hace un usuario de tipo user
            }
            if(user) {
                register(user);
            }
          };

    const handleChangePage = () => {
        changePage(!loginPage);
    }

    return (
        <>
        {loginPage && <div className='logBody'>
        <form className="logForm" onSubmit={handleLoginSubmit}>
            <header className="logContainerHeader">
                <h1 className="logContainerHeaderText">Iniciar sesión</h1>
            </header>
            <section className="logInputs">
                <div className="logInput">
                    <input type="email" required placeholder=' ' id="mail" name="mail"/>
                    <label htmlFor='mail'>@ Correo electrónico</label>
                </div>
                <div className="logInput">
                    <input type="password" required placeholder=' ' id="pass" name='pass'/>
                    <label htmlFor="pass">🔐 Contraseña</label>
                </div>
                <div className='otherMsgs'>
                    <span className='otherMsg'>¿Has olvidado tu contraseña?</span>
                    <span className='otherMsg' onClick={handleChangePage}>¿Desea registrarse?</span>
                </div>
            </section>
            <aside className="logSubmitContainer">
                <input type="submit" className="logSubmit" value="Iniciar sesión" />
            </aside>
        </form>
        </div>}
            {!loginPage && <div className='logBody'>
            <form className="logForm" onSubmit={handleRegisterSubmit}>
            <header className="logContainerHeader">
                <h1 className="logContainerHeaderText">Registrar usuario</h1>
            </header>
            <section className="logInputs">
                <div className="logInput">
                    <input type="email" required placeholder=' ' id="mail" name="mail"/>
                    <label htmlFor='mail'>@ Correo electrónico*</label>
                </div>
                <div className="logInput">
                    <input type="password" required placeholder=' ' id="pass" name='pass'/>
                    <label htmlFor="pass">🔐 Contraseña*</label>
                </div>
                <div className="logInput">
                    <input type="text" required placeholder=' ' id="name" name='name'/>
                    <label htmlFor="name">👤 Nombre*</label>
                </div>
                <div className="logInput">
                    <input type="text" required placeholder=' ' id="surname" name='surname'/>
                    <label htmlFor="surname">🫂 Apellido*</label>
                </div>
                <div className="logInput">
                    <input type="tel" placeholder=' ' id="phone" name='phone'/>
                    <label htmlFor="phone">🫂 Teléfono</label>
                </div>
                <div className='otherMsgs'>
                    <span className='otherMsg' onClick={handleChangePage}>¿Desea iniciar sesión?</span>
                    <span className='otherMsg'>*Campo obligatorio</span>
                </div>
            </section>
            <aside className="logSubmitContainer">
                <input type="submit" className="logSubmit" value="Registrarse" />
            </aside>
        </form>
        </div>}
        <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={closeToast}
        duration={4000}
      />
        </>
    )
}