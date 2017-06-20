import { Injectable } from '@angular/core';
import { GeoScaleDto } from 'app/model/map/geoScaleDto';
import { GeoScale } from 'app/model/map/geoScale';
@Injectable()
export class ScaleService {
 private _currentScaleDto: GeoScaleDto;
  constructor() {}
  public get currentScaleDto(): GeoScaleDto {
    return this._currentScaleDto;
  }
  initScale(activeConfiguration: any): GeoScaleDto {
    const dto: GeoScaleDto = {
      scaleWidth: 82,
      currentScale: activeConfiguration.view.scales.find(
      element => element.zoom === activeConfiguration.view.zoom)
    };
    this._currentScaleDto = dto;
     return dto;
  }
  updateScale(zoom: number, scaleLineWidth: number, scales: GeoScale []): GeoScaleDto {
    const dto: GeoScaleDto = {
      scaleWidth: scaleLineWidth,
      currentScale: scales.find(element => element.zoom === zoom)
    };
    this._currentScaleDto = dto;
    return dto;
  }
}

