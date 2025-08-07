import { useState } from 'react';
import './couponTable.css'
import type {Coupon} from '../../../types/couponType.ts'

export default function CouponAdd(){
    const [data, setData] = useState<CouponResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const add = async (coupon:Coupon) =>{
        try{
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:3000/api/coupons/add',{method:"POST",
                headers: { 'Content-Type': 'application/json',}, 
                body: JSON.stringify(coupon)}
            )
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const json:CouponResponse = await response.json()
            setData(json)
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

    return (
    <div>
            <h2>Crear cupón</h2>
            <form onSubmit={handleSubmit}>
                <label>Discount</label>
                <input name="discount" type="number" required />
                <label>Status</label>
                <input type="text" name="status" required />
                <label>Expiring Date</label>
                <input type="date" name="expiringDate" required />
                <button type="submit">Crear</button>
            </form>
            <pre>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {data && (
                <table className='couponTable'>
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