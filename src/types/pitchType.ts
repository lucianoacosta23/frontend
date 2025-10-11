import { BusinessData } from './businessType'; // Si tienes este tipo
import { Reservation } from './reservationType'; // Si tienes este tipo

export type Pitch = {
    id?: number,
    rating: number,
    size: string,
    groundType: string,
    roof: boolean,
    price: number,
    business?: BusinessData | number, // Puede ser el objeto completo o solo el ID
    imageUrl?: string,
    driveFileId?: string,
    createdAt: string | number | Date,
    updatedAt?: string | number | Date,
    reservations?: Reservation[] // Más específico si tienes el tipo
}