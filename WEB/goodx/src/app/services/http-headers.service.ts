import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HttpHeaderService {

  constructor(private http: HttpClient) { }

  public getHTTPHeaders = () => {
    const httpHeader = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*'
    });
    return httpHeader;
  }
}
