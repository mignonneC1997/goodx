import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import { HttpHeaderService } from './http-headers.service';
import { query } from '@angular/animations';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private httpHeaderService: HttpHeaderService) { }

  public login = (data: any): Observable<any> => {
    return this.http.post<any>(environment.url, data, { headers: this.httpHeaderService.getHTTPHeaders() }).pipe(
      map((response: HttpResponse<any>) => {
        return response;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
  }
}
