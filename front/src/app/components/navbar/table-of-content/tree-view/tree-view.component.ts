
import { Component, OnInit, Input} from '@angular/core';

import { TableOfContentDomain } from 'app/model/TableOfContent/TableOfContentDomain';
import { TableOfContentNode } from 'app/model/TableOfContent/TableOfContentNode';
import { TableOfContentServiceObject } from 'app/model/TableOfContent/TableOfContentService';
import { MapToolsService } from 'app/services/map-tools/map-tools.service';
@Component({
  selector: 'app-tree-view',
  templateUrl: './tree-view.component.html',
  styleUrls: ['./tree-view.component.css']
})
export class TreeViewComponent implements OnInit {
  @Input() tree: TableOfContentNode;
  @Input() domain: TableOfContentDomain;
  @Input() service: TableOfContentServiceObject;
  @Input() currenttableOfContent: any;
  constructor(private mapToolsService: MapToolsService) { }

  ngOnInit() {
  }
  collapse(item: any) {
    item.collapseIn = !item.collapseIn;
  }
  checkNode(item: TableOfContentNode, service: TableOfContentServiceObject, domain: TableOfContentDomain) {
    this.mapToolsService.changeCheckNode(item, !item.checked, this.currenttableOfContent);
    this.mapToolsService.refrechService(service);
    let parent: TableOfContentNode = this.mapToolsService.getParentNode(item, service);
    if (typeof parent !== 'undefined') {
      let exit = false;
      while (!exit && parent !== item) {
        this.mapToolsService.refrechSubNodeCheck(parent);
        if (parent.parent !== service.name) {
          parent = this.mapToolsService.getParentNode(parent, service);
        } else {
          exit = true;
        }

      }
    }
    this.mapToolsService.refrechServiceCheck(service, domain);
  }
  collapseLegende(node: TableOfContentNode) {
    node.collapseLegend = ! node.collapseLegend;
  }
}
