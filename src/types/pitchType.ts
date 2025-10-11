import { BusinessData } from './businessType'; // Si tienes este tipo
import { Reservation } from './reservationType'; // Si tienes este tipo

export type Pitch = {
    id?:number,
    rating:number,
    size:string,
    groundType:string,
    roof:boolean,
    price:number,
    business?:number,
    imgUrl?:string
}