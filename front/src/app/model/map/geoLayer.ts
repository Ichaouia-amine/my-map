import {GeoSource} from './geoSource';
export interface GeoLayer {
    name: string;
    title?: string;
    MinScale?: number;
    MaxScale?: number;
    visible: boolean;
    enabled: boolean;
    service_type?: string;
    url?: string;
    zIndex?: number;
    nodeType?: string;
    parent?: string;
    service?: string;
    layerOpenLayerWMS?: any;
    legendUrl?: any;
    opacity?: any;
    source?: GeoSource;
    type?: string;
    clustering?: boolean;
    clusteringDistance?: number;
    extent?: any;
    minResolution?: any;
    maxResolution?: any;
}
