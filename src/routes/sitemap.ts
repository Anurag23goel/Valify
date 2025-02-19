// import paths from 'routes/paths';

export interface SubMenuItem {
  name: string;
  pathName: string;
  path: string;
  icon?: string;
  active?: boolean;
  items?: SubMenuItem[];
  activeLink?: string; // New property
  onActiveLinkChange?: (subheader: string) => void; // New property
}

export interface MenuItem {
  id: string;
  subheader: string;
  path?: string;
  icon?: string;
  avatar?: string;
  active?: boolean;
  items?: SubMenuItem[];
}

const sitemap: MenuItem[] = [
  {
    id: 'dashboard',
    subheader: 'Dashboard',
    path: '/',
    icon: 'fluent:grid-20-regular',
    active: true,
  },
  {
    id: 'projects',
    subheader: 'My Projects',
    path: '#myprojects',
    icon: 'fluent:folder-open-20-regular',
    active: true,
  },
];

export default sitemap;
