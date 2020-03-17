var routes = ['profile', 'settings'];

var routeMap = {};

for (var i = 0; i < routes.length; i++) {
  var route = routes[i];
  routeMap[route] = [{ pattern: '/', 'view': route.charAt(0).toUpperCase() + route.slice(1) }]
}

routeMap['dashboard'] = [
  { 'pattern': '/', 'view': 'Dashboard' }
];

routeMap['users'] = [
  { 'pattern': '/', 'view': 'Users' },
  { 'pattern': '/(\\d+)/?([^/]*)?/?([^/]*)?/?$', 'view': 'Users', 'type': 'regex' },
  { 'pattern': '/view/(\\d+)$', 'view': 'ViewUser', 'type': 'regex' },
  { 'pattern': '/add', 'view': 'AddUser' }
];


export default routeMap;
