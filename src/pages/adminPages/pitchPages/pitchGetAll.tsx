import { useEffect, useState } from 'react';
import './couponTable.css'
import type {Pitch} from '../../../types/pitchType.ts'

export default function PitchGetAll() {
    const [data, setData] = useState<PitchResponse | null>(null);
    const [errorGet, setErrorGet] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [errorDelete, setErrorDelete] = useState<Error | null>(null);

    const getAll = async () =>{
            try{
                setLoading(true)
                setErrorGet(null)
                const response = await fetch('http://localhost:3000/api/pitchs/getAll',{method:"GET"}
                )
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                const json:PitchResponse = await response.json()
                setData(json)
            }catch(error){
                setErrorGet(error as Error)
                setLoading(false)
            }finally{
                setLoading(false)
            }
        }

        useEffect(()=>{
            getAll();
        }, [])
    
    const remove = async (id:number) =>{
            try{
                setLoading(true)
                setErrorGet(null)
                const response = await fetch('http://localhost:3000/api/pitchs/remove/'+id,{method:"DELETE"}
                )
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                alert('Cancha eliminada con éxito')
                getAll();
            }catch(error){
                setErrorDelete(error as Error)
            }
        }

  const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(confirm("¿Estas seguro que quieres eliminar la cancha seleccionada?")){
            if(e.currentTarget.value) {
                remove(Number(e.currentTarget.value));
            }
        }
      };
     if (loading) return 'Loading...';
     if (errorGet) {
        return <div>Error: {errorGet.message}</div>
    }
    if(errorDelete){
        alert('No se ha podido eliminar la cancha')
    }
  return (
    <div>
        <pre>
            <table className='couponTable'>
                <thead>
                    <th>ID</th>
                    <th>Business ID</th>
                    <th>Rating</th>
                    <th>Price</th>
                    <th>Size</th>
                    <th>Ground type</th>
                    <th>Roof</th>
                </thead>
                <tbody>
                    {data?.data.map((pitch) => (
            <tr key={pitch.id}>
              <td>{pitch.id}</td>
              <td>{pitch.businessId}</td>
              <td>{pitch.rating}</td>
              <td>${pitch.price}</td>
              <td>{pitch.size}</td>
              <td>{pitch.groundType}</td>
              <td>{pitch.roof}</td>
              <td><button onClick={handleDeleteSubmit} value={pitch.id}>❌</button></td>
            </tr>
          ))}
                </tbody>
            </table>
        </pre>
    </div>
  );
}

type PitchResponse = {
    data: Pitch[];
};