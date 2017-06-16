/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ScreenWidthService } from './screen-width.service';

describe('Service: ScreenWidth', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScreenWidthService]
    });
  });
   it('should detect mobile', inject([ScreenWidthService], (service: ScreenWidthService) => {
    expect(service).toBeTruthy();
    service.setInnerWidth(200);
    service.testMobile();
    expect(service.isMobileValue).toBe(true);
  }));
   it('should not detect mobile', inject([ScreenWidthService], (service: ScreenWidthService) => {
    expect(service).toBeTruthy();
    service.setInnerWidth(800);
    service.testMobile();
    expect(service.isMobileValue).toBe(false);
  }));
  it('should not detect mobile', inject([ScreenWidthService], (service: ScreenWidthService) => {
    expect(service).toBeTruthy();
    service.setInnerWidth(767);
    service.testMobile();
    expect(service.isMobileValue).toBe(false);
  }));
});
