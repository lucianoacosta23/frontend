import { Link, useOutletContext } from "react-router";
import { useCallback, useState, useEffect } from "react";
import '../../../static/css/crudTable.css'
import type { BusinessData } from "../../../types/businessType";

export default function InactiveBusinesses() {
    const [data, setData] = useState<BusinessesResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);


    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getAll = useCallback(async () =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;
                const response = await fetch('http://localhost:3000/api/business/findInactive',{method:"GET", headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }}
                )
                if(!response.ok){
                    if(response.status == 404){
                        throw new Error("No hay solicitudes de negocio")
                    }
                    throw new Error("HTTP Error! status: " + response.status)
                }
                const json:BusinessesResponse = await response.json()
                setData(json)
            }catch(error){
                showNotification('' + error, 'error')
                setError(true)
                setLoading(false)
            }finally{
                setLoading(false)
            }
        }, [showNotification])

        useEffect(()=>{
            if(!error){
                getAll();
            }
        }, [error, getAll])
    
        const update = async (id:number) =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;
                const response = await fetch(`http://localhost:3000/api/business/activate/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                showNotification('Negocio habilitado con éxito!', 'success')
            }catch(error){
                showNotification('Error: ' + error, 'error')
            }
        }

        const promote = async (id:number) =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;
                const response = await fetch(`http://localhost:3000/api/users/promoteToBusinessOwner/${id}`, {
                method: "PUT",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            })
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
            }catch(error){
                showNotification('Error: ' + error, 'error')
            }
        }

        const handleActivateSubmit = (e: React.MouseEvent<HTMLButtonElement>, ownerId:number) => {
                if(confirm("¿Estas seguro que quieres habilitar el negocio seleccionado?")){
                    if(e.currentTarget.value) {
                        update(Number(e.currentTarget.value));
                        promote(Number(ownerId));
                    }
                }
            };

    
  return (
    <div style={{ padding: '2rem' }}>
        <div className="crud-home-container">
          <h1 className="crud-title">Habilitación de Negocios</h1>
          <div className="menu-section">
            <nav className="crud-menu">
              <Link to="/admin/inactiveBusinesses" className="menu-item">
              Inicio
              </Link>
            </nav>
          </div>
          <div className="content-area">
            {loading && <div>Loading...</div>}
                <pre>
                <table className='crudTable'>
                    <thead>
                        <th>Business ID</th>
                        <th>Business Name</th>
                        <th>Owner ID</th>
                        <th>Locality ID</th>
                        <th>Address</th>
                        <th>Opening At</th>
                        <th>Closing At</th>
                        <th>Deposit</th>
                        <th>Activate</th>
                    </thead>
                    <tbody>
                        {data?.data.map((business) => (
                <tr key={business.id}>
                <td>{business.id}</td>
                <td>{business.businessName}</td>
                <td>{business.owner}</td>
                <td>{business.locality}</td>
                <td>{business.address}</td>
                <td>{business.openingAt}</td>
                <td>{business.closingAt}</td>
                <td>{business.reservationDepositPercentage}</td>           
                <td><button className='action-button delete' onClick={(e) => handleActivateSubmit(e, business.owner!)} value={business.id}>Habilitar</button></td>
                </tr>
            ))}
                    </tbody>
                </table>
                </pre>
          </div>
        </div>
      </div>)
}

type BusinessesResponse = {
    data: BusinessData[];
};