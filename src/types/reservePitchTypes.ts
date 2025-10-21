// Types for the Reserve Pitch feature

export interface PitchBusiness {
  id: number;
  businessName: string;
}

export interface ReservePitch {
  id: number;
  rating: number;
  size: "pequeño" | "mediano" | "grande";
  groundType: "césped natural" | "césped sintético" | "cemento" | "arcilla";
  roof: boolean;
  price: number;
  imageUrl?: string;
  driveFileId?: string;
  createdAt: string;
  updatedAt: string;
  business: PitchBusiness;
}

export interface ReservePitchFilters {
  roof: 'all' | 'covered' | 'uncovered';
  size: string;
  groundType: string;
  priceMin: number;
  priceMax: number;
  searchTerm: string;
}

export interface ReservationFormData {
  pitchId: number;
  date: string;
  time: string;
}

export interface ReservationRequest {
  ReservationDate: string | Date;
  ReservationTime: string | Date;
  pitch: number;
  user: number;
}
