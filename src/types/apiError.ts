export interface ApiError {
  message: string; // define el tipo de error de API para no romper tipado estatico
  errors?: ValidationError[];
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === "object" && error !== null && "message" in error; // verifica si es error de api
}

export interface ValidationError {
  field?: string;
  msg: string; // tipo de error que devuelven los usuarios
}