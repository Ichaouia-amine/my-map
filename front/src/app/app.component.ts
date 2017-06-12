import { Component, OnInit } from '@angular/core';
import {TranslateService} from  '@ngx-translate/core';
import { SettingsService } from "app/services/settings/settings.service";
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  constructor (private translateService: TranslateService, private settingsService: SettingsService) {
   // this language will be used as a fallback when a translation isn't found in the current language
        translateService.setDefaultLang('en');

         // the lang to use, if the lang isn't available, it will use the current loader to get them
        translateService.use('fr');
  }
  ngOnInit(){
this.settingsService.intnitApp();
  }
}
