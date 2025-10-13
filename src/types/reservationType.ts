import type { Pitch } from "./pitchType.ts";
import type { UserData } from "./userData.ts";

export type Reservation = {
  id: number;
  ReservationDate: number;
  ReservationTime: string;
  pitch: Pitch; 
  user: UserData; 
};