export interface GeoSource {
    type: any;
    mapId?: any;
    accessToken?: any;
    userId?: any;
    tileSize?: any; // [512, 512]
    url?: any;
    params: any; // {}
    ratio?: any;
    crossOrigin?: any;
    urls?: any;
    serverType?: any;
    tileGrid?: any; // {origin,resolutions,matrixIds},
    matrixSet?: any;
    format?: any;
    requestEncoding?: any;
    style?: any; // {},
    key?: any;
    imagerySet?: any;
    culture?: any;
    maxZoom?: any;
    minZoom?: any;
    layer?: any;
    geojson?: any; // :{}
    wkt?: any; // :{}
    topojson?: any;
    maxExtent?: any;
    extractStyles?: any;
    imageSize?: any; // :[w,h]
    imageExtent?: any;
    imageLoadFunction?: any; // :function,
    tileUrlFunction?: any; // :function,
    projection?: any;
    attribution?: any;
}
