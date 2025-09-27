import { useNavigate } from 'react-router-dom';
import '../static/css/loginPage.css'
import { useState } from 'react';
import type { UserData } from '../types/userData.js';


export function LoginPage(){
    const [errorMessages, setErrorMessages] = useState<string[]>([]);
    const navigate = useNavigate();
    const [loginPage, changePage] = useState<boolean>(true);

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
            
            alert('Sesión iniciada con éxito')
            navigate('/')
        }catch(err:unknown){
            if (isApiError(err)) {
            if (Array.isArray(err.errors)) {
            setErrorMessages(err.errors.map(e => e.msg));
            } else {
            setErrorMessages([err.message]);
            }
            } else if (err instanceof Error) {
                setErrorMessages([err.message]);
            } else {
                setErrorMessages(["Error desconocido"]);
            }
            }
    }

    async function register(user:UserData){
        try{
        const response = await fetch('http://localhost:3000/api/users/add',{method:"POST",
                headers: { 'Content-Type': 'application/json',}, 
                body: JSON.stringify(user)})
                if(!response.ok){
                const errors: ApiError = await response.json()
                throw errors
            }
            const token = await response.json()
            delete token.surname;
            delete token.phoneNumber;
            alert('Usuario creado con éxito')
            login(user)
        }catch(err:unknown){
            if (isApiError(err)) {
                if (Array.isArray(err.errors)) {
                setErrorMessages(err.errors.map(e => e.msg)); // si es array lo mapea
                } else {
                setErrorMessages([err.message]); // si es unico, lo devuelve
                }
            } else if (err instanceof Error) {
                setErrorMessages([err.message]); // si no es error de api y es de tipo Error, lo devuelve
            } else {
                setErrorMessages(["Error desconocido"]); // no pudo identificarlo
            }
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
                category:'cliente'
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
            <div className='errorBox'>
            {errorMessages.length > 0 && (
                    <ul>
                    {errorMessages.map((err, idx) => (
                        <li key={idx} className="errorMsg">{err}</li>
                    ))}
                    </ul>
                )}
            </div>
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
            <div className='errorBox'>
            {errorMessages.length > 0 && (
                    <ul>
                    {errorMessages.map((err, idx) => (
                        <li key={idx} className="errorMsg">{err}</li>
                    ))}
                    </ul>
                )}
            </div>
        </form>
        </div>}
        </>
    )
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "message" in error; // verifica si es error de api
}
interface ValidationError {
  field?: string;
  msg: string; // tipo de error que devuelven los usuarios
}

interface ApiError {
  message: string;
  errors?: ValidationError[]; // define el tipo de error de API para no romper tipado estatico
}