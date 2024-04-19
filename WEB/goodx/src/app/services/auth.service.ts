import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../src/environments/environment';
import { HttpHeaderService } from './http-headers.service';
import { Http, HttpOptions } from '@capacitor-community/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient, private httpHeaderService: HttpHeaderService) { }

  public loginWeb = (data:any): Observable<any> => {
      return this.http.post<any>(environment.urlWeb + 'session', data, { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
      ); 
  }

  public loginNative = (object:any): Observable<any> => {
    const url = environment.urlNative + 'session';
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      url,
      method: 'POST',
      data: object
    }

    return new Observable(observer => {
      from(Http.post(options)
        .then(response => {
          observer.next(response); // Emit the response
          observer.complete();    // Complete the Observable
        })
        .catch(error => {
          observer.error(error);  // Emit the error
        }));
    });
  }
}
