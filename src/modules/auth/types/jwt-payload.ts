export interface JwtPayload {
  sub: number; // User ID
  email: string; // Email (to display in UI)
  role: string; // User role
}
