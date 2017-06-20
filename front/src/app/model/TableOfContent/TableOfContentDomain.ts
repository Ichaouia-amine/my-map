import { TableOfContentServiceObject } from './TableOfContentService';
export interface TableOfContentDomain {
  name: string;
   title: string;
   checked: boolean;
   active: boolean;
   services: TableOfContentServiceObject [];
}
