import { Injectable } from '@angular/core';

import { Headers, RequestOptions, Http, Response } from '@angular/http';
import { TableOfContentNode } from 'app/model/TableOfContent/TableOfContentNode';
import { HttpService } from 'app/services/httpService/http.service';
import { TableOfContentDomain } from 'app/model/TableOfContent/TableOfContentDomain';
import { TableOfContentServiceObject } from 'app/model/TableOfContent/TableOfContentService';
@Injectable()
export class TableOfContentService {
 public allContexts: any[];
  public allOldtableOfContent: any[] = [];
  constructor(private http: Http, private httpService: HttpService) { }


  getGETCapabilitiesByMapService(url: string) {
    const headers = new Headers();
    headers.append('Accept', 'application/xml');
    const options = new RequestOptions({ headers: headers });
    return this.http.get(url, options)
      .map((res: Response) => res.text());
  }
  addFunctionelAttributesForGetCapabilitiesLayer(node: TableOfContentNode, functionelLayer: TableOfContentNode,
    parent: string, service: string) {
    if (functionelLayer !== null) {
      if (node.Name === functionelLayer.code || node.Abstract === functionelLayer.code) {
        for (const key in functionelLayer) {
          if (functionelLayer.hasOwnProperty(key)) {
            node[key] = functionelLayer[key];
          }
        }
        return;
      }
    }
    node.parent = parent;
    node.service = service;
    if (typeof node.Layer !== 'undefined') {
      if (node.Layer.length > 0) {
        node.isGroup = true;
      } else {
        node.isGroup = false;
      }
      for (let i = 0; i < node.Layer.length; i++) {
        if (typeof node.Layer[i] !== 'undefined') {
          this.addFunctionelAttributesForGetCapabilitiesLayer(node.Layer[i], functionelLayer,
            typeof node.code !== 'undefined' ? node.code : node.Abstract, node.service);
        }
      }
    } else {
      node.isGroup = false;
    }
    return;
  }
  changeCheckDomain(domain: TableOfContentDomain) {
    domain.checked = !domain.checked;
    domain.services.forEach(service => {
      service.checked = !domain.checked;
      this.changeCheckService(service);
    });
  }
  changeCheckService(service: TableOfContentServiceObject) {
    service.checked = !service.checked;
    if (typeof service.Layer !== 'undefined') {
      service.Layer.forEach(node => {
        this.changeCheckNode(node, service.checked);
      });
      service.Layer.forEach(node => {
        this.refrechSubNodeallNodesChecks(node);
      });
    }
  }
  changeCheckNode(node: TableOfContentNode, checked: boolean) {
    node.checked = checked;
    if (typeof node.Layer !== 'undefined') {
      node.Layer.forEach(child => {
        this.changeCheckNode(child, checked);
      });
    }
    return;
  }
  refrechserviceByNode(node: TableOfContentNode, service: TableOfContentServiceObject) {
    if (typeof service.layersList === 'undefined') {
      service.layersList = [];
    }
    if (!node.isGroup && node.checked && service.layersList.length === 0) {
      service.layersList.push(node);
    } else {
      if (!node.isGroup) {
        if (node.checked) {
          service.layersList.push(node);
          service.layersList.sort(function (a, b) {
            if (a.zindex < b.zindex) { return -1; }
            if (a.zindex > b.zindex) { return 1; }
            return 0;
          });
        } else {
          for (let i = service.layersList.length - 1; i >= 0; i--) {
            if (service.layersList[i].code === node.code) {
              service.layersList.slice(i, 1);
            }
          }

        }
      }
    }
    if (typeof node.Layer !== 'undefined') {
      node.Layer.forEach(child => {
        this.refrechserviceByNode(child, service);
      });
    }
    return;
  }
  refrechDomainCheck(domain: TableOfContentDomain) {
    let checked = false;
    for (let i = 0; i < domain.services.length; i++) {
      if (domain.services[i].checked) {
        checked = true;
        break;
      }
    }

    domain.checked = checked;

  }
  refrechServiceCheck(service: TableOfContentServiceObject, domain: TableOfContentDomain) {
    let checked = false;
    let nbrChecked = 0;
    if (typeof service.Layer !== 'undefined') {
      for (let i = 0; i < service.Layer.length; i++) {
        if (service.Layer[i].checked) {
          checked = true;
          break;
        }
      }
      for (let i = 0; i < service.Layer.length; i++) {
        if (service.Layer[i].checked) {
          nbrChecked++;
        }
      }
      service.checked = checked;
      if (nbrChecked === service.Layer.length) {
        service.allNodescheck = true;
      } else {
        service.allNodescheck = false;
      }
    }
    this.refrechDomainCheck(domain);
  }
  refrechSubNodeallNodesChecks(node: TableOfContentNode) {
    if (node.isGroup) {
      const nbrNodeChecked = this.getNbrSubNodeActiveForNode(node, 0);
      const nbrAllNode = this.getNbrSubNodeForNode(node, 0);
      if (nbrNodeChecked === nbrAllNode) {
        node.allNodescheck = true;
      } else {
        node.allNodescheck = false;
      }
      if (typeof node.Layer !== 'undefined') {
        node.Layer.forEach(child => {
          this.refrechSubNodeallNodesChecks(child);
        });
      }
      return;

    }
  }
  refrechSubNodeCheck(node: TableOfContentNode) {
    if (node.isGroup) {
      const nbrNodeChecked = this.getNbrSubNodeActiveForNode(node, 0);
      const nbrAllNode = this.getNbrSubNodeForNode(node, 0);
      if (nbrNodeChecked > 0) {
        node.checked = true;
      } else {
        node.checked = false;
      }
      if (nbrNodeChecked === nbrAllNode) {
        node.allNodescheck = true;
      } else {
        node.allNodescheck = false;
      }
      node.Layer.forEach(child => {
        this.refrechSubNodeCheck(child);
      });
    }
    return;
  }

  getParentNode(node: TableOfContentNode, service: TableOfContentServiceObject): TableOfContentNode {
    if (node.parent !== node.service) {
      for (let i = 0; i < service.Layer.length; i++) {
        if (typeof service.Layer !== 'undefined') {
          const nd = this.getNodeByName(service.Layer[i], node.parent);
          if (typeof nd !== 'undefined' && nd !== null) {
            return nd;
          }
        }
      }
    } else {
      return node;
    }
  }
  getNodeByName(node: TableOfContentNode, name: string): TableOfContentNode {
    if (node.code === name) {
      return node;
    }
    if (node.isGroup) {
      for (let i = 0; i < node.Layer.length; i++) {
        const nodeChild = this.getNodeByName(node.Layer[i], name);
        if (nodeChild !== null) { return nodeChild; }
      }
    }
    return null;
  }
  getNbrSubNodeActiveForNode(node: TableOfContentNode, nbr: number): number {
    if (!node.isGroup && node.checked) {
      nbr++;
    }
    if (node.isGroup) {
      node.Layer.forEach(child => {
        nbr = this.getNbrSubNodeActiveForNode(child, nbr);
      });
    }
    return nbr;
  }
  getNbrSubNodeForNode(node: TableOfContentNode, nbr: number): number {
    if (!node.isGroup) {
      nbr++;
    }
    if (node.isGroup) {
      node.Layer.forEach(child => {
        nbr = this.getNbrSubNodeForNode(child, nbr);
      });
    }
    return nbr;
  }
  initLegendCollapse(node: TableOfContentNode) {
    node.collapseLegend = true;
    if (typeof node.Layer !== 'undefined') {
      node.Layer.forEach(child => {
        this.initLegendCollapse(child);
      });
    }
    return;
  }
  refrechNodeVisibilityByResolution(node: TableOfContentNode, resolution: number) {
    if (!node.isGroup) {
      if (resolution > node.MinScaleDenominator && resolution < node.MaxScaleDenominator) {
        node.visible = true;
      } else {
        node.visible = false;
        node.collapseLegend = true;
      }
    } else {
      node.Layer.forEach(child => {
        this.refrechNodeVisibilityByResolution(child, resolution);
      });
    }

    return;
  }
  /**
   * build TDM structur from Services
   */
 /* saveToc(tableOfContent: any, authority: string, contextType: string) {
    const userId = '' + this.authenticationService.jwtToken.currentUser.id;
    let url = API_SAV_COT_SESS_URL;
    const re = /userId/gi;
    url = url.replace(re, userId);
    const headers = new Headers({ 'Authorization': 'Bearer ' + this.authenticationService.jwtToken.token });
    const options = new RequestOptions({ headers: headers });
    const body: any = {
      contextName: tableOfContent.contextName,
      userId: this.authenticationService.jwtToken.currentUser.id,
      contextType: contextType,
      profileId: tableOfContent.profile.id,
      ctxDTO: this.generateContextLayersFromTableOfContent(tableOfContent, false)
    };
    return this.httpService.post(url, body);
  }
  getUserContextsByProfil(authority: string): any {
    const userId = '' + this.authenticationService.jwtToken.currentUser.id;
    let userProfil = this.authenticationService.jwtToken.currentUser.authorities[0]['authority'];
    if (authority !== '') {
      userProfil = authority;
    }
    const re = /userId/gi;
    let url = API_COT_USR_URL;
    url = url.replace(re, userId);
    url += '?profileCode=' + userProfil;
    return this.httpService.get(url);
  }
  getDomainsByContextId(id: any): any {
    const re = /contextId/gi;
    let url = API_COT_DOM_URL;
    url = url.replace(re, id);
    return this.httpService.get(url);
  }
  getServicesByDomainIdAndContextId(domainId: any, contextId: any): any {
    const redomainId = /domainId/gi;
    const recontextId = /contextId/gi;
    let url = API_COT_DOM_SER_URL;
    url = url.replace(redomainId, domainId);
    url = url.replace(recontextId, contextId);
    return this.httpService.get(url);
  }
  getLayersGroupBycontextIdANDMapserviceCode(contextId: any, mapserviceCode: any): any {
    const reContextID = /contextId/gi;
    const reMapserviceCode = /mapserviceCode/gi;
    let url = API_COT_SER_LAG_URL;
    url = url.replace(reContextID, contextId);
    url = url.replace(reMapserviceCode, mapserviceCode);
    return this.httpService.get(url);
  }
  getLayersBycontextIdANDMapserviceCode(contextId: any, mapserviceCode: any): any {
    const reContextID = /contextId/gi;
    const reMapserviceCode = /mapserviceCode/gi;
    let url = API_COT_SER_LAY_URL;
    url = url.replace(reContextID, contextId);
    url = url.replace(reMapserviceCode, mapserviceCode);
    return this.httpService.get(url);
  }*/
  getLayerFromServiceLayer(node: any, allLayers: any[], context_id: number, advanced: boolean) {
    if (advanced) {
      allLayers.push({
        name: node.Name,
        layerId: node.id,
        checked: node.checked,
        collapse: node.collapseIn,
        searchZindex: node.searchZindex,
        code: node.code,
        title: node.title,
        searchLocation: node.searchLocation
      });
    } else {
      allLayers.push({
        layerId: node.id,
        checked: node.checked,
        collapse: node.collapseIn,
        searchZindex: node.searchZindex
      });
    }
    if (typeof node.Layer !== 'undefined') {
      for (let i = 0; i < node.Layer.length; i++) {
        if (typeof node.Layer[i] !== 'undefined') {
          this.getLayerFromServiceLayer(node.Layer[i], allLayers, context_id, advanced);
        }
      }
    }
    return;
  }
  generateContextLayersFromTableOfContent(tableOfContent: any, advanced: boolean): any[] {
    const allLayers: any[] = [];
    const domains = tableOfContent.domains;
    if (domains !== undefined) {
      domains.forEach(domain => {
        const services = domain.services;
        if (services !== undefined) {
          services.forEach(service => {
            if (typeof service.Layer !== 'undefined') {
              service.Layer.forEach(element => {
                this.getLayerFromServiceLayer(element, allLayers, tableOfContent.id, advanced);
              });
            }
          });
        }
      });
    }
    return allLayers;
  }
  checkIfTableOfContentIsChanged(originalTableOfContent: any, currentTableOfContent: any): any {
    const originalTableOfContentLayers: any[] = this.generateContextLayersFromTableOfContent(originalTableOfContent, true);
    const currentTableOfContentLayers: any[] = this.generateContextLayersFromTableOfContent(currentTableOfContent, true);

    for (let ii = 0; ii < originalTableOfContentLayers.length; ii++) {
      for (let i = 0; i < currentTableOfContentLayers.length; i++) {
        if (originalTableOfContentLayers[ii].layerId === currentTableOfContentLayers[i].layerId) {
          if (originalTableOfContentLayers[ii].checked !== currentTableOfContentLayers[i].checked ||
            originalTableOfContentLayers[ii].collapse !== currentTableOfContentLayers[i].collapse) {
            return true;
          }
        }

      }
    }
    return false;
  }
/*
  deleteToc(contextId: any): any {
    const re = /contextId/gi;
    let url = API_DEL_COT_URL;
    url = url.replace(re, contextId);
    return this.httpService.delete(url);
  }

  updateTocName(contextId: any, contextName: any): any {
    const reContextId = /contextId/gi;
    const reContextName = /contextName/gi;
    let url = API_UPD_COT_URL;
    url = url.replace(reContextId, contextId);
    url = url.replace(reContextName, contextName);
    return this.httpService.get(url);
  }
*/
  addToOldTocList(tableOfContent: any, endloding: boolean): any {
    const toc = this.allOldtableOfContent.find(element => element.id === Number.parseInt(tableOfContent.id));
    if (typeof toc === 'undefined') {
      const tableString: string = JSON.stringify(tableOfContent);
      const oldtableOfContent = JSON.parse(tableString);
      this.allOldtableOfContent.push(oldtableOfContent);
    } else {
      if (toc.contextType === 'standard' && endloding) {
        const tableString: string = JSON.stringify(tableOfContent);
        const oldtableOfContent = JSON.parse(tableString);
        this.allOldtableOfContent = this.allOldtableOfContent.filter(e => toc.contextType !== 'standard');
        this.allOldtableOfContent.push(oldtableOfContent);
      }
    }
  }

}
