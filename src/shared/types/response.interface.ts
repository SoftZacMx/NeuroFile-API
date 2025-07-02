export interface Res<T = any> {
  error: boolean;
  result: boolean;
  data: T | null;
  message?: string;
  status_code: number;
}
