import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { Http ,HttpModule} from '@angular/http';
import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { ContainerComponent } from './components/container/container.component';
import { LoadingComponent } from "app/components/loading/loading.component";
import { MapToolsComponent } from './components/map-tools/map-tools.component';
import {TranslateModule,TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { SettingsService } from "app/services/settings/settings.service";
import { HttpService } from "app/services/httpService/http.service";
import { MapToolsService } from "app/services/map-tools/map-tools.service";
import { MapOpenlayersService } from "app/services/map-openlayers/map-openlayers.service";
import { LayerOpenlayersService } from "app/services/layer-openlayers/layer-openlayers.service";
export function HttpLoaderFactory(http: Http) {
     return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ContainerComponent,
    LoadingComponent,
    MapToolsComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [Http]
            }
        })
  ],
  providers: [SettingsService,HttpService,MapToolsService, MapOpenlayersService,LayerOpenlayersService],
  bootstrap: [AppComponent]
})
export class AppModule { }
