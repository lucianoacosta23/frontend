import type {Coupon} from '../../../types/couponType.ts'
import { useState } from 'react';

export default function CouponGetOne(){
    const [data, setData] = useState<CouponResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const getOne = async (id:string) =>{
        try{
            setLoading(true)
            setError(null)
            const response = await fetch('http://localhost:3000/api/coupons/getOne/'+id)
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
        const id = formData.get("id") as string;
        if (id) {
            getOne(id);
        }
  };
    
    return (
        <div>
            <h2>Conseguir cupón</h2>
            <form onSubmit={handleSubmit}>
                <label>ID del cupón</label>
                <input name="id" type="number" required />
                <button type="submit">Conseguir cupón</button>
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
        </div>
    )
}

type CouponResponse = {
    data:Coupon
}