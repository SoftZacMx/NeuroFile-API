import { IPatient } from "../../../domain/entities/IPatients";

export interface IUpdatePatientDTO extends Partial<IPatient> {
  id: undefined;
  first_name: string;
  last_name: string;
  second_last_name?: string | null;
  age: string;
  gender: string;
  address?: string  | null;
  is_active: boolean;
  occupation: string;
  phone: string;
}

