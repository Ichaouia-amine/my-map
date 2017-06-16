import { TableOfContentServiceObject } from './TableOfContentService';
export interface TableOfContentDomain {
  code: string;
   title: string;
   checked: boolean;
   active: boolean;
   services: TableOfContentServiceObject [];
}
