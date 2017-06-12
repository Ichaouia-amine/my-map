import { Component, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { MapToolsService } from "app/services/map-tools/map-tools.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  public mapElementRef: ElementRef;
  constructor(private mapToolsService:MapToolsService) { 
    
  }

  ngOnInit() {
    
    //this.mapToolsService.innitMap(this.mapElementRef);
  }
  ngAfterViewInit() {
    this.mapToolsService.mainMap().subscribe( e => {
      console.log(this.mapElementRef);
      
      //this.mapToolsService.setMapTarget(this.mapElementRef);
    })
  }

}
