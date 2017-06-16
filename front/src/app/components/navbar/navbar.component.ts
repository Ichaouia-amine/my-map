import { Component, OnInit } from '@angular/core';
import { ScreenWidthService } from '../../services/screenWidth/screen-width.service';


import { OverlayService } from '../../services/appShell/nav/overlays';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public isCollapsed = true;
  public bergerClick = false;
  constructor(private sc: ScreenWidthService,
    private overlayService: OverlayService) {
  }

  ngOnInit() {
    this.sc.isMobile().subscribe((element: boolean) => {
      this.isCollapsed = element;
    });
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.bergerClick = !this.isCollapsed;
  }

  toggleOverlay(name: string) {
    this.toggleCollapse();
    this.overlayService.toggleOverlay(name);
  }

  public logout() {
    this.toggleCollapse();
  }

 public users() {
    this.toggleCollapse();
  }
  public isOverlayActive(name: string): boolean {
      return this.overlayService.isOvertlaySelected(name);
  }

}
