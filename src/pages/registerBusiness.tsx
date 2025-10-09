import '../static/css/registerBusiness.css'
import type { BusinessData } from '../types/businessType';
import type { UserData } from '../types/userData';
import { jwtDecode } from 'jwt-decode';
import { Navigate, useOutletContext, useNavigate } from 'react-router';
import { useState } from 'react';

export function RegisterBusinessPage(){
    const [loading, setLoading] = useState<boolean>(false);
        
    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    const create = async (business:BusinessData) =>{
        try{
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/business/add',{method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }, 
                body: JSON.stringify(business)}
            )
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            showNotification('Formulario enviado con éxito', 'success')
            navigate('/home')
        }catch(error){
            showNotification('Error: ' + error, 'error')
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }

    const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const business:BusinessData = {
                    adress:String(formData.get("businessAdress")),
                    businessName:String(formData.get("businessName")),
                    reservationDepositPercentage:Number(formData.get("businessPercentage")),
                    averageRating:0,
                    id:0,
                    owner:ownerId,
                    active:false,
                }
                if(business) {
                    create(business);
                }
        };

    const storedUser = localStorage.getItem('user')
    if(!storedUser){
        alert('sesion no iniciada')
        return <Navigate to="/login"/>
    }
    const userData = jwtDecode(storedUser) as UserData
 
    const ownerId = userData.id;
    if(!userData){
        alert('No se puede recuperar el id del usuario. Redirigiendo')
        return <Navigate to="/home"/> 
    }


    return(
        <div className="registerMainContent">
            <h1 className='formTitle'>Registrar negocio</h1>
            <form className='registerForm' onSubmit={handleRegisterSubmit}>
                {!loading && <div className="inputs">
                    <div className='input'>
                        <label htmlFor="businessName">Nombre del negocio</label>
                        <input type='text' required id="businessName" name="businessName"/>
                    </div>
                    <div className='input'>
                        <label htmlFor='businessAdress'>Dirección del negocio</label>
                        <input type='text' required id="businessAdress" name="businessAdress"/>
                    </div>
                    <div className='input'>
                        <label htmlFor="businessPercentage">Porcentaje de reserva</label>
                        <input type='number' required id="businessPercentage" step="0.01" name="businessPercentage" max={0.5} />
                    </div>
                </div>}
                {loading && <div>Cargando...</div>}
                <div className="submit">
                    <button type="button" className="secondary">Cancelar</button>
                    <button type="submit" className="primary">Enviar formulario</button>
                </div>
            </form>
        </div>
    )
}