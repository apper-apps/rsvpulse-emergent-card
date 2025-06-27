import Lists from '@/components/pages/Lists';
import Broadcast from '@/components/pages/Broadcast';
import Reports from '@/components/pages/Reports';
import DeletedContacts from '@/components/pages/DeletedContacts';
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
  }
};

export const routeArray = Object.values(routes);
export default routes;