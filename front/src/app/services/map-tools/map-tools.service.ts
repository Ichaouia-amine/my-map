import { Injectable, ElementRef } from '@angular/core';
import { HttpService } from 'app/services/httpService/http.service';
import { MAP_CONFIG_URL, APP_CONFIG_URL } from '../../shared/app.constants';
import { SettingsService } from 'app/services/settings/settings.service';
import { MapOpenlayersService } from 'app/services/map-openlayers/map-openlayers.service';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Headers, RequestOptions, Http, Response } from '@angular/http';
import { TableOfContent } from 'app/model/TableOfContent/TableOfContent';
import { UtilsService } from 'app/services/utils/utils.service';
import { TableOfContentService } from 'app/services/table-of-content/table-of-content.service';
import * as ol from 'openlayers';
import { GeoScaleDto } from 'app/model/map/geoScaleDto';
import { TableOfContentServiceObject } from 'app/model/TableOfContent/TableOfContentService';
import { ScaleService } from 'app/services/scale/scale.service';
import { LocationService } from 'app/services/map-location/location.service';
import { TableOfContentDomain } from 'app/model/TableOfContent/TableOfContentDomain';
import { TableOfContentNode } from 'app/model/TableOfContent/TableOfContentNode';
import { GeoSource } from 'app/model/map/geoSource';
import { Point } from 'geojson';
import { TableOfContentSourceParams } from 'app/model/TableOfContent/TableOfContentSourceParams';
import { GeoLayer } from 'app/model/map/geoLayer';
@Injectable()
export class MapToolsService {
  public _mainMap: ol.Map = null;
  public _currentMapSettings: any = null;
  public currentMapSettingsListener: Subject<any> = new Subject<any>();
  private location: ol.Geolocation;
  public currentDomainCode: string;
  public mainMapListener: Subject<any> = new Subject<any>();
  public _currentTableOfContent: TableOfContent;
  public currentTableOfContentListener: Subject<TableOfContent> = new Subject<TableOfContent>();
  public _allTablesOfContent: TableOfContent[];
  public allTablesOfContentListener: Subject<TableOfContent[]> = new Subject<TableOfContent[]>();
  public currentScaleDtoSubject: Subject<any> = new Subject<any>();
  public oldtableOfContent: TableOfContent;
  public baseLayer_ex: any[];
  public baseLayer_in: any[];
  private baseLayerDtoSubject_ex: Subject<any> = new Subject<any>();
  private baseLayerDtoSubject_in: Subject<any> = new Subject<any>();
  public currentScaleDto: GeoScaleDto;
  private _isActiveLocation: Subject<boolean> = new Subject<boolean>();
  private currentRotationSubject: Subject<any> = new Subject<any>();
  private _currentRotation: any;
  private backgroundLayers: Array<ol.layer.Layer>;
  public _endLoading = false;
  public endLoadingSubject: Subject<any> = new Subject<any>();
  public endLoadingShowSubject: Subject<any> = new Subject<any>();
  private _listMapConfigs: any[];
  public defaultTerritory: any;
  public _copyGo: boolean;
  public copyGoSubject: Subject<any> = new Subject<any>();
  public isChangedTocSubject: Subject<any> = new Subject<any>();
  public _isChangedToc: boolean;
  public _selectedTerritory: any;
  public selectedTerritorySubject: Subject<any> = new Subject<any>();
  public historytableSubject: Subject<any> = new Subject<any>();
  public currentdomainCode: string;
  private timeoutToc: number;
  public historys: any[];
  public _currentIndexForHistory: number;
  public currentIndexForHistorySubject: Subject<any> = new Subject<any>();
  private historyAction: boolean;
  constructor(private httpService: HttpService, private settingsService: SettingsService,
    private mapOpenlayersService: MapOpenlayersService,
    private locationService: LocationService,
    private scaleService: ScaleService,
    private http: Http, private utilsService: UtilsService, private tableOfContentService: TableOfContentService) {
    this.currentdomainCode = '';
    this.currentScale().subscribe((e: any) => {
      this.currentScaleDto = e;
      if (typeof this._currentTableOfContent !== 'undefined') {
        this.refrechVisibilityByResolution(this._currentTableOfContent, e.currentScale.scale);
      }
    });
    this.settingsService.appSettings().subscribe(settings => {
      let url: string = MAP_CONFIG_URL;
      if (settings.map_config_url !== null) {
        url = settings.map_config_url;
      }
      this.httpService.getJson(url).subscribe(mapConfigs => {
        this._currentMapSettings = (<any[]>mapConfigs).find(e => e.active);
        this.currentMapSettingsListener.next(this._currentMapSettings);
        this._mainMap = this.mapOpenlayersService.innitMap(this._currentMapSettings);
        this.initScale();
        this.mainMapListener.next(this._mainMap);
        this.loadAllTableOfContents(settings.layers_config_url);
      });
      this.allTablesOfContent().subscribe(e => {
        this._allTablesOfContent.forEach(tableOfContent => {
          tableOfContent = this.loadServicesDependencies(tableOfContent);
        });
        this._currentTableOfContent = this._allTablesOfContent.find(tab => tab.active);
      })
    });
  }
  public currentTableOfContent(): Observable<TableOfContent> {
    return this.currentTableOfContentListener.asObservable();
  }
  public loadServicesDependencies(tableOfContent: TableOfContent): TableOfContent {
    tableOfContent.domains.forEach(domain => {
      domain.services.forEach(service => {
        if (this.utilsService.isDefined(service.useCapabilitiesLikeSource) && service.useCapabilitiesLikeSource) {
          this.tableOfContentService.getGETCapabilitiesByMapService(service.urlGetCapabilities).subscribe(cap => {
            service.Layer = this.mapOpenlayersService.readGetCapabilities(cap);
            if (this.utilsService.isDefined(service.layersConfig)) {
              service.layersConfig.forEach(layerConfig => {
                service.Layer.forEach(capLayer => {
                  this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer,
                    layerConfig, service.name, service.name);
                });
              })
            } else {
              service.Layer.forEach(capLayer => {
                this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer,
                  null, service.name, service.name);
              });
            }
          })
        }
      });
    });
    return tableOfContent;
  }
  public currentMapSettings(): Observable<any> {
    return this.currentMapSettingsListener.asObservable();
  }
  public allTablesOfContent(): Observable<any> {
    return this.allTablesOfContentListener.asObservable();
  }
  public mainMap(): Observable<any> {
    return this.mainMapListener.asObservable();
  }
  loadAllTableOfContents(url: string) {
    this.httpService.getJson(url).subscribe(tabs => {
      this._allTablesOfContent = tabs;
      this.allTablesOfContentListener.next(this._allTablesOfContent);
    });
  }
  isContainXY(extent: ol.Extent, x: number, y: number) {
    return this.mapOpenlayersService.isContainXY(extent, x, y);
  }

  public currentRotation(): Observable<any> {
    return this.currentRotationSubject.asObservable();
  }
  public selectedTerritory(): Observable<any> {
    return this.selectedTerritorySubject.asObservable();
  }
  public currentIndexForHistory(): Observable<any> {
    return this.currentIndexForHistorySubject.asObservable();
  }
  public historytable(): Observable<any> {
    return this.historytableSubject.asObservable();
  }
  public isActiveLocation(): Observable<boolean> {
    return this._isActiveLocation.asObservable();
  }
  public endLoading(): Observable<boolean> {
    return this.endLoadingSubject.asObservable();
  }
  public endLoadingShow(): Observable<boolean> {
    return this.endLoadingShowSubject.asObservable();
  }
  public isChangedToc(): Observable<boolean> {
    return this.isChangedTocSubject.asObservable();
  }
  public CopyGo(): Observable<boolean> {
    return this.copyGoSubject.asObservable();
  }
  public getLocation(): ol.Geolocation {
    return this.location;
  }
  public setScaleTarget(scaleElement: ElementRef) {
    const el: any = scaleElement.nativeElement.firstElementChild;
    this.mapOpenlayersService.getMapLineScaleControl(this._mainMap).setTarget(el);
  }

  public resetRotation() {
    this.mapOpenlayersService.setMapRotation(this._mainMap, 0);
    this.currentRotationSubject.next(0);
  }

  public getListMapConfigs(): any[] {
    return this._listMapConfigs;
  }
  public setSelectedTerritory(selectedTerritory: any) {
    this._selectedTerritory = selectedTerritory;
    this.selectedTerritorySubject.next(selectedTerritory);
  }
  refreshToc(allOldTableOfContent: any) {
    if (this._currentTableOfContent.type === 'session') {
      this._allTablesOfContent.forEach(context => {
        if (context.type === 'standard') {
          this._currentTableOfContent = context;
          this.initContext();
          const tableString: string = JSON.stringify(this._currentTableOfContent);
          this.oldtableOfContent = JSON.parse(tableString);
        }
      });
    } else {
      this.oldtableOfContent = allOldTableOfContent.find(element => element.id === Number.parseInt(this._currentTableOfContent.id));
      const tableString: string = JSON.stringify(this.oldtableOfContent);
      this._currentTableOfContent = JSON.parse(tableString);
    }
    this.currentTableOfContentListener.next(this._currentTableOfContent);
    this.isChangedTocSubject.next(false);
    this._isChangedToc = false;
  }
  /** changement du centre avec application de projection */
  public setMapCenter(center: any) {
    let centerPoint: [number, number];
    centerPoint = center.point;
    if (center.sourceProjection !==
      center.distProjection) {
      centerPoint = ol.proj
        .transform(center.point,
        center.sourceProjection,
        center.distProjection);
    }
    this.mapOpenlayersService.setMapCenter(this._mainMap, centerPoint);
  }

  public setMapCenterByXY(x: number, y: number) {
    const point: [number, number] = [x, y];
    this.mapOpenlayersService.setMapCenter(this._mainMap, point);
  }

  /*public createMap(mapElement: ElementRef) {
    this.configurationService.loadConfigurations()
      .subscribe(jsonObject => {
        this._listMapConfigs = jsonObject;
        this.configurationService.loadDefaultConfiguration(jsonObject);
        this._mainMap = this.mapOpenlayersService.initMap(this.configurationService.activeConfiguration, mapElement);
        this.initScale();
        const layerGroupes_ex: any[] = this.configurationService.activeConfiguration.servicegroups;
        const layerGroupsObject_ex = layerGroupes_ex.find(element => element.name === 'base_layers_ex');
        this.baseLayer_ex = layerGroupsObject_ex.mapservices.map(l => {
          return JSON.parse(l.config);
        });
        const layerGroupes_in: any[] = this.configurationService.activeConfiguration.servicegroups;
        const layerGroupsObject_in = layerGroupes_in.find(element => element.name === 'base_layers_in');
        this.baseLayer_in = layerGroupsObject_in.mapservices.map(l => {
          return JSON.parse(l.config);
        });
        this.initBaseLayersVisivility();
        this.currentScale().subscribe((e: any) => {
          this.initBaseLayersVisivility();
        });
        this.baseLayerDtoSubject_ex.next(this.baseLayer_ex);
        this.baseLayerDtoSubject_in.next(this.baseLayer_in);
        this.activateMapChangeEvents();
        this.initTableOfContent('', '');
      });
  }*/
  initBaseLayersVisivility() {
    const scale = this.getScale();
    this.baseLayer_ex.forEach(layer => {

      // detection de la visibilite
      if (typeof (scale) !== 'undefined') {
        if (scale > layer.minScale && scale < layer.maxScale) {
          layer.disabled = false;
        } else {
          layer.disabled = true;
        }
      }

      // activation des FDP exclusifs
      if (layer.name !== 'none' && layer.visible) {
        if (layer.disabled) {
          this.setVisibility(layer.name, false, 'base_layers_ex');
        } else {
          this.setVisibility(layer.name, true, 'base_layers_ex');
        }
      }
    });
    this.baseLayer_in.forEach(layer => {
      if (scale > layer.minScale && scale < layer.maxScale) {
        layer.disabled = false;
      } else {
        layer.disabled = true;
      }

      if ((layer.disabled && layer.name && layer.visible)) {
        this.setVisibility(layer.name, false, 'base_layers_in');
      } else if ((!layer.disabled && layer.visible)) {
        this.setVisibility(layer.name, true, 'base_layers_in');
      } else {
        this.setVisibility(layer.name, false, 'base_layers_in');
      }




    });
  }
  getScale(): any {
    return this.mapOpenlayersService.getScaleForResolution(this._mainMap, this.mapOpenlayersService.getMapResolution(this._mainMap));
  }
  clearLayerGroupe(layerGroup: string) {
    this.mapOpenlayersService.clearLayerGroupe(this._mainMap, layerGroup);
  }
  /*
  buildTocForUsers(newAuthority: string, lastAuthority: string) {
    const observableBatch: any = [];

    this.tableOfContentService.getUserContextsByProfil(newAuthority).subscribe(c => {
      this._alltableOfContent = c;
      this._alltableOfContent.forEach(context => {
        observableBatch.push(this.buildContext(context));
      });
    });


    Observable.forkJoin(observableBatch
    ).subscribe(
      data => {
        let index = 0;
        this._alltableOfContent.forEach(context => {
          context.domains = data[index];
          index++;
        });

        this._endLoading = true;
        this.endLoadingSubject.next(true);
      }
      );

  }
  buildContext(context: any) {
    let domains: any[];
    this.tableOfContentService.getDomainsByContextId(context.id).subscribe(d => {
      domains = d;
      domains.forEach(domainItem => {
        this.tableOfContentService.getServicesByDomainIdAndContextId(domainItem.id, context.id).subscribe(s => {
          const services: any[] = s;
          const indexservices = services.length;
          services.forEach(service => {
            if (service.config === null) {
              this.tableOfContentService.getGETCapabilitiesByMapService(service.code).subscribe(cap => {
                service.Layer = this.tableOfContentService.readGetCapabilities(cap);
                this.tableOfContentService.getLayersGroupBycontextIdANDMapserviceCode(context.id, service.code).subscribe(lg => {
                  const layersGroup: any[] = lg;
                  const indexlayers = layersGroup.length;
                  layersGroup.forEach(layerGroup => {
                    const indexLlayer = service.Layer.length;
                    (<any[]>service.Layer).forEach(capLayer => {
                      this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer,
                        layerGroup, service.code, service.code);
                    });

                  });
                });
                this.tableOfContentService.getLayersBycontextIdANDMapserviceCode(context.id, service.code).subscribe(l => {
                  const layers: any[] = l;
                  const indexlayers = layers.length;
                  layers.forEach(layer => {
                    const indexLlayer = service.Layer.length;
                    (<any[]>service.Layer).forEach(capLayer => {
                      this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer, layer,
                        service.code, service.code);
                    });

                  });
                });
              });
            }
          });
          domainItem.services = services.filter(element => element.config === null);
        });
      });
    });
    return domains;
  }
  saveToc(tableOfContent: any, contextType: string) {
    return this.tableOfContentService.saveToc(tableOfContent, this.profilService.currentProfileCode, contextType);
  }
  buildTocForUser(newAuthority: string, lastAuthority: string) {
    this.endLoadingShowSubject.next(false);
    if (newAuthority !== '') {
      this.tableOfContentService.saveSessionToc(this.tableOfContent, lastAuthority);
    }
    this.tableOfContentService.getUserContextsByProfil(newAuthority).subscribe(c => {
      this._alltableOfContent = c;
      const indexContext = this._alltableOfContent.length;
      let indexComptContext = 0;
      this._alltableOfContent.forEach(context => {
        this.tableOfContentService.getDomainsByContextId(context.id).subscribe(d => {
          indexComptContext++;
          const domains: any[] = d;
          const indexdomains = domains.length;
          let indexComptdomains = 0;
          domains.forEach(domainItem => {
            this.tableOfContentService.getServicesByDomainIdAndContextId(domainItem.id, context.id).subscribe(s => {
              indexComptdomains++;
              const services: any[] = s;
              const indexservices = services.length;
              let indexComptservicesL = 0;
              let indexComptservicesG = 0;
              services.forEach(service => {
                if (service.config === null) {
                  this.tableOfContentService.getGETCapabilitiesByMapService(service.code).subscribe(cap => {
                    service.Layer = this.tableOfContentService.readGetCapabilities(cap);
                    this.tableOfContentService.getLayersGroupBycontextIdANDMapserviceCode(context.id, service.code).subscribe(lg => {
                      indexComptservicesG++;
                      const layersGroup: any[] = lg;
                      const indexlayers = layersGroup.length;
                      let indexComptlayers = 0;
                      layersGroup.forEach(layerGroup => {
                        indexComptlayers++;
                        let indexComptlayer = 0;
                        const indexLlayer = service.Layer.length;
                        (<any[]>service.Layer).forEach(capLayer => {
                          this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer,
                            layerGroup, service.code, service.code);
                          indexComptlayer++;
                          if (indexContext === indexComptContext && indexComptdomains === indexdomains
                            && indexservices === indexComptservicesG && indexlayers === indexComptlayers
                            && indexLlayer === indexComptlayer) {
                            this._endLoading = true;
                            this.endLoadingSubject.next(true);
                          }
                        });

                      });
                    });
                    this.tableOfContentService.getLayersBycontextIdANDMapserviceCode(context.id, service.code).subscribe(l => {
                      indexComptservicesL++;
                      const layers: any[] = l;
                      const indexlayers = layers.length;
                      let indexComptlayers = 0;
                      layers.forEach(layer => {
                        indexComptlayers++;
                        let indexComptlayer = 0;
                        const indexLlayer = service.Layer.length;
                        (<any[]>service.Layer).forEach(capLayer => {
                          this.tableOfContentService.addFunctionelAttributesForGetCapabilitiesLayer(capLayer, layer,
                            service.code, service.code);
                          indexComptlayer++;
                          if (indexContext === indexComptContext && indexComptdomains === indexdomains
                            && indexservices === indexComptservicesL && indexlayers === indexComptlayers
                            && indexLlayer === indexComptlayer) {
                            this._endLoading = true;
                            this.endLoadingSubject.next(true);
                          }
                        });

                      });
                    });
                  });
                }
              });
              domainItem.services = services.filter(element => element.config === null);
            });
          });

          context.domains = domains;

        });

      });
    });
    this.allTableOfContentDtoSubject.next(this._alltableOfContent);
  }*/
  public initContext() {
    if (this._mainMap !== undefined && this._mainMap !== null )  {
      this.clearLayerGroupe('tableOfContent_layers');
    }
    let index = 0;
    if (typeof this._currentTableOfContent.domains !== 'undefined') {
      this._currentTableOfContent.domains.forEach(domain => {
        if (typeof domain !== 'undefined' && typeof domain.services !== 'undefined') {
          domain.services.sort(function (a, b) {
            if (a.zIndex > b.zIndex) { return -1; }
            if (a.zIndex < b.zIndex) { return 1; }
            return 0;
          });
          domain.services
            .forEach(service => {
              if (typeof service.Layer !== 'undefined') {
                service.Layer.forEach(element => {
                  this.refrechSubNodeCheck(element);
                  this.initLegendCollapse(element);

                });
                this.refrechService(service);
              }
            });
          this.refrechDomainCheck(domain);
          domain.active = false;
          if (index === 0 && this.currentdomainCode === '') {
            console.log(index);
            domain.active = true;
          }
          if (this.currentdomainCode === domain.name) {
            domain.active = true;
          }
          index++;
        }
      });
    }
    this.refrechVisibilityByResolution(this._currentTableOfContent, this.currentScaleDto.currentScale.scale);
  }
  public refrechTableOfContent(currentdomainCode: string) {
    let index = 0;
    if (typeof this._currentTableOfContent.domains !== 'undefined') {
      this._currentTableOfContent.domains.forEach(domain => {
        if (typeof domain !== 'undefined') {
          if (currentdomainCode !== '') {
            if (domain.name === currentdomainCode) {
              domain.active = true;
            } else {
              domain.active = false;
            }
          } else {
            if (index === 0) {
              domain.active = true;
            }
          }
        }
        const services: TableOfContentServiceObject[] = domain.services;
        if (services !== undefined) {
          services.forEach(service => {
            this.refrechService(service);
          });
        }
        index++;
      });
    }
    this.refrechVisibilityByResolution(this._currentTableOfContent, this.currentScaleDto.currentScale.scale);
  }
  /*public initTableOfContent(newAuthority: string, lastAuthority: string) {
    this.buildTocForUser(newAuthority, newAuthority);
  }*/
  addHistory() {

    if (!this.historyAction) {
      if (this._currentIndexForHistory === this.historys.length - 1) {
        this.historys.push({
          center: this.mapOpenlayersService.getMapCenter(this._mainMap),
          zoom: this.mapOpenlayersService.getMapZoom(this._mainMap),
          retation: this.mapOpenlayersService.getRetation(this._mainMap)
        });
        this._currentIndexForHistory = this.historys.length - 1;
        this.currentIndexForHistorySubject.next(this._currentIndexForHistory);
      } else {
        this.historys.splice(this._currentIndexForHistory + 1, (this.historys.length - this._currentIndexForHistory), {
          center: this.mapOpenlayersService.getMapCenter(this._mainMap),
          zoom: this.mapOpenlayersService.getMapZoom(this._mainMap),
          retation: this.mapOpenlayersService.getRetation(this._mainMap)
        });
        this._currentIndexForHistory++;
        this.currentIndexForHistorySubject.next(this._currentIndexForHistory);
      }
    }
    this.historytableSubject.next(this.historys);
    this.historyAction = false;
    console.log(this.historys);
    console.log(this._currentIndexForHistory);
  }
  setMapHistory(step: number) {
    this.historyAction = true;
    if (step === -1) {
      if (this._currentIndexForHistory > 0) {
        this._currentIndexForHistory--;
        this.currentIndexForHistorySubject.next(this._currentIndexForHistory);
      }

    } else {
      if (this._currentIndexForHistory !== this.historys.length - 1) {
        this._currentIndexForHistory++;
        this.currentIndexForHistorySubject.next(this._currentIndexForHistory);
      }
    }
    this.mapOpenlayersService.setMapZoom(this._mainMap, this.historys[this._currentIndexForHistory].zoom);
    this.mapOpenlayersService.setMapCenter(this._mainMap, this.historys[this._currentIndexForHistory].center);
    this.mapOpenlayersService.setMapRotation(this._mainMap, this.historys[this._currentIndexForHistory].retation);
  }
  activateMapChangeEvents() {

    /* this.map.on('postrender', function(event){
 });*/
    // this.mapOpenlayersService.getMapLineScaleControl(this._mainMap).getKeys();
    this._mainMap.getView().on('change:resolution', function () {
      // this.addHistory();
      if (this.map.getView().getZoom() % 1 === 0) {
        this.updateScale(Math.round(this.map.getView().getZoom()), 0);
        // this.mapOpenlayersService.getMapLineScaleControl(this._mainMap)['B']);
      } else {
        this.updateScaleByResolution();
      }
      this.refrechVisibilityByResolution();

    }, this);

    this._mainMap.getView().on('change:rotation', function () {
      // this.addHistory();
      this.currentRotationSubject.next(this.map.getView().getRotation());
    }, this);
    this._mainMap.on('moveend', function () {
      this.addHistory();
      if (this.location !== null) {
        const coordinates: ol.Coordinate = this.location.getPosition();
        if (!this.mapOpenlayersService.isContainCordinate(this.map, coordinates)) {
          this.resetLocation();
          this._isActiveLocation.next(false);
        }
      }
    }, this); /*
    this.historys.push({
      center: this.mapOpenlayersService.getMapCenter(this._mainMap),
      zoom: this.mapOpenlayersService.getMapZoom(this._mainMap),
      retation: this.mapOpenlayersService.getRetation(this._mainMap)
    });
    this._currentIndexForHistory = 0;
    this.currentIndexForHistorySubject.next(this._currentIndexForHistory);
    this.historytableSubject.next(this.historys);*/
  }
  // -- END Map -- //
  // -- Start Scale -- //
  /**
   * @updateScale() used when map resolution change and emit this change
   * to the scaleComponent
   */
  updateScaleByResolution() {
    // const widthBar: number = this.mapOpenlayersService.getMapLineScaleControl(this._mainMap)['C'];
    // const legthpx: string = this.mapOpenlayersService.getMapLineScaleControl(this._mainMap)['A'];

    const scale = this.mapOpenlayersService.getScaleForResolution(this._mainMap, this.mapOpenlayersService.getMapResolution(this._mainMap));
    const dto: GeoScaleDto = {
      scaleWidth: 0,
      currentScale: {
        zoom: this.mapOpenlayersService.getMapZoom(this._mainMap),
        scale: Math.round(scale),
        isUsed: true,
        length: 0, // Number.parseInt(legthpx.split(' ')[0]),
        unit: ''
      }
    };
    this.currentScaleDtoSubject.next(dto);
  }
  updateScale(zoom: number, scaleLineWidth: number) {
    this.currentScaleDtoSubject.next(
      this.scaleService.updateScale(
        zoom,
        scaleLineWidth,
        JSON.parse(this._currentMapSettings.scaleConfig).scales)
    );
  }
  /**
   * @initScale() get the scale of the map using the configuration zoom
   */
  initScale() {
    this.currentScaleDto = this.scaleService.initScale(this._currentMapSettings);
    this.currentScaleDtoSubject.next(
      this.currentScaleDto);
  }
  public currentScale(): Observable<GeoScaleDto> {
    return this.currentScaleDtoSubject.asObservable();

  }


  public baseLayers_ex(): Observable<any> {
    return this.baseLayerDtoSubject_ex.asObservable();
  }

  public baseLayers_in(): Observable<any> {
    return this.baseLayerDtoSubject_in.asObservable();
  }

  // -- END Scale -- //
  // -- start Zoom -- //
  public setMapZoomByExtent(extent: any) {
    this.mapOpenlayersService.setMapZoomByExtent(this._mainMap, extent);
  }
  public setMapZoomByStep(step: number) {
    this.mapOpenlayersService.setMapZoomByStep(this._mainMap, step);
  }
  zoomInteraction(activateInteraction: boolean, zoomIn: boolean) {
    this.mapOpenlayersService.doZoomInteraction(this._mainMap,
      this._currentMapSettings.view.maxZoom,
      this._currentMapSettings.view.minZoom,
      activateInteraction, zoomIn);
  }

  public getMapZoom() {
    return this.mapOpenlayersService.getMapZoom(this._mainMap);
  }

  public setMapZoom(zoom: number) {
    this.mapOpenlayersService.setMapZoom(this._mainMap, zoom);
  }

  public getMapResolution() {
    return this.mapOpenlayersService.getMapResolution(this._mainMap);
  }

  // -- END Zoom -- //
  public getLayerFromMapByGroup(map: ol.Map, layerGroupName: string, layerName: string): any {
    return this.mapOpenlayersService.getLayerFromMapByGroup(map, layerGroupName, layerName);
  }
  public getLayerFromMapByGroupName(layerGroupName: string, layerName: string): any {
    return this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, layerGroupName, layerName);
  }



  public setVisibility(name: string, visibility: boolean, layerType) {

    const layer = this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, layerType, name);
    if (layer !== null) {
      this.mapOpenlayersService.setVisibilityLayer(layer, visibility);
    }

  }


  /** marker creation */
  clearLayer(layer) {
    this.mapOpenlayersService.clearLayer(layer);
  }
  createMarker(coordinates: any) {
    const layerMarker = this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, 'interaction_layers', 'localisation');
    this.mapOpenlayersService.clearLayer(layerMarker);
    let feature = null;

    const featureConf = {
      coordinates: coordinates
      , type: 'Point'
      , projection: this._currentMapSettings.view.projection
    };

    this.mapOpenlayersService.clearLayer(layerMarker);
    feature = this.mapOpenlayersService.createFeature(featureConf, this._currentMapSettings.view.projection);
    this.mapOpenlayersService.addFeaturesToLayer(layerMarker, [feature]);
    layerMarker.setVisible(true);

  }
  createFeature(featureConf: any) {
    return this.mapOpenlayersService.createFeature(featureConf, this._currentMapSettings.view.projection);
  }

  clearMarkerandPopup() {
    const layerMarkerToClear = this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, 'interaction_layers', 'localisation');
    this.mapOpenlayersService.clearLayer(layerMarkerToClear);
    const pop = document.getElementById('popup');
    if (pop !== null) { pop.style.display = 'none'; }
  }

  /* create Popup*/

  createPopup(coordinates: any, address: string) {

    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content').innerHTML = address;
    const closer = document.getElementById('popup-closer');
    container.style.display = '';
    const popup = new ol.Overlay({
      element: container,
      autoPan: true,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -40],
    });

    closer.onclick = function () {
      popup.setPosition(undefined);
      closer.blur();
      return false;
    };


    popup.setPosition(coordinates);
    this._mainMap.addOverlay(popup);
  }


  public addFeaturesToLayer(layer: any, features: any[]) {
    this.mapOpenlayersService.addFeaturesToLayer(layer, features);
  }
  public findCurrentLocation() {
    if (this.location === null) {
      this.location = this.locationService.createLocation(
        this._currentMapSettings.view.projection);
    }
    const layerGeolocalisation = this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, 'interaction_layers', 'geolocation');
    this.mapOpenlayersService.clearLayer(layerGeolocalisation);
    let feature = null;
    /*let dataFeatureInit = this.locationService.initDataFeatureForLocation(this.configurationService.activeConfiguration.projection);
  feature = this.mapOpenlayersService.createFeature(dataFeatureInit,
    this.configurationService.activeConfiguration.projection);*/
    let firstZoomIndex = true;
    /*navigator.geolocation.getCurrentPosition((position) => {
      alert(position.coords.longitude);
    });*/

    this.location.on('change:position', function () {
      // let heading = this.geolocation.getHeading() || 0;
      // layerGeolocalisation.getStyle().getImage().setRotation(heading);
      const coordinates: ol.Coordinate = this.location.getPosition();
      const dataFeature = {
        coordinates: coordinates
        , type: 'Point'
        , projection: this._currentMapSettings.view.projection
      };
      // alert('X=' + coordinates[0] + '  and Y=' + coordinates[1]);
      this.mapOpenlayersService.clearLayer(layerGeolocalisation);
      feature = this.mapOpenlayersService.createFeature(dataFeature,
        this._currentMapSettings.view.projection);
      this.mapOpenlayersService.addFeaturesToLayer(layerGeolocalisation, [feature]);
      if (!this.mapOpenlayersService.isContainCordinate(this._mainMap, coordinates) || firstZoomIndex) {
        this.mapOpenlayersService.setMapCenter(this._mainMap, coordinates);
      }
      if (firstZoomIndex) {
        this.mapOpenlayersService.setMapZoom(this._mainMap,
          JSON.parse(this._currentMapSettings.projlocalisationConfig.gpsZoom));
        this.sendLogs(coordinates, this.getMapZoom());
        firstZoomIndex = false;
      }
    }, this);

    /*let deviceOrientation = new ol.DeviceOrientation({
        tracking: true
      });
      // when the device changes heading, rotate the view so that
      // 'up' on the device points the direction we are facing
      deviceOrientation.on('change:heading', function (event) {
         alert(deviceOrientation.getHeading());
      });*/
    layerGeolocalisation.setVisible(true);
    this.location.setTracking(true);
  }
  public resetLocation() {
    if (this.location !== null) {
      this.location.setTracking(false);
      this.location = null;
      const layerGeolocalisation = this.mapOpenlayersService.getLayerFromMapByGroup(this._mainMap, 'interaction_layers', 'geolocation');
      this.mapOpenlayersService.clearLayer(layerGeolocalisation);
    }

  }
  /**
   * TDM
   */
  generateContextLayersFromCurrentTableOfContent(advanced: boolean) {
    return this.tableOfContentService.generateContextLayersFromTableOfContent(this._currentTableOfContent, advanced);
  }
  changeCheckDomain(domain: TableOfContentDomain, currentTableOfContent) {
    const oldtableOfContent = this.tableOfContentService.allOldtableOfContent
      .find(element => element.id === Number.parseInt(this._currentTableOfContent.id));
    this.tableOfContentService.changeCheckDomain(domain);
    this._isChangedToc = this.tableOfContentService.checkIfTableOfContentIsChanged(oldtableOfContent, this._currentTableOfContent);
    this.isChangedTocSubject.next(this._isChangedToc);

  }
  changeCheckService(service: TableOfContentServiceObject, currentTableOfContent) {
    const oldtableOfContent = this.tableOfContentService.allOldtableOfContent.
      find(element => element.id === Number.parseInt(this._currentTableOfContent.id));
    this.tableOfContentService.changeCheckService(service);
    this._isChangedToc = this.tableOfContentService.checkIfTableOfContentIsChanged(oldtableOfContent, this._currentTableOfContent);
    this.isChangedTocSubject.next(this._isChangedToc);
  }
  changeCheckNode(node: TableOfContentNode, checked: boolean, currentTableOfContent) {
    const oldtableOfContent = this.tableOfContentService.allOldtableOfContent
      .find(element => element.id === Number.parseInt(this._currentTableOfContent.id));
    this.tableOfContentService.changeCheckNode(node, checked);
    this._isChangedToc = this.tableOfContentService.checkIfTableOfContentIsChanged(oldtableOfContent, this._currentTableOfContent);
    this.isChangedTocSubject.next(this._isChangedToc);
  }
  addLayerServiceToMap(service: TableOfContentServiceObject) {
    let layer: ol.layer.Layer = this.getLayerFromMapByGroup(this._mainMap, 'tableOfContent_layers', service.name);
    const LAYERS = this.generateLAYERSParamsForService(service);
    if (layer === null || (typeof layer === 'undefined')) {
      if (LAYERS !== '' && (typeof LAYERS !== 'undefined')) {
        layer = this.createLayerFromService(service, LAYERS);
        this.insertLayersInGroup('tableOfContent_layers', layer);
        layer.setVisible(true);
        layer.setZIndex(service.zIndex);
        layer.setOpacity(service.opacity / 100);
      }
    } else {
      if (LAYERS === '') {
        this.mapOpenlayersService.removeLayerFromGroup(this._mainMap, 'tableOfContent_layers', service.name);
      } else {
        this.setLayerParams(layer, service, LAYERS);
      }

    }
  }
  createLayerFromService(service: TableOfContentServiceObject, LAYERS: string): ol.layer.Layer {
    const geoSource: GeoSource = {
      type: service.serviceType,
      ratio: service.ratio,
      url: service.url,
      params: {
        LAYERS: '',
        FORMAT: 'image/png; mode=8bit',
        VERSION: '1.3.1',
        transparent: service.transparent
      }
    };
    (<TableOfContentSourceParams>geoSource.params).LAYERS = LAYERS;
    const geoLayer: GeoLayer = {
      name: service.name,
      visible: true,
      enabled: true,
      source: geoSource,
      type: service.resultType,
      zIndex: service.zIndex
    };
    return this.mapOpenlayersService.createLayer(geoLayer);
  }
  generateLAYERSParamsForService(service: TableOfContentServiceObject): string {
    let layersName = '';
    if (typeof service.Layer !== 'undefined') {
      for (let i = 0; i < service.layersList.length; i++) {
        if (service.layersList[i].visible) {
          if (i !== 0) {
            layersName = layersName + ',' + service.layersList[i].name;
          } else {
            layersName = service.layersList[i].name;
          }
        }
      }
    }
    return layersName;
  }
  setLayerParams(layer: ol.layer.Layer, service: TableOfContentServiceObject, LAYERS: string) {
    this.mapOpenlayersService.setWMSLayersSource(layer, LAYERS);
  }
  getLayersGroup(groupName: string): ol.layer.Group {
    return this.mapOpenlayersService.getLayersGroup(this._mainMap, groupName);
  }
  insertLayersInGroup(groupName: string, layer: ol.layer.Layer) {
    this.mapOpenlayersService.insertLayersInGroup(this._mainMap, groupName, layer);
  }
  refrechService(service: TableOfContentServiceObject) {
     console.log(service);
    service.layersList = [];
    if (typeof service.Layer !== 'undefined') {
      service.Layer.forEach(child => {
        if (typeof child !== 'undefined') {
          this.tableOfContentService.refrechserviceByNode(child, service);
        }
      });
      let nbrChecked = 0;
      for (let i = 0; i < service.Layer.length; i++) {
        if (service.Layer[i].checked) {
          service.checked = true;
          nbrChecked++;
        }
      }
      if (nbrChecked === service.Layer.length) {
        service.allNodescheck = true;
      } else {
        service.allNodescheck = false;
      }
      this.addLayerServiceToMap(service);
    }
  }
  refrechDomainCheck(domain: TableOfContentDomain) {
    this.tableOfContentService.refrechDomainCheck(domain);
  }
  refrechServiceCheck(service: TableOfContentServiceObject, domain: TableOfContentDomain) {
    this.tableOfContentService.refrechServiceCheck(service, domain);
  }
  refrechSubNodeCheck(node: TableOfContentNode) {
    this.tableOfContentService.refrechSubNodeCheck(node);
  }
  getParentNode(node: TableOfContentNode, service: TableOfContentServiceObject): TableOfContentNode {
    return this.tableOfContentService.getParentNode(node, service);
  }
  initLegendCollapse(node: TableOfContentNode) {
    this.tableOfContentService.initLegendCollapse(node);
  }
  refrechVisibilityByResolution(tableOfContent: any, scale: number) {
    if (typeof tableOfContent !== 'undefined') {
      if (typeof tableOfContent.domains !== 'undefined') {
        tableOfContent.domains.forEach(domain => {
          if (typeof domain.services !== 'undefined') {
            domain.services
              .forEach(service => {
                if (typeof service.Layer !== 'undefined') {
                  service.Layer.forEach(node => {
                    if (typeof node !== 'undefined') {
                      this.tableOfContentService.refrechNodeVisibilityByResolution(node, scale);
                    }
                  });
                }
                this.refrechService(service);
              });
          }
        });
      }
    }

  }
  setServiceOpacity(service: TableOfContentServiceObject, groupeName: string) {
    const layer: ol.layer.Layer = this.getLayerFromMapByGroup(this._mainMap, groupeName, service.name);
    this.mapOpenlayersService.setLayerOpacity(layer, (service.opacity / 100));
  }
  setLayerOpacity(layerName: string, groupeName: string, opacity: number) {
    const layer: ol.layer.Layer = this.getLayerFromMapByGroup(this._mainMap, groupeName, layerName);
    this.mapOpenlayersService.setLayerOpacity(layer, (opacity / 100));
  }
  /**
   * Logs
   */
  public sendLogs(coordinates: ol.Coordinate, zoom: number) {
    const gpsInitialPosition: Point = { type: 'Point', coordinates: coordinates };
    // this.logService.logGpsLocalization(gpsInitialPosition, zoom);
  }
}
