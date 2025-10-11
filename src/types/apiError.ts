export interface ApiError {
  message: string; // define el tipo de error de API para no romper tipado estatico
  errors?: ValidationError[];
}

export function errorHandler(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("message" in error) return (error.message) as string;
    if ("error" in error) return (error.error) as string;
    if ("errors" in error) return JSON.stringify((error).errors);
  }

  if (typeof error === "string") return error;
  return "Error desconocido";
}

export interface ValidationError {
  field?: string;
  msg: string; // tipo de error que devuelven los usuarios
}