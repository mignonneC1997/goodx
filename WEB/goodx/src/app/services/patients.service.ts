import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Http, HttpOptions } from '@capacitor-community/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import { environment } from '../../../src/environments/environment';
import { HttpHeaderService } from './http-headers.service';

@Injectable({
  providedIn: 'root'
})
export class PatientsService {

  constructor(private http: HttpClient, private httpHeaderService: HttpHeaderService) { }

  public patientsWeb = (): Observable<any> => {
      return this.http.get<any>(environment.urlWeb + 'patient?fields=["entity_uid","id","debtor_uid","name","surname","initials","title","date_of_birth","mobile_no","gender","benefit_check","id_no","email","file_no","dependant_no","dependant_type","acc_identifier","private"]', { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
      ); 
  }

  public patientsNative = (): Observable<any> => {
    const url = environment.urlNative + 'patient?fields=["entity_uid","id","debtor_uid","name","surname","initials","title","date_of_birth","mobile_no","gender","benefit_check","id_no","email","file_no","dependant_no","dependant_type","acc_identifier","private"]';
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      url,
      method: 'GET'
    }

    return new Observable(observer => {
      from(Http.get(options)
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
