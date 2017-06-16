/* tslint:disable:no-unused-variable */
import * as ol from 'openlayers';
import { TestBed, async, inject } from '@angular/core/testing';
import { LayerOpenlayersService } from './layer-openlayers.service';

describe('Service: Layer', () => {
  let dataFeature: any;
  let dataStyle: any;
  let dataSource: any;
  let dataLayerForTypeTest: any;
  let dataLayer: any;
  beforeEach(() => {
    dataLayerForTypeTest = {
      source: { type: 'ImageWMS' }
    };
    dataLayer = {
      name: 'OSM',
      title: 'Open Street Map',
      default: false,
      active: true,
      type: 'Tile',
      visible: true,
      source: {
        type: 'OSM'
      }
    };
    dataSource = {
      type: 'TileWMS',
      tileGrid: {
        origin: [
          -3.55975E7,
          4.89531E7
        ],
        tileSize: [
          512,
          512
        ],
        resolutions: [
          2000.0000000000002,
          1000.0000000000001,
          500.00000000000006,
          250.00000000000003,
          100.0,
          50.0,
          25.0,
          9.9999470832275,
          5.000105833545001,
          2.5000529167725003,
          1.0001270002540006,
          0.5000635001270003,
          0.26458386250105836
        ],
        extent: [
          99226.000000,
          6049647.000000,
          1242375.000000,
          7110524.000000
        ]
      },
      url: 'http://dvsgowsc02.rouen.francetelecom.fr:8080/geowebcache/service/wms?',
      params: {
        LAYERS: 'francerasterv4',
        VERSION: '1.1.1',
        FORMAT: 'image/png',
        SRS: 'EPSG:2154'
      }
    };
    dataFeature = {
      coordinates: [0, 0]
      , type: 'Point'
      , projection: 'EPSG:3857'
    };
    dataStyle = {
      type: 'circle',
      fillColor: '#2980B9',
      strokeColor: 'rgba(255, 255, 255, 0.5)',
      strokewidth: 5,
      radius: 7,
      src: '',
      anchor: [],
      anchorXUnits: '',
      anchorYUnits: '',
      opacity: 1
    };
    TestBed.configureTestingModule({
      providers: [LayerOpenlayersService]
    });
  });
  it('createLayer', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const layer: ol.layer.Layer = service.createLayer(dataLayer, 'EPSG:3857', 'test', null);
    expect(layer).toBeDefined();
  }));
  it('isDefined', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const isDefined: boolean = service.isDefined(service);
    expect(isDefined).toBe(true);
  }));
  it('isDefinedAndNotNull', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const isdefOrNotNull: boolean = service.isDefinedAndNotNull(service);
    expect(isdefOrNotNull).toBe(true);
  }));
  it('detectLayerType', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const type: string = service.detectLayerType(dataLayerForTypeTest);
    expect(type).toBe('Image');
  }));
  it('createSource', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const source: ol.source.Source = service.createSource(dataSource, 'EPSG:2154');
    expect(source instanceof ol.source.Source).toBe(true);
  }));
  it('createFeature', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const feature: ol.Feature = service.createFeature(dataFeature, 'EPSG:3857');
    expect(feature.getGeometry() instanceof ol.geom.Point).toBe(true);
  }));
  it('createGeometry', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const point: ol.geom.Geometry = service.createGeometry(dataFeature, 'EPSG:3857');
    expect(point instanceof ol.geom.Point).toBe(true);
  }));
  it('createStyle', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const style: ol.style.Style = service.createStyle(dataStyle);
    expect(style instanceof ol.style.Style).toBe(true);
  }));
  it('isArray', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const val: boolean = service.isArray('string');
    expect(val).toBe(false);
  }));
  it('createGroup', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const groupe: ol.layer.Group = service.createGroup('nameG');
    expect(groupe.get('name')).toBe('nameG');
  }));
  it('isValidStamenLayer', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const val: boolean = service.isValidStamenLayer('terrain');
    expect(val).toBe(true);
  }));
  it('getGroup', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    const layers: ol.Collection<any> = new ol.Collection<any>();
    layers.insertAt(0, service.createGroup('nameG'));
    layers.insertAt(1, service.createGroup('nameG1'));
    const groupe: ol.layer.Group = service.getGroup(layers, 'nameG1');
    expect(groupe.get('name')).toBe('nameG1');
  }));
  it('should ...', inject([LayerOpenlayersService], (service: LayerOpenlayersService) => {
    expect(service).toBeTruthy();
  }));
});
