import { useState, useEffect } from 'react';
import './couponTable.css'
import type {Coupon} from './couponJSON.ts'

export default function CouponGetAll() {
    const [data, setData] = useState<CouponResponse | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetch('http://localhost:3000/api/coupons/getAll').then(response =>{
            if(!response.ok){
                throw new Error('HTTP error! status:' + response.status);
            }
            return response.json() as Promise<CouponResponse>;
        })
        .then(json=>{
            setData(json);
            setLoading(false);
        })
        .catch(
            (error:Error) =>{
                setError(error);
                setLoading(false);
            }
        )
    }, []);

     if (loading) return 'Loading...';
     if (error) {
        return <div>Error: {error.message}</div>
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
                </thead>
                <tbody>
                    {data?.data.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.id}</td>
              <td>{coupon.discount}</td>
              <td>{coupon.status}</td>
              <td>{coupon.expiringDate}</td>
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