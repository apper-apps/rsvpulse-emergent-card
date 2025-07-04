import Lists from '@/components/pages/Lists';
import Broadcast from '@/components/pages/Broadcast';
import Templates from '@/components/pages/Templates';
import Reports from '@/components/pages/Reports';
import DeletedContacts from '@/components/pages/DeletedContacts';
import Settings from '@/components/pages/Settings';
export const routes = {
  lists: {
    id: 'lists',
    label: 'Lists',
    path: '/lists',
    icon: 'Users',
    component: Lists
},
  broadcast: {
    id: 'broadcast',
    label: 'Broadcast',
    path: '/broadcast',
    icon: 'Send',
    component: Broadcast
  },
  templates: {
    id: 'templates',
    label: 'Templates',
    path: '/templates',
    icon: 'FileText',
    component: Templates
  },
reports: {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: 'BarChart3',
    component: Reports
  },
deleted: {
    id: 'deleted',
    label: 'Deleted',
    path: '/deleted',
    icon: 'Trash2',
    component: DeletedContacts
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: 'Settings',
    component: Settings
  }
};

export const routeArray = Object.values(routes);
export default routes;