import { Injectable } from '@angular/core';
import { Overlay } from "app/model/appShell/overlay";


@Injectable()
export class OverlayService {


    public overlayList: Overlay[];
    // public minimizedOverlayList: Overlay[] = [];

    constructor() {
        this.overlayList = [{
            name: 'search',
            active: false,
            hasMapVisible: false,
            isMinimizable: true,
            isMinimized: false,
            mobileReady: true,
            iconClass: 'icon-search',
            title: 'Rechercher / Localiser'
        }, {
            name: 'toc',
            active: false,
            hasMapVisible: true,
            isMinimizable: false,
            isMinimized: false,
            mobileReady: true,
            iconClass: 'icon-table-matieres',
            title: 'Table des matières'
        }, {
            name: 'fdp',
            active: false,
            hasMapVisible: true,
            isMinimizable: false,
            isMinimized: false,
            mobileReady: true,
            iconClass: 'icon-fonds-cartes',
            title: 'Fonds de cartes'
        }, {
            name: 'account',
            active: false,
            hasMapVisible: false,
            isMinimizable: false,
            isMinimized: false,
            mobileReady: true,
            iconClass: 'icon-user',
            title: 'Mon compte'
        }]; // init 9bal
        /*this.overlayList.push(
                );*/
    }

    public toggleOverlay(name: string): void {
        if (this.isOvertlaySelected(name)) {
            this.getActiveOverlay().active = false;
        } else if (this.getOverlay(name).isMinimized) {
            this.closeActiveOverlay();
            this.getOverlay(name).active = true;
            this.getOverlay(name).isMinimized = false;
        } else {
            this.closeActiveOverlay();
            this.overlayList.find(overlay => overlay.name === name).active = true;
        }
    }

    public closeOverlay(name: string): void {
        const toverlay = this.overlayList.find(overlay => overlay.name === name);
        toverlay.active = false;
        toverlay.isMinimized = false;
    }

    public closeActiveOverlay(): void {
        if (this.isOverlayOpen()) { this.getActiveOverlay().active = false; }
    }

    public minimizeActiveOverlay(): void {
        if (this.isOverlayOpen() && this.getActiveOverlay().isMinimizable) {
            this.getActiveOverlay().isMinimized = true;
            // this.minimizedOverlayList.push(this.getActiveOverlay());
            this.getActiveOverlay().active = false;
        }
    }

    public isOvertlaySelected(name: string) {
        return this.getOverlay(name).active;
    }

    public isOvertlayMinimized(name: string) {
        return this.getOverlay(name).isMinimized;
    }
    public getOverlay(name: string): Overlay {
        return this.overlayList.find(c => c.name === name);
    }
    public getActiveOverlay(): Overlay {
        return this.overlayList.find(overlay => overlay.active === true);
    }

    public isOverlayOpen() {
        return this.getActiveOverlay() !== undefined;
    }

    public isOverlayInitialized(name: string): boolean {
        return (this.getOverlay(name).active || this.isOvertlayMinimized(name));
    }

    public getMinimizedOverlays(): Overlay[] {
        return this.overlayList.filter(overlay => overlay.isMinimized === true);
    }

    public hasMinimizedOverlays(): boolean {
        // console.log('ljkshlljkfslkdqgjjlgsdjnk');
        // console.log(this.getMinimizedOverlays().length);
        return this.getMinimizedOverlays().length > 0; // this.getMinimizedOverlays !== undefined;
    }


}
