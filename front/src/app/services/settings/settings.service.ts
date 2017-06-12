import { Injectable } from '@angular/core';
import { HttpService } from "app/services/httpService/http.service";
import {API_APP_CONFIG_URL} from '../../shared/app.constants';
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
@Injectable()
export class SettingsService {
public _appSettings: any;
private appSettingsListener: Subject<any> = new Subject<any>();
  constructor(private httpService: HttpService) { }
loadAppConfigs(){
  return this.httpService.get(`${API_APP_CONFIG_URL}`);
}
public appSettings(): Observable<any> {
    return this.appSettingsListener.asObservable();
  }

intnitApp(){
  this.loadAppConfigs().subscribe(setting => {
this._appSettings = setting;
this.appSettingsListener.next(setting);
console.log(setting);
  })
}
}
