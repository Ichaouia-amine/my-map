import { Coordinate, Map } from 'openlayers';
// import * as proj4 from 'proj4';
import * as ol from 'openlayers';
import { Injectable, ElementRef } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { LayerOpenlayersService } from "app/services/layer-openlayers/layer-openlayers.service";

export interface ScaleDto {
  scaleWidth: number;
  currentScale: any;
}
@Injectable()
export class MapOpenlayersService {

  private _map: Map;
  public _scaleWidth: number;
  public _currentScale: any;
  private zoomInteraction: ol.interaction.DragBox;
  constructor(private http: Http, private layerService: LayerOpenlayersService) {
    this.zoomInteraction = null;
  }
  public get map(): Map {
    return this._map;
  }
  public get scaleWidth(): number {
    return this._scaleWidth;
  }
  public setMapZoomByStep(map: Map, step: number) {
    map.getView().setZoom(map.getView().getZoom() + step);
  }
  public setMapZoom(map: Map, zoom: number) {
    map.getView().setZoom(zoom);
  }

  public getMapZoom(map: Map) {
    return map.getView().getZoom();
  }
  public getRetation(map: Map) {
    return map.getView().getRotation();
  }
  public setMapZoomByExtent(map: Map, extent: any) {
    return map.getView().fit(extent, map.getSize());
  }

  public transform3857To4326(point)  {
    return ol.proj.transform(point, 'EPSG:3857', 'EPSG:4326');
  }

  public setMapRotation(map: Map, rotation: number) {
    map.getView().setRotation(rotation);
  }

  public initMap(activeConfiguration: any, mapElement: ElementRef): Map {
    const centerJSON = JSON.parse( activeConfiguration.center);
    let center: [number, number] = centerJSON.point;
    if (centerJSON.sourceProjection !==
      centerJSON.distProjection) {
      center = ol.proj
        .transform(centerJSON.point,
        centerJSON.sourceProjection,
        centerJSON.distProjection);
    }
    const mainView = new ol.View({
      projection: activeConfiguration.projection,
      center: center,
      zoom: activeConfiguration.zoom,
      minZoom: activeConfiguration.minZoom,
      maxZoom: activeConfiguration.maxZoom
    });
    const map = new ol.Map({
      target: null,
      view: mainView,
      layers: this.initLayersGroups(activeConfiguration),
      controls: [new ol.control.ScaleLine({ className: 'scale-line', target: document.getElementById('scale-line') })]
    }
    );
    const el: any = mapElement.nativeElement.firstElementChild;
    map.setTarget(el);
    map.updateSize();
    return map;
  }
  /**
   * @initLayersGroups: to load all layerGroups and layers from the active configuration
   */

  private initLayersGroups(configuration: any): ol.layer.Group[] {
    const layerGroups: ol.layer.Group[] = [];
    const layerGroupsConfig: any[] = configuration.servicegroups;
      layerGroupsConfig.forEach(layerGroup => {
        const layers: any[] = layerGroup.mapservices;
        const group: ol.layer.Group = this.layerService.createGroup(layerGroup.name);
        const collection: ol.Collection<any> = new ol.Collection();
        layers.forEach(l => {
          const layer = JSON.parse(l.config);
          const oLayer: any = this.layerService.createLayer(layer, null, layer.name, null);
          if (layer.style !== undefined) {
            const style = this.layerService.createStyle(layer.style);
            oLayer.setStyle(style);
          }
          if (typeof oLayer !== 'undefined') {
            oLayer.setVisible(layer.visible);
            if (typeof layer.zIndex !== 'undefined') {
              oLayer.setZIndex(layer.zIndex);
            }
            collection.insertAt(collection.getLength() - 1, oLayer);
          }

        });
        group.setLayers(collection);
        layerGroups.push(group);
      });
    return layerGroups;
  }
  createLayer(layer) {
    return this.layerService.createLayer(layer, null, layer.name, null);
  }
  setWMSLayersSource(layer: ol.layer.Layer, LAYERS: string) {
    const source = layer.getSource();
    if (source instanceof ol.source.ImageWMS) {
      (<ol.source.ImageWMS>source).updateParams({ LAYERS: LAYERS });
    }
    if (source instanceof ol.source.TileWMS) {
      (<ol.source.TileWMS>source).updateParams({ LAYERS: LAYERS });
    }
  }
  getLayersGroup(map: Map, layerGroupName: string) {
    return this.layerService.getGroup(map.getLayers(), layerGroupName);
  }
  clearLayerGroupe(map: Map, layerGroupName: string) {
    const group: ol.layer.Group = this.layerService.getGroup(map.getLayers(), layerGroupName);
    group.setLayers(new ol.Collection<ol.layer.Layer>());
  }
  public getLayerFromMapByGroup(map: Map, layerGroupName: string, layerName: string): any {
    return this.layerService.getLayerFromGroup(map.getLayers(), layerGroupName, layerName);
  }
  removeLayerFromGroup(map: Map, layerGroupName: string, layerName: string) {
    const group: ol.layer.Group = this.getLayersGroup(map, layerGroupName);
    const col: ol.Collection<any> = new ol.Collection();
    let index = 0;
    group.getLayers().getArray().forEach(lay => {
      if (lay.get('name') !== layerName) {
        col.insertAt(index, lay);
        index++;
      }
    });
    group.setLayers(col);
  }
  /*
    public getBaseLayers(map: Map): any {
      return this.layerService.getLayerGroup(map.getLayers(), 'base_layers');
    }
  */

  public clearLayer(layer: any) {
    this.layerService.clearLayer(layer);
  }

  public setVisibilityLayer(layer: any, visibility: boolean) {
    this.layerService.setVisibility(layer, visibility);
  }



  insertLayersInGroup(map: Map, groupName: string, layer: ol.layer.Layer) {
    const group: ol.layer.Group = this.getLayersGroup(map, groupName);
    group.getLayers().insertAt(group.getLayers().getArray().length, layer);
  }
  public getGeolocalisationFeature(geolocation: ol.Geolocation) {

  }
  public createFeature(data: any, projection: string): ol.Feature {
    return this.layerService.createFeature(data, projection);
  }
  public setGeometyForFeature(feature: ol.Feature, data: any) {
    return feature.setGeometry(this.createGeometry(data, data.projection));
  }
  addFeaturesToLayer(layer: any, features: ol.Feature[]) {
    layer.getSource().addFeatures(features);
  }
  createGeometry(data: any, viewProjection: any): ol.geom.Geometry {
    return this.layerService.createGeometry(data, viewProjection);
  }
  setMapCenter(map: Map, coordinate: Coordinate) {
    map.getView().setCenter(coordinate);
  }
  isContainCordinate(map: Map, coordinate: Coordinate) {
    return ol.extent.containsCoordinate(map.getView().calculateExtent(map.getSize()), coordinate);
  }
   isContainXY(extent: ol.Extent, x: number, y: number) {
    return ol.extent.containsXY(extent, x, y);
  }
  getMapLineScaleControl(map: Map): ol.control.ScaleLine {
    return <ol.control.ScaleLine>map.getControls().getArray().find(element => element instanceof ol.control.ScaleLine);
  }
  getMapResolution(map: Map): number {
    return map.getView().getResolution();
  }
  getResolutionForScale(map: Map, scale: any) {
    const dpi = 25.4 / 0.28;
    const units = map.getView().getProjection().getUnits();
    const mpu = ol.proj.METERS_PER_UNIT[units];
    const inchesPerMeter = 39.37;
    return parseFloat(scale) / (mpu * inchesPerMeter * dpi);
  }
  getScaleForResolution(map: Map, resolution: any) {
    const dpi = 25.4 / 0.28;
    const units = map.getView().getProjection().getUnits();
    const mpu = ol.proj.METERS_PER_UNIT[units];
    const inchesPerMeter = 39.37;
    return (mpu * inchesPerMeter * dpi) * parseFloat(resolution);
  }
  setLayerOpacity(layer: ol.layer.Layer, opacity: number) {
    layer.setOpacity(opacity);
  }

  activeZoomInteraction(map: Map, zoomIn: boolean, maxZoom: number, minZoom: number) {
    this.zoomInteraction.on('boxend', function (evt) {
      const geom = evt.target.getGeometry();
      const layer: ol.layer.Layer = this.getLayerFromMapByGroup(map, 'interaction_layers', 'zoom');
      const feat: ol.Feature = this.layerService.createFeatureByGeometry(geom);

      this.addFeaturesToLayer(layer, [feat]);
      const zoomExtent = this.layerService.getLayerVectorSourcesExtent(layer);
      if (zoomIn) {
        map.getView().fit(zoomExtent, map.getSize());
        if (map.getView().getZoom() > maxZoom) {
          map.getView().setZoom(maxZoom);
        }
      } else {
        const currentZoom = map.getView().getZoom();
        map.getView().fit(zoomExtent, map.getSize());
        map.getView().setZoom(currentZoom - 1);
        if (map.getView().getZoom() < minZoom) {
          map.getView().setZoom(minZoom);
        }
      }
      // this.addFeaturesToLayer(layer, []);
      this.clearLayer(layer);
    }, this);
  }
  removeZoomInteraction(map: Map) {
    if (this.zoomInteraction !== null) {
      map.removeInteraction(this.zoomInteraction);
      this.zoomInteraction = null;
    }
  }
  doZoomInteraction(map: Map, maxZoom: number, minZoom: number, activeInteraction: boolean, zoomIn: boolean) {
    this.removeZoomInteraction(map);
    if (activeInteraction) {
      this.zoomInteraction = new ol.interaction.DragBox({
        condition: ol.events.condition.noModifierKeys,
      });
      this.activeZoomInteraction(map, zoomIn, maxZoom, minZoom);
      map.addInteraction(this.zoomInteraction);
    }
  }
  getMapCenter(map: Map) {
    return map.getView().getCenter();
  }
}
