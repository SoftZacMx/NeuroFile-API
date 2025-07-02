import { Res } from '../types/response.interface';

export const successResponse = <T>(data: T, message = 'Success'): Res<T> => ({
  error: false,
  result: true,
  data,
  message,
  status_code: 200,
});

export const errorResponse = <T>(message: string, status_code = 500 ,data?:any): Res<T> => ({
  error: true,
  result: false,
  data: data,
  message,
  status_code,
});
