import { TestBed, inject } from '@angular/core/testing';

import { MapToolsService } from './map-tools.service';

describe('MapToolsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapToolsService]
    });
  });

  it('should be created', inject([MapToolsService], (service: MapToolsService) => {
    expect(service).toBeTruthy();
  }));
});
