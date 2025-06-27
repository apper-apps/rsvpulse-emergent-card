import Lists from '@/components/pages/Lists';
import Broadcast from '@/components/pages/Broadcast';
import Reports from '@/components/pages/Reports';

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
  }
};

export const routeArray = Object.values(routes);
export default routes;