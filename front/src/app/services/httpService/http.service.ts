import { Router } from '@angular/router';
// import { JwtToken } from './../../model/jwtuser';
import * as Rx from 'rxjs/Rx';
//import { AuthenticationService } from './../guards/authentication.service';
import { Request, Response, RequestOptionsArgs, RequestMethod, Http, Headers, RequestOptions } from '@angular/http';
import { Injectable, EventEmitter } from '@angular/core';

export enum Action { QueryStart, QueryStop };

@Injectable()
export class HttpService {

  process: EventEmitter<any> = new EventEmitter<any>();
  authFailed: EventEmitter<any> = new EventEmitter<any>();

  constructor(private _http: Http, private _router: Router) { }

  /*private _buildAuthHeader(): string {
    const jwtToken: JwtToken = JSON.parse(localStorage.getItem('jwtToken')).jwtToken;
    return jwtToken.token;
  }*/

  public get(url: string, options?: RequestOptionsArgs): Rx.Observable<any> {
    return this._request(RequestMethod.Get, url, null, options);
  }

  public post(url: string, body: string, options?: RequestOptionsArgs): Rx.Observable<any> {
    return this._request(RequestMethod.Post, url, body, options);
  }

  public put(url: string, body: string, options?: RequestOptionsArgs): Rx.Observable<Response> {
    return this._request(RequestMethod.Put, url, body, options);
  }

  public delete(url: string, options?: RequestOptionsArgs): Rx.Observable<Response> {
    return this._request(RequestMethod.Delete, url, null, options);
  }

  public patch(url: string, body: string, options?: RequestOptionsArgs): Rx.Observable<Response> {
    return this._request(RequestMethod.Patch, url, body, options);
  }

  public head(url: string, options?: RequestOptionsArgs): Rx.Observable<Response> {
    return this._request(RequestMethod.Head, url, null, options);
  }

  private _request(method: RequestMethod, url: string, body?: string, options?: RequestOptionsArgs): Rx.Observable<Response> {
    const requestOptions = new RequestOptions(Object.assign({
      method: method,
      url: url,
      body: body
    }, options));

    if (!requestOptions.headers) {
      requestOptions.headers = new Headers();
      requestOptions.headers.set('Content-Type', 'application/json');
    }

    // requestOptions.headers.set('Authorization', 'Bearer ' + this._buildAuthHeader());

    return Rx.Observable.create((observer) => {
      this.process.next(Action.QueryStart);
      this._http.request(new Request(requestOptions))
        .map(res => {
          const jwtToken: any = JSON.parse(localStorage.getItem('jwtToken')).jwtToken;
          if (res.headers !== undefined && res.headers.get('Authorization') !== undefined) {
            jwtToken.token = res.headers.get('Authorization');
            localStorage.setItem('jwtToken', JSON.stringify({ jwtToken: jwtToken }));
          }
          return res.json();
        })
        .finally(() => {
          this.process.next(Action.QueryStop);
        })
        .subscribe(
        (res) => {
          observer.next(res);
          observer.complete();
        },
        (err) => {
          switch (err.status) {
            case 401:
              // intercept 401
              this.authFailed.next(err);
              this._router.navigate(['denied']);
              break;
            default:
              observer.error(err);
              break;
          }
        });
    });
  }
}
