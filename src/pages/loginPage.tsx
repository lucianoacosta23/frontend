import './loginPage.css'

export function LoginPage(){
    return (
        <div className='logBody'>
        <form className="logForm">
            <header className="logContainerHeader">
                <h1 className="logContainerHeaderText">Iniciar sesión</h1>
            </header>
            <section className="logInputs">
                <div className="logInput">
                    <input type="email" required placeholder=' ' id="mail"/>
                    <label htmlFor='mail'>@ Correo electrónico</label>
                </div>
                <div className="logInput">
                    <input type="password" required placeholder=' ' id="pass"/>
                    <label htmlFor="pass">🔐 Contraseña</label>
                </div>
            </section>
            <aside className="logSubmitContainer">
                <input type="submit" className="logSubmit" value="Iniciar sesión"/>
                <input type="button" className="logSubmit" value="Registrarse"/>
            </aside>
        </form>
        </div>
    )
}