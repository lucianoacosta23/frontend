export interface ApiError {
  message: string; // define el tipo de error de API para no romper tipado estatico
  errors?: ValidationError[];
}

export function errorHandler(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    if ("errors" in error && Array.isArray((error as any).errors)) {
      return (error as any).errors.map((err: any) => err.msg).join("; ");
    }
    if ("message" in error) return (error as any).message as string;
    if ("error" in error) return (error as any).error as string;
  }

  if (typeof error === "string") return error;
  return "Error desconocido";
}

export interface ValidationError {
  field?: string;
  msg: string; // tipo de error que devuelven los usuarios
}