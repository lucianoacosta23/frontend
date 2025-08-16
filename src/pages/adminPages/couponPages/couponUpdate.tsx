import { useState } from 'react';
import type {Coupon} from '../../../types/couponType.ts'

export default function CouponUpdate(){
    const [data, setData] = useState<CouponResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    
    const update = async (coupon:Coupon) =>{
        try{
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:3000/api/coupons/update/' + String(coupon.id),{method:"PATCH",
                headers: { 'Content-Type': 'application/json',}, 
                body: JSON.stringify(coupon)}
            )
            if(!response.ok){
                throw new Error("HTTP Error! status: " + response.status)
            }
            const json:CouponResponse = await response.json()
            setData(json)
            alert('Cupón actualizado con éxito')
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
            id:Number(formData.get("id")),
            discount:Number(formData.get("discount")),
            status:String(formData.get("status")),
            expiringDate:String(formData.get("expiringDate"))
        }
        if(coupon) {
            update(coupon);
        }
      };

    return (
    <div>
            <h2>Actualizar cupón</h2>
            <form onSubmit={handleSubmit}>
                <label>ID</label>
                <input type="number" name="id" required />
                <label>Discount</label>
                <input name="discount" type="number" required step="0.01" max={1}/>
                <label>Status</label>
                <input type="text" name="status" required />
                <label>Expiring Date</label>
                <input type="date" name="expiringDate" required />
                <button type="submit">Actualizar</button>
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
                    <td>{data.updatedCoupon.id}</td>
                    <td>{data.updatedCoupon.discount}</td>
                    <td>{data.updatedCoupon.status}</td>
                    <td>{data.updatedCoupon.expiringDate}</td>
                    </tr>
                </tbody>
                </table>)}
                </pre>
        </div>)
}

type CouponResponse = {
    updatedCoupon:Coupon
}