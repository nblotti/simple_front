import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Router} from '@angular/router';
import {UserContextService} from "./auth/user-context.service";

@Injectable()
export class MyHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const userContextService: UserContextService = inject(UserContextService);
    const router = inject(Router);

    if ((!req.url.endsWith("/generate-qrcode/")  && !req.url.endsWith("/login/local")) && !userContextService.isLogged()) {
      router.navigate(['/login']);
      return throwError(() => "Not logged in!");
    } else {
      const token = userContextService.getJwtToken()();
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });

      return next.handle(clonedRequest).pipe(
        // Handle the response and navigate on error
        catchError((err: any) => {
          if (err instanceof HttpErrorResponse) {
            // Handle HTTP errors
            if (err.status === 401) {
              // Specific handling for unauthorized errors
              console.error('Unauthorized request:', err);
              // You might trigger a re-authentication flow or redirect the user here
            } else {
              // Handle other HTTP error codes
              console.error('HTTP error:', err);
            }
          } else {
            // Handle non-HTTP errors
            console.error('An error occurred:', err);
          }

          // Re-throw the error to propagate it further
          return throwError(() => err);
        })
      );
    }
  }
}
