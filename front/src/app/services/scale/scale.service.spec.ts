/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ScaleService } from './scale.service';
import {GeoScaleDto} from '../../../model/map/geoScaleDto';
/* describe('Service: Scale', () => {
  let activeconf: any;
   let dto: GeoScaleDto ;
  beforeEach(() => {
    dto = {
      scaleWidth: 82,
      currentScale: {
          zoom: 2,
          scale: 139770566,
          isUsed: true,
          length: 5000,
          unit: 'km'
        }
    };
    activeconf = {scales: [
        {
          zoom: 0,
          scale: 559082264,
          isUsed: false,
          length: null,
          unit: 'km'
        },
        {
          zoom: 1,
          scale: 279541132,
          isUsed: false,
          length: null,
          unit: 'km'
        },
        {
          zoom: 2,
          scale: 139770566,
          isUsed: true,
          length: 5000,
          unit: 'km'
        }],
      zoom: 2};
    TestBed.configureTestingModule({
      providers: [ScaleService]
    });
  });

  it('should ...initScale', inject([ScaleService], (service: ScaleService) => {
    const localDto = service.initScale(activeconf);
    expect(localDto.scaleWidth).toBe(82);
  }));
  it('should ...updateScale', inject([ScaleService], (service: ScaleService) => {
    const localDto = service.updateScale(1, 30, activeconf.scales);
    expect(localDto.currentScale.zoom).toBe(1);
  }));
  it('should ...get currentScale', inject([ScaleService], (service: ScaleService) => {
    const localDto = service.updateScale(1, 30, activeconf.scales);
    expect(service.currentScaleDto).toBe(localDto);
  }));

});*/
