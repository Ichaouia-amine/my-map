import { AuthenticationService } from './../../../../services/guards/authentication.service';
/* tslint:disable:no-unused-variable */
import {} from 'jasmine';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { TreeViewComponent } from './tree-view.component';
import { MaterialModule } from '@angular/material';
import { MdSliderModule } from '@angular/material';
import { CollapseModule } from 'ng2-bootstrap';
import { MapControllerService } from '../../../../services/mapController/map-controller.service';
import { MapService } from '../../../../services/map/map.service';
import { LayerService } from '../../../../services/layer/layer.service';
import { ScaleService } from '../../../../services/mapController/scale/scale.service';
import { ConfigurationService } from '../../../../services/configuration/configuration.service';
import { LocationService } from '../../../../services/mapController/map-location/location.service';
import { TocControllerService } from '../../../../services/mapController/toc-controller/toc-controller.service';
/*describe('TreeViewComponent', () => {
  let component: TreeViewComponent;
  let fixture: ComponentFixture<TreeViewComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TreeViewComponent],
       imports: [MaterialModule, MdSliderModule, CollapseModule  ],
       providers: [MapControllerService, MapService, LayerService, ScaleService,
        ConfigurationService, LocationService, TocControllerService, AuthenticationService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});*/
