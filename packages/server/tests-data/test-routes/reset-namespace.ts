import Route from '../../lib/route';

const route = Route.createRoute('get', '/reset-namespace');
route.namespace = '';

export default route;
