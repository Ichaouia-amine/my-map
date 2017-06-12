import { Injectable, ElementRef } from '@angular/core';
import { HttpService } from "app/services/httpService/http.service";
import { API_MAP_CONFIG_URL, API_APP_CONFIG_URL} from '../../shared/app.constants';
import { SettingsService } from "app/services/settings/settings.service";
import { MapOpenlayersService } from "app/services/map-openlayers/map-openlayers.service";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
@Injectable()
export class MapToolsService {
 public _mainMap: ol.Map = null;
 private mainMapListener: Subject<any> = new Subject<any>();
  constructor(private httpService: HttpService,private settingsService: SettingsService,
  private mapOpenlayersService:MapOpenlayersService) {
    this.settingsService.appSettings().subscribe(settings => {
      let url: string = API_MAP_CONFIG_URL ;
      if(settings.map_config_url !== null ){
        url = settings.map_config_url;
      }
      this.loadMapsConfigs(url).subscribe(mapConfigs => {
        let currentMapSettings: any = (<any []>mapConfigs).find( e => e.active);
        this._mainMap =this.mapOpenlayersService.innitMap(currentMapSettings);
        this.mainMapListener.next(this._mainMap );
        console.log(mapConfigs);
        
      });
    });
   }
public mainMap(): Observable<any> {
    return this.mainMapListener.asObservable();
  }
loadMapsConfigs(url :string){
  return this.httpService.get(url);
}


}
