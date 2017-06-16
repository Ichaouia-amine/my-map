import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
@Injectable()
export class ScreenWidthService {

    private innerWidth: number;
    private MEDIAMOBILE = 767;
    public isMobileValue: boolean;
    private _isMobile: Subject<boolean> = new Subject<boolean>();
    constructor() {
        this._isMobile.next(false);
        this.innerWidth = window.innerWidth;
        this.testMobile();

        window.onresize = () => {
            this.innerWidth = this.getWindow();
            this.testMobile();
        };
    }

    public isMobile(): Observable<boolean> {
    return this._isMobile.asObservable();
  }
    public getInnerWidth() {
        return this.innerWidth;
    }
    public setInnerWidth(innerWidth: number) {
        this.innerWidth = innerWidth;
    }
    public getWindow() {
        return window.innerWidth;
    }
    public testMobile() {
        let isMobile = false;
        if (this.MEDIAMOBILE <= this.innerWidth) {
            this._isMobile.next(false);
            isMobile = false;
        } else {
            this._isMobile.next(true);
            isMobile = true;
        }
        this.isMobileValue = isMobile;
    }

}
