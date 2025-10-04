import { useEffect, useState, useCallback } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useOutletContext } from 'react-router';

export default function CouponGetAll() {
    const [data, setData] = useState<CouponResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [ error, setError ] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();

    const getAll = useCallback(async () =>{
            try{
                setLoading(true)
                const token = JSON.parse(localStorage.getItem('user') || '{}').token;

                const response = await fetch('http://localhost:3000/api/coupons/getAll',{
                    method:"GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                const json:CouponResponse = await response.json()
                setData(json)
            }catch(error){
                showNotification('Error: '+error, 'error')
                setError(true);
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
    
    const remove = async (id:number) =>{
            try{
                setLoading(true)
                const response = await fetch('http://localhost:3000/api/coupons/remove/'+id,{method:"DELETE"}
                )
                if(!response.ok){
                    throw new Error("HTTP Error! status: " + response.status)
                }
                showNotification('Cupón eliminado con éxito!', 'success')
                getAll();
            }catch(error){
                showNotification('Error: '+error, 'error')
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
  return (
    <div>
        <pre>
            <table className='crudTable'>
                <thead>
                    <th>ID</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Expiring Date</th>
                    <th></th>
                </thead>
                <tbody>
                    {data?.data.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.id}</td>
              <td>{coupon.discount}</td>
              <td>{coupon.status}</td>
              <td>{coupon.expiringDate}</td>
              <td><button className='action-button delete' onClick={handleDeleteSubmit} value={coupon.id}>Eliminar</button></td>
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