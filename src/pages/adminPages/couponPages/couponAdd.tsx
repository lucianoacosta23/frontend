import { useState } from 'react';
import type {Coupon} from '../../../types/couponType.ts'
import { useNavigate, useOutletContext } from 'react-router';

export default function CouponAdd(){
    const [data, setData] = useState<CouponResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const { showNotification } = useOutletContext<{ showNotification: (m: string, t: 'success' | 'error' | 'warning' | 'info') => void }>();
    const navigate = useNavigate();
    
    const add = async (coupon:Coupon) =>{
        try{
            setLoading(true)
            setError(null)
            const token = JSON.parse(localStorage.getItem('user') || '{}').token;
            const response = await fetch('http://localhost:3000/api/coupons/add',{
                method:"POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(coupon)
            })
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const json:CouponResponse = await response.json()
            setData(json)
            showNotification('Cupón actualizado con éxito!', 'success')
            navigate('/admin/coupons/getAll')
        }catch(error){
            setError(error as Error)
            setLoading(false)
        }finally{
            setLoading(false)
        }
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const coupon:Coupon = {
            id:0,
            discount:Number(formData.get("discount")),
            status:String(formData.get("status")),
            expiringDate:String(formData.get("expiringDate"))
        }
        if(coupon) {
            add(coupon);
        }
      };

      const cancel = () => {
        navigate('/admin/coupons')
      }

    return (
    <div className='crud-form-container'>
            <h2 className='crud-form-title'>Crear cupón</h2>
            <form onSubmit={handleSubmit} className='crud-form'>
                <div className='crud-form-item'>
                    <label>Discount</label>
                    <input name="discount" type="number" required step="0.01" max={1}/>
                </div>
                <div className='crud-form-item'>
                    <label>Status</label>
                    <input type="text" name="status" required />
                </div>
                <div className='crud-form-item'>
                    <label>Expiring Date</label>
                    <input type="date" name="expiringDate" required />
                </div>
                <div className='crud-form-actions'>
                    <button onClick={cancel} className='secondary'>Cancelar</button>
                    <button type="submit" className='primary'>Crear</button>
                </div>
            </form>
            <pre>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
                <table className='crudTable'>
                <thead>
                    <tr>
                    <th>ID</th>
                    <th>Discount</th>
                    <th>Status</th>
                    <th>Expiring Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                    <td>{data.data.id}</td>
                    <td>{data.data.discount}</td>
                    <td>{data.data.status}</td>
                    <td>{data.data.expiringDate}</td>
                    </tr>
                </tbody>
                </table>)}
                </pre>
        </div>)
}

type CouponResponse = {
    data:Coupon
}