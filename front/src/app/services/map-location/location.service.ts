import { Injectable } from '@angular/core';
import * as ol from 'openlayers';
@Injectable()
export class LocationService {
  constructor() { }
  public createLocation(projection: string): ol.Geolocation {
    return new ol.Geolocation({
            projection: projection
        });
  }
  initDataFeatureForLocation(projection: String): any {
    return {
      coordinates: [0, 0]
      , type: 'Point'
      , projection: projection
    };
  }
}
