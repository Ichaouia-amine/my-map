import { Component, OnInit } from '@angular/core';
import { OverlayService } from 'app/services/appShell/nav/overlays';

@Component({
  selector: 'app-container',
  templateUrl: './container.component.html',
  styleUrls: ['./container.component.css']
})
export class ContainerComponent implements OnInit {

  constructor(private overlayService: OverlayService) { }

 public getOverlayTitle(): String {
    if (this.overlayService.isOverlayOpen()) {return this.overlayService.getActiveOverlay().title; } else { return ''; }
  }

  ngOnInit() {
  }

  public isCollapsed(): Boolean  {
    // return !this.overlayService.isVisible;
    return !this.overlayService.isOverlayOpen();
  }

  public overlayMinimized(name: string): boolean {
    return this.overlayService.isOvertlayMinimized(name);
  }

  public overlayInitialized(name: string): boolean {
    return this.overlayService.isOverlayInitialized(name);
  }

  public isMapVisible(): Boolean  {
    return this.overlayService.isOverlayOpen() ? this.overlayService.getActiveOverlay().hasMapVisible : false;
  }

  public isMinimizable(): Boolean  {
    return this.overlayService.isOverlayOpen() ? this.overlayService.getActiveOverlay().isMinimizable : false;
  }

  public closeOverlay(): void  {
    // this.overlayService.hideOverlay();
    this.overlayService.closeActiveOverlay();
  }
  public minimizeActiveOverlay(): void  {
    // this.overlayService.hideOverlay();
    this.overlayService.minimizeActiveOverlay();

  }
  public isFirstLoad(name: string) {
        return this.overlayService.isFirstLoad(name);
    }
}
