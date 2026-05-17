import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  let headers: { [key: string]: string } = {
    'ngrok-skip-browser-warning': 'any',
    'x-ngrok-skip-browser-warning': 'any',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cloned = req.clone({
    setHeaders: headers,
  });
  return next(cloned);
};
