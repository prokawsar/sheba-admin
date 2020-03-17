import 'promis';
import Store from './store';
import DB from './db';
import Net from './net';
import Access from './access';


var currentState = function () {
  var self = this,
    initial_state = Store.get(),
    App = null;

  self.init = function (app) {
    App = app;
    _init();
  }

  function _init() {

    document.activeElement && document.activeElement.blur();

    //move footer inside sidebar
    //var footer = document.querySelector("#footer"),
    //sideBar = document.querySelector("#sidebar");
    //sideBar.appendChild(footer);


    //load the state from localstorage

    var state = DB.get('state');
    if (typeof state != 'undefined' && state) {
      initial_state = state;
    } else {
      DB.set('state', initial_state);
    }




    //set authentication key in network comms
    Net.setKey(initial_state.key);

    //respond to Net errors
    Net.bind('httpError', function (code) {
      if (code == 409) {
        App.fire('duplicateLogin');
      }
      if (code == 401) {
        App.fire('noAccess');
      }
    });

    //set app state
    initial_state.online = navigator.onLine;

    if (initial_state.is_logged_in) {
      if (!Access.isAllowed(initial_state.role)) {
        initial_state.is_logged_in = false;
        initial_state.user = null;
        initial_state.role = null;
        initial_state.key = null;
        DB.set('state', initial_state);
      }
    }

    //set browser info in env key
    //App.set({ env: EnvDetector.env });

    Store.set(initial_state);

    //online/offline
    window.addEventListener("offline", function (e) { Store.set({online: false}); });
    window.addEventListener("online", function (e) { Store.set({online: true}); });

    //check for application updates every 5 minutes
    if (K_ENV != K_ENV_DEV) {
      var appUpdateInterval = window.setInterval(function () {
        Net.ajax({ url: './version.json?t=' + (new Date).getTime(), method: 'GET' }).then(function (r) {
          var current = ("{{version}}" + "{{build}}").replace(/\s?\[dev\]/, ''),
            newv = (r.response.version + r.response.build).replace(/\s?\[dev\]/, '');
          if (current != newv) {
            App.fire("updateReady");
            //stop checking if we already know we have an update
            window.clearInterval(appUpdateInterval);
          }
        }).catch(function () { });
      }, 300000);
    }


    if (initial_state.is_logged_in) {

      Store.set({ mainSections: Access.mainSections(initial_state.role) });

      setTimeout(function () {
        Store.set({ is_loading: false });
      }, 500);

    } else {
      setTimeout(function () {
        Store.set({ is_loading: false });
      }, 500);

    }

  }


  self.updateState = function (changedProps) {
    initial_state = Object.assign(initial_state, changedProps);
    DB.set('state', initial_state);
  }

  self.authenticate = function (u, p, t) {
    return new Promise(function (fulfil, reject) {
      Net.authenticate(u, p, t).then(function (r) {
        if (Access.isAllowed(r.role)) {
          Store.set({ mainSections: Access.mainSections(r.role) });
          Net.setKey(r.key);
          fulfil(r);
        } else {
          reject({ valid: false, response: { 'userMessage': 'You do not have sufficient access permissions' } });
        }
      }, function (r) {
        reject(r);
      });
    });
  }

  self.deauthenticate = function () {
    //scrub key from Net
    Net.setKey(null);
  }


}

//this ensures a singleton of this class
export default new currentState;
