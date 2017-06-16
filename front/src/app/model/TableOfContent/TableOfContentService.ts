import { TableOfContentNode } from './TableOfContentNode';
export interface TableOfContentServiceObject {
  name: string;
   title: string;
   checked: boolean;
   url: string;
   tileSize: string;
   serviceType: string;
   resultType: string;
   collapsed: string;
   ratio: number;
   layersList?: TableOfContentNode [];
   Layer: TableOfContentNode [];
   zIndex: number;
   opacity?: number;
   allNodescheck?: boolean;
   transparent?: boolean;
   layersConfig?: TableOfContentNode [];
   serverType?: string;
   useCapabilitiesLikeSource?: boolean;
   oneLayerByService?: boolean;
   urlWMS?: string;
   urlWFS?: string;
   urlGetCapabilities?: string;
}
