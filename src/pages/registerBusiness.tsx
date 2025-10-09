import '../static/css/registerBusiness.css'
import type { BusinessData } from '../types/businessType';
import type { UserData } from '../types/userData';
import { jwtDecode } from 'jwt-decode';
import { Navigate, useOutletContext, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';

interface Locality {
  id?: number;
  name: string;
  postal_code: number;
  province: string;
}

export function RegisterBusinessPage(){
    const [localidad, setLocalidad] = useState("")
    const [hasBusiness, setHasBusiness] = useState(false)
    const handleLocalityChange = (e:React.ChangeEvent<HTMLSelectElement>) => {
        setLocalidad(e.target.value);
     };

    const [loading, setLoading] = useState<boolean>(false);
    const [localities, setLocalities] = useState<Locality[]>([]);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();

    useEffect(() => {
        const previousBusiness = async () =>{
        try{
            setLoading(true)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const data = jwtDecode(token) as UserData;
            const response = await fetch('http://localhost:3000/api/users/hasBusiness/'+data.id,{method:"GET",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },}
            )
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const responseData = await response.json();
            setHasBusiness(responseData.response);
        }catch(error){
            showNotification('Error: ' + error, 'error')
            setLoading(false)
        }finally{
            setLoading(false)
        }
      }
      previousBusiness();
        const fetchLocalities = async () => {
          try {
            setLoading(true);
            
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            
            if (!token) {
              throw new Error('No se encontró token de autenticación');
            }
            
            const response = await fetch('http://localhost:3000/api/localities/getAll', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!response.ok) {
              if (response.status === 401) {
                throw new Error('Token de autenticación inválido o expirado');
              }
              throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
            
            const responseData = await response.json();
            
            let localityData: Locality[] = [];
            
            if (Array.isArray(responseData)) {
              localityData = responseData;
            } else if (responseData.localities && Array.isArray(responseData.localities)) {
              localityData = responseData.localities;
            } else if (responseData.data && Array.isArray(responseData.data)) {
              localityData = responseData.data;
            } else {
              throw new Error('Formato de respuesta inesperado');
            }
            
            setLocalities(localityData);
          } catch (err) {
            showNotification("Error al cargar localidades: " + err, "error")
          } finally {
            setLoading(false);
          }
        };
    
        fetchLocalities();
      }, [showNotification]);

    const storedUser = localStorage.getItem('user')
    if(!storedUser){
        return <Navigate to="/"/>
    }

    const create = async (business:BusinessData) =>{
        try{
            setLoading(true)
            const token = JSON.parse(storedUser).token;
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
            navigate('/')
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
                const locId = localities.find(loc => loc.name === String(formData.get("businessLocality")))?.id;
                if(locId){
                const business:BusinessData = {
                    address:String(formData.get("businessAdress")),
                    businessName:String(formData.get("businessName")),
                    reservationDepositPercentage:Number(formData.get("businessPercentage")),
                    averageRating:0,
                    locality:locId,
                    id:0,
                    owner:ownerId,
                    active:false,
                }
                if(business && !hasBusiness) {
                    create(business);
                }
                if(hasBusiness){
                  showNotification('Ya hay una solicitud de negocio a tu nombre', 'warning')
                }
              }
        };

    const userData = jwtDecode(storedUser) as UserData
 
    const ownerId = userData.id;
    if(!userData){
        alert('No se puede recuperar el id del usuario. Redirigiendo...')
        return <Navigate to="/"/> 
    }
    if(userData.category == "owner"){
        alert("Usted ya tiene un negocio en su nombre")
        return <Navigate to="/"/> 
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
                    <div className="input">
                    <label htmlFor="businessLocality">Localidad del negocio</label>
                    <select
                        required
                        id="businessLocality"
                        name="businessLocality"
                        onChange={handleLocalityChange}
                        value={localidad}>
                                {localities.length > 0 &&
                                localities.map((item, index) => (
                                    <option key={index} value={item.name}>{item.name}</option>
                                ))}
                            </select>
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