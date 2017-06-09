import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map/map.component';
import { ContainerComponent } from './components/container/container.component';
import { LoadingComponent } from "app/components/loading/loading.component";
import { MapToolsComponent } from './components/map-tools/map-tools.component';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    ContainerComponent,
    LoadingComponent,
    MapToolsComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
