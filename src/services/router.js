import _grapnel from 'grapnel';
import Access from './access';

var Grapnel = _grapnel || window.Grapnel;

var _router = new Grapnel();

var Router = function () {
    var self = this,
        App = null,
        Routes = {},
        defaultRoute = null;

    self.router = _router;

    self.init = function (app, routes, def_route) {
        App = app;
        Routes = routes;
        defaultRoute = def_route || 'home';
        _init();
    }

    self.goHome = function () {
        self.router.navigate('');
    }

    self.navigate = function (p) {
        self.router.navigate(p);
    }

    var capitalize = function (m) {
        return m.charAt(0).toUpperCase() + m.slice(1);
    }

    var middleWares = {
        'accessCheck': function (req, ev, next) {
            var m = (req.match[0].split('/'))[0],
                section = capitalize(m);

            if (Access.sectionAllowed(section, App.store.get().user)) {
                next();
            } else {
                App.fire('routeChange', {
                    view: '404',
                    params: {}
                });
                ev.stopPropagation();
            }
        }
    };

    function applyRoute(context, pattern, view, childOf) {

        context.call(self.router, pattern, middleWares['accessCheck'], function (req, ev) {
            var m = (req.match[0].split('/'))[0],
                section = childOf ? capitalize(childOf) : capitalize(m);

            App.fire('routeChange', {
                view: view,
                section: section,
                params: req.params
            });

            ev.stopPropagation();

        });
    }

    function _init() {

        var contexts = [],
            i = 0;
        for (var base in Routes) {
            contexts[i] = self.router.context(base);
            for (var p in Routes[base]) {
                var pattern = Routes[base][p]['pattern'],
                    view = Routes[base][p]['view'],
                    type = typeof Routes[base][p]['type'] != 'undefined' ? Routes[base][p]['type'] : '',
                    context = contexts[i],
                    childOf = typeof Routes[base][p]['childOf'] != 'undefined' ? Routes[base][p]['childOf'] : null;

                if (type == 'regex') {
                    pattern = new RegExp('^' + base + pattern, 'i');
                    context = self.router.get;
                }

                applyRoute(context, pattern, view, childOf);

            }
            i++;
        }

        //404 handler
        self.router.get('*', function (req, ev) {
            if (req.match[0] == '') {
                self.router.navigate(defaultRoute);
                return;
            }
            if (!ev.parent()) {
                App.fire('routeChange', {
                    view: '404',
                    params: {}
                });
            }
        });

    }
};

export default new Router;