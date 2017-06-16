import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

  constructor() { }
isDefined(value: any) {
        if (typeof value !== 'undefined') {
            return true;
        }

        return false;
    }
}
