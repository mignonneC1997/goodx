import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';

import { Http, HttpOptions } from '@capacitor-community/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';

import { environment } from '../../../src/environments/environment';
import { HttpHeaderService } from './http-headers.service';
import { responseTimeout } from '../../../config';

@Injectable({
  providedIn: 'root'
})
export class BookingsService {
  constructor(private http: HttpClient, private httpHeaderService: HttpHeaderService) { }

  public bookingWeb = (): Observable<any> => {
    return this.http.get<any>(environment.urlWeb + 'booking?fields=["entity_uid","diary_uid","booking_type_uid","booking_status_uid","patient_uid","start_time","duration","treating_doctor_uid","reason","invoice_nr","cancelled","debtor","location_uid","meta_data","updated_at"]', { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public bookingsNative = (): Observable<any> => {
    const url = environment.urlNative + 'booking?fields=["entity_uid","diary_uid","booking_type_uid","booking_status_uid","patient_uid","start_time","duration","treating_doctor_uid","reason","invoice_nr","cancelled","debtor","location_uid","meta_data","updated_at"]';
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

  public updateBookingWeb = (data:any): Observable<any> => {
    const uid = data.uid;
    const putData = {
      model: {
        uid: data.uid,
        start_time: data.start_time,
        duration: data.duration,
        patient_uid: data.patient_uid,
        reason: data.reason,
        cancelled: false,
        booking_status_uid: data.booking_status_uid,
        booking_type_uid: data.booking_type_uid,
      }
    }
    return this.http.put<any>(environment.urlWeb + `booking/${uid}`, putData, { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public updateBookingNative = (data:any): Observable<any> => {
    const uid = data.uid;
    const putData = {
      model: {
        uid: data.uid,
        start_time: data.start_time,
        duration: data.duration,
        patient_uid: data.patient_uid,
        reason: data.reason,
        cancelled: false,
        booking_status_uid: data.booking_status_uid,
        booking_type_uid: data.booking_type_uid,
      }
    }
    const url = environment.urlNative + `booking/${uid}`;
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      url,
      method: 'PUT',
      data: putData
    }

    return new Observable(observer => {
      from(Http.put(options)
        .then(response => {
          observer.next(response); // Emit the response
          observer.complete();    // Complete the Observable
        })
        .catch(error => {
          observer.error(error);  // Emit the error
        }));
    });
  }

  public removeBookingWeb = (data: any): Observable<any> => {
    const uid = data.uid;
    const putData = {
      model: {
        uid: data.uid,
        cancelled: true
      }
    }
    return this.http.put<any>(environment.urlWeb + `booking/${uid}`, putData, { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public removeBookingNative = (data:any): Observable<any> => {
    const uid = data.uid;
    const putData = {
      model: {
        uid: data.uid,
        cancelled: true
      }
    }
    const url = environment.urlNative + `booking/${uid}`;
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      url,
      method: 'PUT',
      data: putData
    }

    return new Observable(observer => {
      from(Http.put(options)
        .then(response => {
          observer.next(response); // Emit the response
          observer.complete();    // Complete the Observable
        })
        .catch(error => {
          observer.error(error);  // Emit the error
        }));
    });
  }

  public bookingTypesWeb = (): Observable<any> => {
    return this.http.get<any>(environment.urlWeb + 'booking_type?fields=["uid","entity_uid","diary_uid","name","booking_status_uid","disabled","uuid"]', { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public bookingTypesNative = (): Observable<any> => {
    const url = environment.urlNative + 'booking_type?fields=["uid","entity_uid","diary_uid","name","booking_status_uid","disabled","uuid"]';
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

  public bookingStatusWeb = (): Observable<any> => {
    return this.http.get<any>(environment.urlWeb + 'booking_status?fields=["uid","entity_uid","diary_uid","name","next_booking_status_uid","is_arrived","is_final", "disabled"]', { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public bookingStatusNative = (): Observable<any> => {
  const url = environment.urlNative + 'booking_status?fields=["uid","entity_uid","diary_uid","name","next_booking_status_uid","is_arrived","is_final", "disabled"]';
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

  public makeBookingWeb = (data:any): Observable<any> => {
    const postData = {
      fields: [
        "uid",
        "entity_uid",
        "diary_uid",
        "booking_type_uid",
        "booking_status_uid",
        "patient_uid",
        "location_uid",
        "start_time",
        "duration",
        "reason",
        "debtor",
        "cancelled",
        "invoice_nr",
        "receipts",
        "treating_doctor_uid",
        "referring_doctor_uid",
        "meta_data",
        "service_center_uid",
        "updated_at"
      ],
      model: {
        entity_uid: data.entity_uid,
        diary_uid: data.diary_uid,
        booking_type_uid: data.booking_type_uid,
        booking_status_uid: data.booking_status_uid,
        start_time: data.start_time,
        duration: data.duration,
        patient_uid: data.patient_uid,
        reason: data.reason,
        cancelled: false
      }
    };

    return this.http.post<any>(environment.urlWeb + 'booking', postData, { headers: this.httpHeaderService.getHTTPHeaders(), observe: 'response' }).pipe(
      timeout(responseTimeout),
      map((response: HttpResponse<any>) => {
        return response.body;
      }), catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    ); 
  }

  public makeBookingNative = (data:any): Observable<any> => {
    const postData = {
      fields: [
        "uid",
        "entity_uid",
        "diary_uid",
        "booking_type_uid",
        "booking_status_uid",
        "patient_uid",
        "location_uid",
        "start_time",
        "duration",
        "reason",
        "debtor",
        "cancelled",
        "invoice_nr",
        "receipts",
        "treating_doctor_uid",
        "referring_doctor_uid",
        "meta_data",
        "service_center_uid",
        "updated_at"
      ],
      model: {
        entity_uid: data.entity_uid,
        diary_uid: data.diary_uid,
        booking_type_uid: data.booking_type_uid,
        booking_status_uid: data.booking_status_uid,
        start_time: data.start_time,
        duration: data.duration,
        patient_uid: data.patient_uid,
        reason: data.reason,
        cancelled: false
      }
    };
    const url = environment.urlNative + 'booking';
    const options: HttpOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      url,
      data: postData,
      method: 'POST'
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
