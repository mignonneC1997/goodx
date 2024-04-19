import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StorageService } from './src/app/services/storage.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
public authToken = '';

constructor(private authService: StorageService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Get the authentication token from the AuthService
        const token = localStorage.getItem('userToken');

        // Clone the request and add the token to the Authorization header
        if (token) {
            request = request.clone({
                setHeaders: {
                Authorization: `Bearer ${token}`
                }
            });
        }

        // Pass the cloned request with the updated headers to the next handler
        return next.handle(request);
    }
}
