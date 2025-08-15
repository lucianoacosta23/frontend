import { useEffect, useState } from 'react';
import './couponTable.css'
import type {Coupon} from '../../../types/couponType.ts'

export default function CouponGetAll() {
    const [data, setData] = useState<CouponResponse | null>(null);
    const [errorGet, setErrorGet] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const [errorDelete, setErrorDelete] = useState<Error | null>(null);

    const getAll = async () =>{
            try{
                setLoading(true)
                setErrorGet(null)
                const response = await fetch('http://localhost:3000/api/coupons/getAll',{method:"GET"}
                )
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                const json:CouponResponse = await response.json()
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
                const response = await fetch('http://localhost:3000/api/coupons/remove/'+id,{method:"DELETE"}
                )
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                alert('Cupón eliminado con éxito')
                getAll();
            }catch(error){
                setErrorDelete(error as Error)
            }
        }

  const handleDeleteSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
        if(confirm("¿Estas seguro que quieres eliminar el cupón seleccionado?")){
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
        alert('No se ha podido eliminar el cupón')
    }
  return (
    <div>
        <pre>
            <table className='couponTable'>
                <thead>
                    <th>ID</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Expiring Date</th>
                    <th>Eliminar</th>
                </thead>
                <tbody>
                    {data?.data.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.id}</td>
              <td>{coupon.discount}</td>
              <td>{coupon.status}</td>
              <td>{coupon.expiringDate}</td>
              <td><button onClick={handleDeleteSubmit} value={coupon.id}>❌</button></td>
            </tr>
          ))}
                </tbody>
            </table>
        </pre>
    </div>
  );
}

type CouponResponse = {
    data: Coupon[];
};