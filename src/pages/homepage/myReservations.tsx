import { useEffect, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { Reservation } from '../../types/reservationType.ts';
import { useOutletContext } from 'react-router';
import { errorHandler } from '../../types/apiError.ts';
import '../../static/css/myReservations.css'
import type { UserData } from '../../types/userData.ts';

export default function MyReservations() {
    const [data, setData] = useState<ReservationResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);
    const [ userData, setUserData] = useState<UserData>();

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const findAllFromUser = useCallback(async (id:number) =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;

                const response = await fetch('http://localhost:3000/api/reservations/findAllFromUser/'+id,{
                    method:"GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if(!response.ok){
                    const errors = await response.json();
                    throw errors
                }
                const json:ReservationResponse = await response.json()
                setData(json)
            }catch(error){
                showNotification(errorHandler(error), 'error');
                setError(true);
                setLoading(false)
            }finally{
                setLoading(false)
            }
        }, [showNotification])

        

        useEffect(() => {
        const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUserData(jwtDecode(storedUser));
            }
        }, []);

        useEffect(() => {
            if (!error && userData?.id) {
                findAllFromUser(userData.id);
            }
        }, [error, findAllFromUser, userData]);
    


    const remove = async (id:number) =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;
                const response = await fetch('http://localhost:3000/api/reservations/cancel/'+id,{
                    method:"DELETE",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }}
                )
                if(!response.ok){
                    const errors = await response.json()
                    throw errors
                }
                showNotification('Reserva cancelada con éxito!', 'success')
            }catch(error){
                 showNotification(errorHandler(error), 'error');
            }
        }
        
  const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(confirm("¿Estas seguro que quieres cancelar la reserva?")){
            if(e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
      };
    
  return (
    <div className='crud-home-container'>
         {!loading && <pre className='content-area'>
            <h1>Mis Reservas</h1>
            <table className='crudTable'>
                <thead>
                    <th>ID de reserva</th>
                    <th>Negocio</th>
                    <th>ID Cancha</th>
                    <th>Fecha y hora de reserva</th>
                    <th></th>
                </thead>
                <tbody>
                    {data?.data.map((reservation:Reservation) => (
            <tr key={reservation.id}>
              <td>{reservation.id}</td>
              <td>{typeof(reservation.pitch.business) === "object" && reservation.pitch.business.businessName}</td>
              <td>{reservation.pitch.id}</td>  
              <td>{reservation.ReservationTime}</td>
              <td><button className='action-button delete' value={reservation.id} onClick={handleDeleteSubmit}>Cancelar</button></td>
            </tr>
          ))}
                </tbody>
            </table>
        </pre>}
        {loading && <h3>Loading...</h3>}
    </div>
  );
}

type ReservationResponse = {
    data: Reservation[];
};
