import { Injectable } from '@angular/core';
// import {GeoSource} from '../../model/map/geoSource';
// import {GeoStyle} from '../../model/map/geoStyle';
// import { GeoLayer } from '../../model/map/geoLayer';
import * as ol from 'openlayers';
@Injectable()
export class LayerOpenlayersService {
    bingImagerySets: string[];
    mapQuestLayers: string[];
    constructor() {
        this.bingImagerySets = [
            'Road',
            'Aerial',
            'AerialWithLabels',
            'collinsBart',
            'ordnanceSurvey'
        ];
        this.mapQuestLayers = [
            'osm',
            'sat',
            'hyb'
        ];
    }
    /** Tested */
    createLayer(layer: any, projection: any, name: any, onLayerCreatedFn: any) {
        let oLayer: any;
        if (layer.type === 'none') {
            return;
        }
        const type = this.detectLayerType(layer);
        let oSource = this.createSource(layer.source, projection);
        if (!oSource) {
            return;
        }

        // handle function overloading. 'name' argument may be
        // our onLayerCreateFn since name is optional
        if (typeof (name) === 'function' && !onLayerCreatedFn) {
            onLayerCreatedFn = name;
            name = undefined; // reset, otherwise it'll be used later on
        }

        // Manage clustering
        if ((type === 'Vector') && layer.clustering) {
            oSource = new ol.source.Cluster({
                source: oSource,
                distance: layer.clusteringDistance
            });
        }

        const layerConfig = { source: oSource };

        /* if (this.isDefinedAndNotNull(layer.opacity)) {
             layerConfig.opacity = layer.opacity;
         }
         if (this.isDefinedAndNotNull(layer.visible)) {
             layerConfig.visible = layer.visible;
         }
         if (this.isDefinedAndNotNull(layer.extent)) {
             layerConfig.extent = layer.extent;
         }
         if (this.isDefinedAndNotNull(layer.zIndex)) {
             layerConfig.zIndex = layer.zIndex;
         }
         if (this.isDefinedAndNotNull(layer.minResolution)) {
             layerConfig.minResolution = layer.minResolution;
         }
         if (this.isDefinedAndNotNull(layer.maxResolution)) {
             layerConfig.maxResolution = layer.maxResolution;
         }*/

        switch (type) {
            case 'Image':
                oLayer = new ol.layer.Image(layerConfig);
                break;
            case 'Tile':
                oLayer = new ol.layer.Tile(layerConfig);
                break;
            /*
        case 'Heatmap':
            oLayer = new ol.layer.Heatmap(layerConfig);
            break;*/
            case 'Vector':
                oLayer = new ol.layer.Vector(layerConfig);
                break;
            /*
        case 'TileVector':
            oLayer = new ol.layer.VectorTile(layerConfig);
            break;
            */
        }

        // set a layer name if given
        if (this.isDefined(name)) {
            oLayer.set('name', name);
        } else if (this.isDefined(layer.name)) {
            oLayer.set('name', layer.name);
        }

        // set custom layer properties if given
        /*
        if (this.isDefined(layer.customAttributes)) {
            for (let key in layer.customAttributes) {
                oLayer.set(key, layer.customAttributes[key]);
            }
        }*/

        // invoke the onSourceCreated callback
        if (onLayerCreatedFn) {
            onLayerCreatedFn({
                oLayer: oLayer
            });
        }
        return oLayer;
    }
    /** Tested */
    isDefined(value: any) {
        if (typeof value !== 'undefined') {
            return true;
        }

        return false;
    }
    /** Tested */
    isDefinedAndNotNull(value: any) {
        return (typeof value !== 'undefined') && value !== null;
    }
    /** Tested */
    detectLayerType(layer: any) {
        if (layer.type) {
            return layer.type;
        } else {
            switch (layer.source.type) {
                case 'ImageWMS':
                    return 'Image';
                case 'ImageStatic':
                    return 'Image';
                case 'GeoJSON':
                case 'JSONP':
                case 'TopoJSON':
                case 'KML':
                case 'WKT':
                    return 'Vector';
                case 'TileVector':
                    return 'TileVector';
                default:
                    return 'Tile';
            }
        }
    }
    /** Tested */
    createSource(source: any, projection: any) {
        let oSource: any;
        let url: any;
        const geojsonFormat = new ol.format.GeoJSON(); // used in various switch stmnts below

        switch (source.type) {
            case 'MapBox':
                if (!source.mapId || !source.accessToken) {
                    console.log('[AngularJS - Openlayers] - MapBox layer requires the map id and the access token');
                    return;
                }
                url = 'http://api.tiles.mapbox.com/v4/' + source.mapId + '/{z}/{x}/{y}.png?access_token=' +
                    source.accessToken;

                const pixelRatio = window.devicePixelRatio;

                if (pixelRatio > 1) {
                    url = url.replace('.png', '@2x.png');
                }

                oSource = new ol.source.XYZ({
                    url: url,
                    attributions: this.createAttribution(source),
                    tilePixelRatio: pixelRatio > 1 ? 2 : 1
                });
                break;
            case 'MapBoxStudio':
                if (!source.mapId || !source.accessToken || !source.userId) {
                    console.log('[AngularJS - Openlayers] - MapBox Studio layer requires the map id' +
                        ', user id  and the access token');
                    return;
                }
                url = 'https://api.mapbox.com/styles/v1/' + source.userId +
                    '/' + source.mapId + '/tiles/{z}/{x}/{y}?access_token=' +
                    source.accessToken;

                oSource = new ol.source.XYZ({
                    url: url,
                    attributions: this.createAttribution(source),
                    tileSize: source.tileSize || [512, 512]
                });
                break;
            case 'ImageWMS':
                if (!source.url || !source.params) {
                    console.log('[AngularJS - Openlayers] - ImageWMS Layer needs ' +
                        'valid server url and params properties');
                }
                oSource = new ol.source.ImageWMS({
                    url: source.url,
                    projection: '',
                    attributions: this.createAttribution(source),
                    // crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
                    params: source.params,
                    ratio: source.ratio
                });
                break;

            case 'TileWMS':
                if ((!source.url && !source.urls) || !source.params) {
                    console.log('[AngularJS - Openlayers] - TileWMS Layer needs ' +
                        'valid url (or urls) and params properties');
                }

                const wmsConfiguration = {
                    // crossOrigin: (typeof source.crossOrigin === 'undefined') ? 'anonymous' : source.crossOrigin,
                    params: source.params,
                    serverType: '',
                    url: '',
                    urls: [],
                    tileGrid: null,
                    projection: ''
                    // attributions: this.createAttribution(source)
                };

                if (source.serverType) {
                    wmsConfiguration.serverType = source.serverType;
                }

                if (source.url) {
                    wmsConfiguration.url = source.url;
                }

                if (source.urls) {
                    wmsConfiguration.urls = source.urls;
                }
                if (source.tileGrid) {
                    wmsConfiguration.tileGrid = new ol.tilegrid.TileGrid(source.tileGrid);

                }



                oSource = new ol.source.TileWMS(wmsConfiguration);



                break;

            case 'WMTS':
                if ((!source.url && !source.urls) || !source.tileGrid) {
                    console.log('[AngularJS - Openlayers] - WMTS Layer needs valid url ' +
                        '(or urls) and tileGrid properties');
                }
                const wmtsConfiguration = {
                    url: source.url,
                    // urls: [],
                    projection: source.projection,
                    layer: source.layer,
                    // attributions: this.createAttribution(source),
                    matrixSet: (source.matrixSet === 'undefined') ? projection : source.matrixSet,
                    format: (source.format === 'undefined') ? 'image/jpeg' : source.format,
                    requestEncoding: (source.requestEncoding === 'undefined') ?
                        'KVP' : source.requestEncoding,
                    tileGrid: new ol.tilegrid.WMTS({
                        origin: source.tileGrid.origin,
                        resolutions: source.tileGrid.resolutions,
                        matrixIds: source.tileGrid.matrixIds
                    }),
                    style: (source.style === 'undefined') ? 'normal' : source.style
                };

                /* if (this.isDefined(source.url)) {
                     wmtsConfiguration.url = source.url;
                 }*/

                /*if (this.isDefined(source.urls)) {
                    wmtsConfiguration.urls = source.urls;
                }*/

                oSource = new ol.source.WMTS(wmtsConfiguration);
                break;

            case 'OSM':
                oSource = new ol.source.OSM();

                if (source.url) {
                    oSource.setUrl(source.url);
                }

                break;
            case 'BingMaps':
                if (!source.key) {
                    console.log('[AngularJS - Openlayers] - You need an API key to show the Bing Maps.');
                    return;
                }

                const bingConfiguration = {
                    key: source.key,
                    attributions: this.createAttribution(source),
                    imagerySet: source.imagerySet ? source.imagerySet : this.bingImagerySets[0],
                    culture: source.culture,

                };

                /*if (source.maxZoom) {
                    bingConfiguration.maxZoom = source.maxZoom;
                }*/

                oSource = new ol.source.BingMaps(bingConfiguration);
                break;

            /*case 'MapQuest':
                if (!source.layer || this.mapQuestLayers.indexOf(source.layer) === -1) {
                    console.log('[AngularJS - Openlayers] - MapQuest layers needs a valid \'layer\' property.');
                    return;
                }

                oSource = new ol.source.MapQuest({
                    attributions: this.createAttribution(source),
                    layer: source.layer
                });

                break;

            case 'EsriBaseMaps':
                if (!source.layer || this.esriBaseLayers.indexOf(source.layer) === -1) {
                    console.log('[AngularJS - Openlayers] - ESRI layers needs a valid \'layer\' property.');
                    return;
                }

                let _urlBase = 'http://services.arcgisonline.com/ArcGIS/rest/services/';
                let _url = _urlBase + source.layer + '/MapServer/tile/{z}/{y}/{x}';

                oSource = new ol.source.XYZ({
                    attributions: this.createAttribution(source),
                    url: _url
                });

                break;
            case 'TileEsri':
                if (!source.url) {
                    console.log('[AngularJS - Openlayers] - ESRI layers needs a valid \'url\' property.');
                    return;
                }



                oSource = new ol.source.TileArcGISRest({
                    url: source.url
                })

                break;
          */
            case 'GeoJSON':
                if (!(source.geojson || source.url)) {
                    console.log('[AngularJS - Openlayers] - You need a geojson ' +
                        'property to add a GeoJSON layer.');
                    return;
                }

                if (this.isDefined(source.url)) {
                    oSource = new ol.source.Vector({
                        format: new ol.format.GeoJSON(),
                        url: source.url
                    });
                } else {
                    oSource = new ol.source.Vector();

                    const projectionToUse = projection;
                    let dataProjection: any; // Projection of geojson data
                    /* if (this.isDefined(source.geojson.projection)) {
                         dataProjection = new ol.proj.get(source.geojson.projection);
                     } else {
                         dataProjection = projection; // If not defined, features will not be reprojected.
                     }*/
                    dataProjection = projection;
                    const features = geojsonFormat.readFeatures(
                        source.geojson.object, {
                            featureProjection: projectionToUse.getCode(),
                            dataProjection: dataProjection.getCode()
                        });

                    oSource.addFeatures(features);
                }

                break;
            /*
        case 'WKT':
            if (!(source.wkt) && !(source.wkt.data)) {
                console.log('[AngularJS - Openlayers] - You need a WKT ' +
                    'property to add a WKT format vector layer.');
                return;
            }

            oSource = new ol.source.Vector();
            let wktFormatter = new ol.format.WKT();
            let wktProjection: any; // Projection of wkt data
            if (this.isDefined(source.wkt.projection)) {
                wktProjection = new ol.proj.g.get(source.wkt.projection);
            } else {
                wktProjection = projection; // If not defined, features will not be reprojected.
            }

            let wktFeatures = wktFormatter.readFeatures(
                source.wkt.data, {
                    featureProjection: projection.getCode(),
                    dataProjection: wktProjection.getCode()
                });

            oSource.addFeatures(wktFeatures);
            break;

        case 'JSONP':
            if (!(source.url)) {
                console.log('[AngularJS - Openlayers] - You need an url properly configured to add a JSONP layer.');
                return;
            }

            if (this.isDefined(source.url)) {
                oSource = new ol.source.ServerVector({
                    format: geojsonFormat,
                    loader: function () {
                        let url = source.url +
                            '&outputFormat=text/javascript&format_options=callback:JSON_CALLBACK';

                        this.http.get(url)
                            .toPromise()
                            .then(data => { oSource.addFeatures(geojsonFormat.readFeatures(data)) });


                    },
                    projection: projection
                });
            }
            break;
            */
            case 'TopoJSON':
                if (!(source.topojson || source.url)) {
                    console.log('[AngularJS - Openlayers] - You need a topojson ' +
                        'property to add a TopoJSON layer.');
                    return;
                }

                if (source.url) {
                    oSource = new ol.source.Vector({
                        format: new ol.format.TopoJSON(),
                        url: source.url
                    });
                } else {
                    // a revisé
                    /*oSource = new ol.source.Vector(angular.extend(source.topojson, {
                        format: new ol.format.TopoJSON()
                    }));*/
                }
                break;
            case 'TileJSON':
                oSource = new ol.source.TileJSON({
                    url: source.url,
                    attributions: this.createAttribution(source),
                    crossOrigin: 'anonymous'
                });
                break;
            case 'VectorInteraction':
                oSource = new ol.source.Vector({
                    features: []
                });
                break;

            case 'TileTMS':
                if (!source.url || !source.tileGrid) {
                    console.log('[AngularJS - Openlayers] - TileTMS Layer needs valid url and tileGrid properties');
                }
                oSource = new ol.source.TileImage({
                    url: source.url,
                    projection: '',
                    // maxExtent: source.maxExtent,
                    attributions: this.createAttribution(source),
                    tileGrid: new ol.tilegrid.TileGrid({
                        origin: source.tileGrid.origin,
                        resolutions: source.tileGrid.resolutions
                    }),
                    tileUrlFunction: function (tileCoord: any) {

                        const z = tileCoord[0];
                        const x = tileCoord[1];
                        const y = tileCoord[2]; // (1 << z) - tileCoord[2] - 1;

                        if (x < 0 || y < 0) {
                            return '';
                        }

                        return source.url + z + '/' + x + '/' + y + '.png';
                    }
                });
                break;
            case 'TileImage':
                oSource = new ol.source.TileImage({
                    url: source.url,
                    projection: '',
                    attributions: this.createAttribution(source),
                    tileGrid: new ol.tilegrid.TileGrid({
                        origin: source.tileGrid.origin, // top left corner of the pixel projection's extent
                        resolutions: source.tileGrid.resolutions
                    }),
                    tileUrlFunction: function (tileCoord: any/*, pixelRatio, projection*/) {
                        const z = tileCoord[0];
                        const x = tileCoord[1];
                        const y = -tileCoord[2] - 1;
                        return source.url
                            .replace('{z}', z.toString())
                            .replace('{x}', x.toString())
                            .replace('{y}', y.toString());
                    }
                });
                break;
            case 'KML':
                // let extractStyles = source.extractStyles || false;
                oSource = new ol.source.Vector({
                    url: source.url,
                    format: new ol.format.KML(),
                    // radius: source.radius,
                    // extractStyles: extractStyles
                });
                break;
            case 'Stamen':
                if (!source.layer || !this.isValidStamenLayer(source.layer)) {
                    console.log('[AngularJS - Openlayers] - You need a valid Stamen layer.');
                    return;
                }
                oSource = new ol.source.Stamen({
                    layer: source.layer
                });
                break;
            case 'ImageStatic':
                if (!source.url || !this.isArray(source.imageSize) || source.imageSize.length !== 2) {
                    console.log('[AngularJS - Openlayers] - You need a image URL to create a ImageStatic layer.');
                    return;
                }

                oSource = new ol.source.ImageStatic({
                    url: source.url,
                    attributions: this.createAttribution(source),
                    imageSize: source.imageSize,
                    projection: projection,
                    imageExtent: source.imageExtent ? source.imageExtent : projection.getExtent(),
                    imageLoadFunction: source.imageLoadFunction
                });
                break;
            case 'XYZ':
                if (!source.url && !source.tileUrlFunction) {
                    console.log('[AngularJS - Openlayers] - XYZ Layer needs valid url or tileUrlFunction properties');
                }
                oSource = new ol.source.XYZ({
                    url: source.url,
                    attributions: this.createAttribution(source),
                    minZoom: source.minZoom,
                    maxZoom: source.maxZoom,
                    projection: source.projection,
                    tileUrlFunction: source.tileUrlFunction
                });
                break;
            case 'Zoomify':
                if (!source.url || !this.isArray(source.imageSize) || source.imageSize.length !== 2) {
                    console.log('[AngularJS - Openlayers] - Zoomify Layer needs valid url and imageSize properties');
                }
                oSource = new ol.source.Zoomify({
                    url: source.url,
                    size: source.imageSize
                });
                break;
        }

        // log a warning when no source could be created for the given type
        if (!oSource) {
            console.log('[AngularJS - Openlayers] - No source could be found for type "' + source.type + '"');
        }

        return oSource;
    }
    /** Tested */
    isArray(value: any) {
        if (Array.isArray(value)) {
            return true;
        }
        return false;
    }
    /** Tested */
    isValidStamenLayer(layer: any) {
        return ['watercolor', 'terrain', 'toner'].indexOf(layer) !== -1;
    }
    createAttribution(source: any) {
        const attributions: any[] = [];
        if (this.isDefined(source.attribution)) {
            attributions.unshift(new ol.Attribution({ html: source.attribution }));
        }
        return attributions;
    }
    /** Tested */
    getGroup(layers: ol.Collection<any>, name: any) {
        return layers.getArray().find(element => (element instanceof ol.layer.Group && element.get('name') === name));
    }
    /** Tested */
    createGroup(name: any) {
        const olGroup = new ol.layer.Group();
        olGroup.set('name', name);

        olGroup.setLayers(new ol.Collection<any>());

        return olGroup;
    }
    removeLayer(layers: any, index: any) {
        layers.removeAt(index);
        for (let i = index; i < layers.getLength(); i++) {
            const l = layers.item(i);
            if (l === null) {
                layers.insertAt(i, null);
                break;
            } else {
                l.index = i;
            }
        }
    }
    /** Tested */
    createStyle(data: any) {
        let style: any = null;
        let fill: any = null;
        let stroke: any = null;



        if (this.isDefinedAndNotNull(data.fillColor)) {
            fill = new ol.style.Fill({
                color: data.fillColor
            });
        }
        if (this.isDefinedAndNotNull(data.strokeColor) && this.isDefinedAndNotNull(data.strokewidth)) {
            const strokeConfig = {
                color: data.strokeColor,
                width: data.strokewidth
            };

            stroke = new ol.style.Stroke(strokeConfig);

        }

        switch (data.type) {

            case 'circle':
                style = new ol.style.Style({
                    image: new ol.style.Circle({
                        fill: fill,
                        stroke: stroke,
                        radius: data.radius
                    }),
                    fill: fill,
                    stroke: stroke
                });

                break;
            case 'icon':
                style = new ol.style.Style({
                    image: new ol.style.Icon(({
                        anchor: data.anchor,
                        anchorXUnits: data.anchorXUnits,
                        anchorYUnits: data.anchorYUnits,
                        opacity: data.opacity,
                        src: data.src
                    }))
                });
                break;
            case 'style':
                style = new ol.style.Style({
                    fill: fill,
                    stroke: stroke
                });
                break;
        }
        return style;
    }
    getLayerFromGroup(layerGroups: ol.Collection<any>, layerGroupName: string, layerName: string) {
        const collection = this.getLayerCollectionFromGroup(layerGroups, layerGroupName);
        return collection.getArray().find(element => element.get('name') === layerName);
    }




  getLayerGroup(layerGroups: ol.Collection<any>, layerGroupName: string) {
    const collection = this.getLayerCollectionFromGroup(layerGroups, layerGroupName);
    return collection.getArray();
  }



    getLayerCollectionFromGroup(layers: any, name: any): ol.Collection<any> {
        const layerGroup = this.getGroup(layers, name);
        if (layerGroup != null) {
            return layerGroup.getLayers();
        }
        return null;
    }
    public clearLayer(layer: any) {
  layer.getSource().clear();
}


  public setVisibility(layer: any, visibility: boolean) {
    layer.setVisible(visibility);
  }
    /** Tested */
    createGeometry(data: any, viewProjection: any): ol.geom.Geometry {
        let geometry: ol.geom.Geometry;
        let coordinates = data.coordinates;
        if (this.isDefined(data.projection) && data.projection !== viewProjection) {
            coordinates = ol.proj.transform(data.coordinates, data.projection, viewProjection);
        }

        switch (data.type) {
            case 'MultiPolygon':
                geometry = new ol.geom.MultiPolygon(coordinates);
                break;
            case 'Polygon':
                geometry = new ol.geom.Polygon(coordinates);
                break;
            case 'MultiLineString':
                geometry = new ol.geom.MultiLineString(coordinates);
                break;
            default:
                geometry = new ol.geom.Point(coordinates);
                break;
        }
        return geometry;
    }
    /** Tested */
    createFeature(data: any, viewProjection: any): ol.Feature {
        const featureConfig = {
            geometry: this.createGeometry(data, viewProjection),
            type: data.type,
            properties: null
        };
        if (this.isDefined(data.properties)) {
            featureConfig.properties = data.properties;
        }
        const feature = new ol.Feature(featureConfig);

        if (this.isDefined(data.style)) {
            const style = this.createStyle(data.style);
            feature.setStyle(style);
        }
        return feature;
    }
    createFeatureByGeometry(geometry: ol.geom.Geometry): ol.Feature {
        if (this.isDefined(geometry) &&  geometry instanceof ol.geom.Geometry) {
             return new ol.Feature({geometry: geometry});
        }
        return null;

    }
    getLayerVectorSourcesExtent(layer: ol.layer.Layer) {
        return (<ol.source.Vector>layer.getSource()).getExtent();
    }
}
