var routes = ['profile', 'settings'];

var routeMap = {};

for (var i = 0; i < routes.length; i++) {
  var route = routes[i];
  routeMap[route] = [{ pattern: '/', 'view': route.charAt(0).toUpperCase() + route.slice(1) }]
}

routeMap['dashboard'] = [
  { 'pattern': '/', 'view': 'Dashboard' }
];

routeMap['search'] = [
  { 'pattern': '/', 'view': 'Search' }
];

routeMap['prescriptions'] = [
  { 'pattern': '/', 'view': 'Prescriptions' }
];

routeMap['users'] = [
  { 'pattern': '/', 'view': 'Users' },
  { 'pattern': '/(\\d+)/?([^/]*)?/?([^/]*)?/?$', 'view': 'Users', 'type': 'regex' },
  { 'pattern': '/view/(\\d+)$', 'view': 'ViewUser', 'type': 'regex' },
  { 'pattern': '/add', 'view': 'AddUser' }
];

routeMap['remedies'] = [
  { 'pattern': '/', 'view': 'Remedies' },
  { 'pattern': '/(\\d+)/?([^/]*)?/?([^/]*)?/?$', 'view': 'Remedies', 'type': 'regex' },
  { 'pattern': '/view/(\\d+)$', 'view': 'ViewRemedy', 'type': 'regex' },
  { 'pattern': '/singleview/(\\d+)$', 'view': 'SingleView', 'type': 'regex' },
  { 'pattern': '/add', 'view': 'AddRemedy' }
];

routeMap['patients'] = [
  { 'pattern': '/', 'view': 'Patients' },
  { 'pattern': '/(\\d+)/?([^/]*)?/?([^/]*)?/?$', 'view': 'Patients', 'type': 'regex' },
  { 'pattern': '/view/(\\d+)$', 'view': 'ViewPatient', 'type': 'regex' },
  { 'pattern': '/add', 'view': 'AddPatient' }
];

routeMap['history'] = [
  { 'pattern': '/', 'view': 'Histories' },
  { 'pattern': '/(\\d+)/?([^/]*)?/?([^/]*)?/?$', 'view': 'Histories', 'type': 'regex' },
  { 'pattern': '/view/(\\d+)$', 'view': 'ViewHistory', 'type': 'regex' },
];

export default routeMap;
