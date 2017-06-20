import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import { TableOfContentServiceObject } from 'app/model/TableOfContent/TableOfContentService';
import { TableOfContentDomain } from 'app/model/TableOfContent/TableOfContentDomain';
import { TableOfContentNode } from 'app/model/TableOfContent/TableOfContentNode';
import { TableOfContentService } from 'app/services/table-of-content/table-of-content.service';
import { MapToolsService } from 'app/services/map-tools/map-tools.service';

@Component({
  selector: 'app-table-of-content',
  templateUrl: './table-of-content.component.html',
  styleUrls: ['./table-of-content.component.css']
})
export class TableOfContentComponent implements OnInit {
  public tableOfContent: any = [];
  public oldtableOfContent: any;
  private alltableOfContent: any[] = [];
  private allfavoriteTableOfContent: any[] = [];
  private nbrEmptyFavoriteTableOfContent: any[] = [];
  public collapseItem: string;
  public isCollapseToc = false;
  public isCollapseConfig = true;
  public isCollapseCrud = true;
  public isCollapseSlider = true;
  private listLength = '';
  public isChangedToc: boolean;
  private ischagedTocExecution: boolean;
  private currentDomainCode: string;
   public currentServiceForSlider: TableOfContentServiceObject = null;
  public crudAction: string;
  public currentCrudTOC: any;
  public tocToEdit: any;
  public testExistNameBool: boolean;
  public confirmSave: boolean;
  public isAddToc: boolean;
  public isTocSaved: boolean;
  private currentProfile: string;
  constructor(private mapToolsService: MapToolsService, private tableOfContentService: TableOfContentService) {
    this.currentDomainCode = '';
    this.currentProfile = '';
    this.collapseItem = 'TOC';
    this.crudAction = '';
    this.testExistNameBool = true;
    this.confirmSave = false;
    this.isAddToc = false;
    this.isTocSaved = false;
  }

  ngOnInit() {
   this.ischagedTocExecution = false;
    this.tableOfContent = this.mapToolsService._currentTableOfContent;
    this.mapToolsService.initContext();
    this.tableOfContentService.addToOldTocList(this.tableOfContent, false);
    this.alltableOfContent = this.mapToolsService._allTablesOfContent;
    this.allfavoriteTableOfContent = this.alltableOfContent
    .filter(element => element.type !== 'session' && element.type !== 'standard');
    this.setNbrOfEmptyToc();
    this.mapToolsService.currentTableOfContent().subscribe((element: any) => {
      this.tableOfContent = element;
      if (!this.ischagedTocExecution) {
        this.mapToolsService.initContext();
        this.tableOfContentService.addToOldTocList(this.tableOfContent, false);
      }
      this.mapToolsService.refrechTableOfContent(this.currentDomainCode);
    });
    this.mapToolsService.currentScale().subscribe((e: any) => {
      if (typeof this.tableOfContent !== 'undefined') {
        this.mapToolsService.refrechVisibilityByResolution(this.tableOfContent, e.currentScale.scale);
      }
    });
    this.isChangedToc = this.mapToolsService._isChangedToc;
    this.mapToolsService.isChangedToc().subscribe(element => {
      this.isChangedToc = element;
      console.log(element);
    });
    this.mapToolsService.allTablesOfContent().subscribe((element: any) => {
      this.alltableOfContent = element;
      this.allfavoriteTableOfContent = this.alltableOfContent
      .filter(el => el.contextType !== 'session' && el.contextType !== 'standard');
      this.setNbrOfEmptyToc();
    });
    this.sortAllTableOfContentByName();
  }
  setTableofContent(value) {
    this.tableOfContent = value;
  }
  setAllTableofContent(value) {
    this.alltableOfContent = value;
  }
  initService(service: TableOfContentServiceObject) {
    this.mapToolsService.refrechService(service);
    service.Layer.forEach(element => {
      this.mapToolsService.initLegendCollapse(element);
    });
  }
  changedomain(domainName: string, domains: TableOfContentDomain[]) {
    domains.forEach(d => {
      if (d.name === domainName) {
        d.active = true;
        this.currentDomainCode = domainName;
        this.mapToolsService.currentDomainCode = domainName;
      } else {
        d.active = false;
      }
    });
  }
  collapse(item: any) {
    item.collapseIn = !item.collapseIn;
  }
  checkDomain(domain: TableOfContentDomain) {
    this.mapToolsService.changeCheckDomain(domain, this.tableOfContent);
    domain.services.forEach(service => {
      this.mapToolsService.refrechService(service);
    });
  }
  checkService(service: TableOfContentServiceObject, domain: TableOfContentDomain) {
    this.mapToolsService.changeCheckService(service, this.tableOfContent);
    this.mapToolsService.refrechService(service);
    this.mapToolsService.refrechDomainCheck(domain);

  }
  checkNode(node: TableOfContentNode, checked: boolean, service: TableOfContentServiceObject, domain: TableOfContentDomain) {
    this.mapToolsService.changeCheckNode(node, checked, this.tableOfContent);
    this.mapToolsService.refrechService(service);
    this.mapToolsService.refrechServiceCheck(service, domain);
    // this.mapToolsService.refrechSubNodeCheck(this.mapToolsService.getParentNode(node,service));
  }
  collapseSlider(service: TableOfContentServiceObject) {
    this.currentServiceForSlider = service;
    this.switchCollapse('SLIDER');
  }
  disableCollapseSlider() {
    this.isCollapseSlider = true;
  }
  chageOpacity(event) {
    this.currentServiceForSlider.opacity = event.value;
    this.mapToolsService.setServiceOpacity(this.currentServiceForSlider, 'tableOfContent_layers');

  }
  getWidth(length) {
    return length * 100;
  }
  refreshToc() {
    this.ischagedTocExecution = true;
    // this.mapToolsService.refreshToc(this.tableOfContentService.allOldtableOfContent);
  }

  switchCollapse(value: string) {
    this.isTocSaved = false;
    switch (value) {
      case 'SLIDER': {
        this.collapseItem = 'SLIDER';
        this.isCollapseToc = true;
        this.isCollapseConfig = true;
        this.isCollapseSlider = false;
        this.isCollapseCrud = true;
        break;
      }
      case 'CONFIG': {
        this.collapseItem = 'CONFIG';
        this.isCollapseToc = true;
        this.isCollapseConfig = false;
        this.isCollapseSlider = true;
        this.isCollapseCrud = true;
        break;
      }
      case 'CRUD': {
        this.collapseItem = 'CRUD';
        this.isCollapseToc = true;
        this.isCollapseConfig = true;
        this.isCollapseSlider = true;
        this.isCollapseCrud = false;
        break;
      }
      default: {
        this.collapseItem = 'TOC';
        this.isCollapseToc = false;
        this.isCollapseConfig = true;
        this.isCollapseSlider = true;
        this.isCollapseCrud = true;
      }

    }
  }

  addNewFavoriteToc() {
    this.switchCollapse('CRUD');
  }

  manage(action, item) {
    this.switchCollapse('CRUD');
    this.testExistNameBool = true;
    switch (action) {
      case 'SAVE': {
        this.crudAction = 'SAVE';
        break;
      }
      case 'EDIT': {
        this.crudAction = 'EDIT';
        this.currentCrudTOC = item;
        this.tocToEdit = '';
        break;
      }
      case 'DELETE': {
        this.crudAction = 'DELETE';
        this.currentCrudTOC = item;
        break;
      }
      default: {
        this.crudAction = 'ADD';
        this.currentCrudTOC = JSON.parse(JSON.stringify(this.tableOfContent));
        this.currentCrudTOC.contextName = '';
        this.currentCrudTOC.contextType = 'favorite';
      }

    }
  }
/*
  createFavorite() {
    this.mapToolsService.endLoadingShowSubject.next(false);
    this.mapToolsService.saveToc(this.currentCrudTOC, 'favorite').subscribe(res => {
      console.log(res);
      this.currentCrudTOC.id = res[0].id.contextId;
      this.alltableOfContent.push(this.currentCrudTOC);
      this.tableOfContent = this.currentCrudTOC;
      this.mapToolsService.currentTableOfContentDtoSubject.next(this.tableOfContent);
      this.mapToolsService.allTableOfContentDtoSubject.next(this.alltableOfContent);
      this.alltableOfContent.forEach(element => { element.active = false });
      this.tableOfContent.active = true;
      this.allfavoriteTableOfContent = this.alltableOfContent.
      filter(element => element.contextType !== 'session' && element.contextType !== 'standard');
      this.setNbrOfEmptyToc();
      this.mapToolsService.endLoadingShowSubject.next(true);
      this.switchCollapse('CONFIG');
      this.isTocSaved = true;
      this.sortAllTableOfContentByName();
      // this.tableOfContentService.addToOldTocList(this.tableOfContent, false);
    });

  }*/
  onChangeTocList(value) {
    this.isChangedToc = false;
    const toc = this.tableOfContentService.allOldtableOfContent.find(element => element.id === Number.parseInt(value));
    if (toc) {
      const tableString: string = JSON.stringify(toc);
      this.tableOfContent = JSON.parse(tableString);
    }else {
      this.tableOfContent = this.alltableOfContent.find(element => element.id === Number.parseInt(value));
    }
    if (this.tableOfContent.contextType !== 'session' && this.tableOfContent.contextType !== 'standard') {
      this.currentCrudTOC = this.allfavoriteTableOfContent.find(element => element.id === Number.parseInt(value));
      this.allfavoriteTableOfContent.forEach(element => { element.active = false });
      this.currentCrudTOC.active = true;
    }else {
      this.allfavoriteTableOfContent.forEach(element => { element.active = false });
      this.alltableOfContent.forEach(element => {
        if (element.contextType === 'standard') {
          element.active = true;
        }
      });
    }

    this.mapToolsService.currentTableOfContentListener.next(this.tableOfContent);
    const index = this.alltableOfContent.findIndex(element => element.id === Number.parseInt(this.tableOfContent.id));
    if (index >= 0) {
      this.isAddToc = true;
    }
    // remplir le tableau des old tocs
    this.tableOfContentService.addToOldTocList(this.tableOfContent, false);
  }
/*
  saveFavorite() {
    const tocCopy = JSON.parse(JSON.stringify(this.tableOfContent));
    tocCopy.contextName = this.currentCrudTOC.contextName;
    tocCopy.contextType = this.currentCrudTOC.contextType;
    tocCopy.id = this.currentCrudTOC.id;
    tocCopy.contextType = this.currentCrudTOC.contextType;
    this.mapToolsService.endLoadingShowSubject.next(false);
    this.mapToolsService.saveToc(tocCopy, 'favorite').subscribe(element => {
      this.tableOfContent = JSON.parse(JSON.stringify(tocCopy));
      this.alltableOfContent.forEach(el => {
        if (el.contextName === tocCopy.contextName) {
          el = this.tableOfContent;
        }
      });
      this.alltableOfContent.forEach(ele => { ele.active = false });
      this.tableOfContent.active = true;
      this.mapToolsService.public.next(this.tableOfContent);
      this.mapToolsService.allTableOfContentDtoSubject.next(this.alltableOfContent);
      this.mapToolsService.endLoadingShowSubject.next(true);
      this.allfavoriteTableOfContent.forEach(ele => { element.active = false });
      this.currentCrudTOC.active = true;
      this.switchCollapse('CONFIG');
      this.isTocSaved = true;
      this.setNbrOfEmptyToc();
      this.tableOfContentService.allOldtableOfContent =
      this.tableOfContentService.allOldtableOfContent.filter(e => e.contextType !== this.tableOfContent.contextType);
      this.tableOfContentService.addToOldTocList(this.tableOfContent, false);
      this.isChangedToc = false;
    });


  }
*/
  editFavorite() {
/*
    this.mapToolsService.endLoadingShowSubject.next(false);
    this.tableOfContentService.updateTocName(this.currentCrudTOC.id, this.tocToEdit).subscribe(element => {
      this.currentCrudTOC.contextName = this.tocToEdit;
      this.sortAllTableOfContentByName();
      this.mapToolsService.endLoadingShowSubject.next(true);
      this.switchCollapse('CONFIG');
      this.tableOfContentService.allOldtableOfContent =
      this.tableOfContentService.allOldtableOfContent.filter(e => e.contextType !== this.currentCrudTOC.contextType);
      this.tableOfContentService.addToOldTocList(this.currentCrudTOC, false);
    });*/
  }
  deleteFavorite() {
    /* this.mapToolsService.endLoadingShowSubject.next(false);
    this.tableOfContentService.deleteToc(this.currentCrudTOC.id).subscribe(element => {

      this.alltableOfContent = this.alltableOfContent.filter(element => element.id !== this.currentCrudTOC.id);
      this.allfavoriteTableOfContent = this.alltableOfContent.filter(
        element => element.contextType !== 'session' && element.contextType !== 'standard');
      this.tableOfContentService.allOldtableOfContent = this.tableOfContentService
      .allOldtableOfContent.filter(element => element.id !== this.currentCrudTOC.id);
      this.mapToolsService._alltableOfContent =  this.mapToolsService
      ._alltableOfContent.filter(element => element.id !== this.currentCrudTOC.id);
      this.setNbrOfEmptyToc();

      this.mapToolsService.endLoadingShowSubject.next(true);
      this.switchCollapse('CONFIG');
      if (this.currentCrudTOC.id === this.tableOfContent.id) {
        const tocId = this.alltableOfContent.find(element => element.contextType === 'standard').id;
        this.onChangeTocList(tocId);
      }
    });*/
  }
  testExistName() {
    if (this.currentCrudTOC.contextName.length >= 20) {
      this.currentCrudTOC.contextName = this.currentCrudTOC.contextName.substr(0, 20);
    }
    const exist = this.alltableOfContent.find(element =>
    (<string>element.contextName).toUpperCase() === (<string>this.currentCrudTOC.contextName).toUpperCase());
    if (typeof exist === 'undefined') {
      this.testExistNameBool = true;
    } else {
      this.testExistNameBool = false;
    }
  }

  testExistNameEdit() {
    const lengthName = this.tocToEdit.length;
    const exist = this.alltableOfContent.find(element => (<string>element.contextName).toUpperCase() === this.tocToEdit.toUpperCase());
    if (this.tocToEdit.length >= 20) {
      this.tocToEdit = this.tocToEdit.substr(0, 20);
    }
    if (typeof exist === 'undefined') {
      this.testExistNameBool = true;
    } else {
      this.testExistNameBool = false;
    }
  }
  confirmSaveToc(item) {
    this.manage('SAVE', null);
    this.currentCrudTOC = item;
    this.confirmSave = false;
  }

  setNbrOfEmptyToc() {
    this.nbrEmptyFavoriteTableOfContent = [];
    for (let i = 0; i < (3 - this.allfavoriteTableOfContent.length); i++) {
      this.nbrEmptyFavoriteTableOfContent.push('+');
    }
  }
  sortAllTableOfContentByName() {
    this.alltableOfContent.sort((a: any, b: any) => {
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }
}
