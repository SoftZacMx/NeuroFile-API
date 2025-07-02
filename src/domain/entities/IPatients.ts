export interface IPatient {
  id: number;
  first_name: string | undefined;
  last_name: string;
  second_last_name?: string | null;
  age: string | undefined;
  gender: string | undefined;
  address?: string  | null;
  is_active: boolean | undefined;
  occupation: string;
  phone: string;
  user_id: number | undefined;
}
