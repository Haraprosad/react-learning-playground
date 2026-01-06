/**
 * User data model
 * Used for API responses and component props
 */
export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phone?: string;
  website?: string;
}
