import { TableOfContentDomain } from './TableOfContentDomain';
export interface TableOfContent {
    name: string;
    title: string;
    active: boolean;
    type?: string;
    domains: TableOfContentDomain[];
    id?: string;
}
