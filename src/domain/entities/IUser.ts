export interface IUser {
  id: number;
  first_name: string;
  last_name: string;
  middle_last_name?: string  | null;
  role: string;
  password: string;
  email: string;
  is_active: boolean;
  patients?: any[]; 
  phone:string
}
