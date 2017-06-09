import { Map } from 'openlayers';
import * as ol from 'openlayers';
/* tslint:disable:no-unused-variable */
import {ElementRef} from '@angular/core';
import {activeConfig, falseConfig} from '../../shared/mockMapServiceForSpec';
import { TestBed, async, inject, ComponentFixture } from '@angular/core/testing';
import { MapService } from './map.service';
import { AppModuleForTest } from './../../app.module.spec';
import { MainMapComponent } from '../../components/map/map.component';
describe('Service: Map', () => {
  let map: Map;
  /*const map1: Map;
  const elementRef: ElementRef;*/
  let fixture: ComponentFixture<MainMapComponent>;
  /*const fixture1: ComponentFixture<MainMapComponent>;
  const fixture2: ComponentFixture<MainMapComponent>;
  const fixture3: ComponentFixture<MainMapComponent>;
  const fixture4: ComponentFixture<MainMapComponent>;*/
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModuleForTest]

    });
  });
 /* it('should ...initMap zoom === 6', inject([MapService], (service: MapService) => {
   fixture = TestBed.createComponent(MainMapComponent);
   map = service.initMap(activeConfig, fixture.elementRef);
    expect(map.getView().getZoom()).toBe(6);
  }));
  it('should ...initMap without Layers', inject([MapService], (service: MapService) => {
   fixture = TestBed.createComponent(MainMapComponent);
   map = service.initMap(falseConfig, fixture.elementRef);
    expect(map.getLayers().getLength()).toBe(0);
  }));
  it('should ...setMapZoomByStep zoom === 8', inject([MapService], (service: MapService) => {
   fixture = TestBed.createComponent(MainMapComponent);
   map = service.initMap(activeConfig, fixture.elementRef);
   service.setMapZoomByStep(map, 2 );
    expect(map.getView().getZoom()).toBe(8);
  }));
  it('should ...setMapZoom zoom === 2', inject([MapService], (service: MapService) => {
   fixture = TestBed.createComponent(MainMapComponent);
   map = service.initMap(activeConfig, fixture.elementRef);
   service.setMapZoom(map, 10 );
    expect(map.getView().getZoom()).toBe(10);
  }));

  it('should ...', inject([MapService], (service: MapService) => {
    expect(service).toBeTruthy();
  }));
  it('should ...initLayersGroups', inject([MapService], (service: MapService) => {
   const group: ol.layer.Group[] = service.initLayersGroups(activeConfig);
    expect(group.length).toBe(2);
  }));

  it('Test IGN', inject([MapService], (service: MapService) => {
   fixture = TestBed.createComponent(MainMapComponent);
   map = service.initMap(activeConfig, fixture.elementRef);
   const g: any = map.getLayers().getArray().find(element => (element instanceof ol.layer.Group && element.get('name') === 'base_layers'));
   const IGN: ol.layer.Layer = g.getLayers().getArray().find(element => element.get('name') === 'IGN');
   expect(IGN.getSource() instanceof ol.source.WMTS).toBe(true);
  }));*/
});
