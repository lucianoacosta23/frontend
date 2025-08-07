import type { Pitch } from '../types/pitchType.ts'
import '../static/css/pitchCard.css'

export default function PitchCard({ rating,size,groundType,roof,price, imgUrl}:Pitch){
    let roofMsg:string = '';
    const ratingMsg:string = ('⭐️').repeat(rating);
    if(roof){
        roofMsg = '✅';
    }else{
        roofMsg = '❌';
    }

    return(
        <div className='pitchCard'>
            <img src={imgUrl} />
            <section>
                <p className='pitchPriceCard'>$ {price}</p>
                <p>Cancha de {size}<br />
                Techo {roofMsg}<br />
                Pasto {groundType.toLowerCase()}<br />
                Rating<br/> {ratingMsg}</p>
            </section>
            <button>Reservar</button>
        </div>
    )
}