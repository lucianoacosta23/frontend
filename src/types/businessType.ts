export type BusinessData = {
  id: number;
  owner:number | undefined;
  businessName: string;
  adress: string;
  averageRating: number; 
  reservationDepositPercentage:number,
  active:boolean;
};