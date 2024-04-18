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
        this.authService.getToken('userToken').then(result => {
            this.authToken = result;
        }).catch(err =>{})

        const token = localStorage.getItem('userToken');
        console.log('neee tokn oauth token == ', token);

        // Clone the request and add the token to the Authorization header
        console.log('auth token == ', this.authToken);
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
