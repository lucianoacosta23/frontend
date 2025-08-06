import { useState, useEffect } from 'react';

export default function CouponHome() {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/coupons/getAll').then(response =>{
            if(!response.ok){
                throw new Error('HTTP error! status:' + response.status);
            }
            return response.json();
        })
        .then(json=>{
            setData(json);
            setLoading(false);
        })
        .catch(
            error =>{
                setError(error);
                setLoading(false);
            }
        )
    }, []);
    let msg = '';
     if (loading) msg = 'Loading...';
     if (error) {
        return <div>Error: {msg = error.message}</div>
    }else if (data){
        msg = JSON.stringify(data, null, 2);
    }
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Página de cupones</h1>
      <p>¡Bienvenido a la página de gestión de cupones!</p>
        <pre>{msg}</pre>
    </div>
  );
}
