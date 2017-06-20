import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Http, HttpModule } from '@angular/http';
import { CollapseModule } from 'ngx-bootstrap';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { ContainerComponent } from './components/container/container.component';
import { LoadingComponent } from 'app/components/loading/loading.component';
import { MapToolsComponent } from './components/map-tools/map-tools.component';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SettingsService } from 'app/services/settings/settings.service';
import { HttpService } from 'app/services/httpService/http.service';
import { MapToolsService } from 'app/services/map-tools/map-tools.service';
import { MapOpenlayersService } from 'app/services/map-openlayers/map-openlayers.service';
import { LayerOpenlayersService } from 'app/services/layer-openlayers/layer-openlayers.service';
import { ScreenWidthService } from 'app/services/screenWidth/screen-width.service';
import { AppShellService } from 'app/services/appShell/appShell-Service';
import { NavbarComponent } from 'app/components/navbar/navbar.component';
import { OverlayService } from 'app/services/appShell/nav/overlays';
import { UtilsService } from 'app/services/utils/utils.service';
import { TableOfContentService } from 'app/services/table-of-content/table-of-content.service';
import { TableOfContentComponent } from './components/navbar/table-of-content/table-of-content.component';
import { TreeViewComponent } from './components/navbar/table-of-content/tree-view/tree-view.component';
import { LocationService } from 'app/services/map-location/location.service';
import { ScaleService } from 'app/services/scale/scale.service';
export function HttpLoaderFactory(http: Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ContainerComponent,
    LoadingComponent,
    MapToolsComponent,
    NavbarComponent,
    TableOfContentComponent,
    TreeViewComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    CollapseModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })
  ],
  providers: [OverlayService, SettingsService, HttpService, AppShellService,
    ScreenWidthService, MapToolsService, MapOpenlayersService, LayerOpenlayersService,
    UtilsService, TableOfContentService, LocationService, ScaleService],
  bootstrap: [AppComponent]
})
export class AppModule { }
