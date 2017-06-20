export interface TableOfContentNode {
  name: string;
  Name: string;
  title: string;
  Abstract: string;
  checked: boolean;
  MinScaleDenominator?: number;
  MaxScaleDenominator?: number;
  zindex?: number;
  legendUrl?: string;
  isGroup: boolean;
  visible?: boolean;
  parent: string;
  Layer?: TableOfContentNode[];
  service: string;
  collapseLegend?: boolean;
  allNodescheck?: boolean;
  searchLocation?: string;
}

