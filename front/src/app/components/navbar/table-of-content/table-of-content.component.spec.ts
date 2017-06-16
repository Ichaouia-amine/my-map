/* tslint:disable:no-unused-variable */
import { } from 'jasmine';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { TreeViewComponent } from './tree-view/tree-view.component';
import { TocControllerComponent } from './toc-controller.component';
import { MaterialModule } from '@angular/material';
import { MdSliderModule } from '@angular/material';
import { CollapseModule } from 'ng2-bootstrap';
import { MapControllerService } from '../../../services/mapController/map-controller.service';
import { MapService } from '../../../services/map/map.service';
import { LayerService } from '../../../services/layer/layer.service';
import { ScaleService } from '../../../services/mapController/scale/scale.service';
import { ConfigurationService } from '../../../services/configuration/configuration.service';
import { LocationService } from '../../../services/mapController/map-location/location.service';
import { TocControllerService } from '../../../services/mapController/toc-controller/toc-controller.service';
import { toc } from '../../../shared/mockTOC';
class MapControllerServiceSpy {
        tableOfContent = toc.tdms[0];
        _alltableOfContent = toc.tdms;
       currentTableOfContentDtoSubject: Subject<any> = new Subject<any>();
  // testHero = new Hero(42, 'Test Hero');

  currentTableOfContent = jasmine.createSpy('currentTableOfContent').and.callFake(
    () => Promise
      .resolve(true)
      .then(() => {
          this.currentTableOfContentDtoSubject.next(toc.tdms[0]);
          Object.assign({}, this.currentTableOfContentDtoSubject.asObservable());
      } )
  );
/*
  saveHero = jasmine.createSpy('saveHero').and.callFake(
    (hero: Hero) => Promise
      .resolve(true)
      .then(() => Object.assign(this.testHero, hero))
  );*/
}
/*
describe('TocControllerComponent', () => {
  let component: TocControllerComponent;
  let fixture: ComponentFixture<TocControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TocControllerComponent, TreeViewComponent],
      imports: [MaterialModule, MdSliderModule, CollapseModule],
      providers: [ MapService, LayerService, ScaleService,
        ConfigurationService, LocationService, TocControllerService]
    })
    .overrideComponent(TocControllerComponent, {
      set: {
        providers: [
          { provide: MapControllerService, useClass: MapControllerServiceSpy }
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TocControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', inject([MapControllerService], (service: MapControllerService) => {
    service.tableOfContent = toc.tdms[0];
    service._alltableOfContent = toc.tdms;
    expect(component).toBeTruthy();
  }));
});*/
