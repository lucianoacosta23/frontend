import { useNavigate } from 'react-router-dom';
import '../static/css/loginPage.css'
import { useState } from 'react';

export function LoginPage(){
    const [error, setError] = useState<Error | null>(null)
    const navigate = useNavigate();

    async function login(user:UserData){
        try{
        const response = await fetch('http://localhost:3000/api/login',{method:"POST",
                headers: { 'Content-Type': 'application/json',}, 
                body: JSON.stringify(user)})
                if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const token = await response.json()
            localStorage.setItem('user', token)
            
            alert('Sesión iniciada con éxito')
            navigate('/')
        }catch(error){
            setError(error as Error)
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const user:UserData = {
                email:String(formData.get("mail")),
                password:String(formData.get("pass")),
                name:'',
                category:0
            }
            if(user) {
                login(user);
            }
          };

    return (
        <div className='logBody'>
        <form className="logForm" onSubmit={handleSubmit}>
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
            </section>
            <aside className="logSubmitContainer">
                <input type="submit" className="logSubmit" value="Iniciar sesión" />
                <input type="button" className="logSubmit" value="Registrarse"/>
            </aside>
            {error && <span className='errorMsg'>{error.message}</span>}
        </form>
        </div>
    )
}

type UserData = {
    email:string,
    password:string,
    name:string,
    category:number
}

