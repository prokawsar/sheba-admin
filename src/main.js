import App from './components/App.html';
import store from './services/store';
import State from './services/state';
import Access from './services/access';
import Router from './services/router';

var app = new App({
  store,
  target: document.getElementById('app')
});

//----Mobile only functionality

app.on('toggleSidebar', function () {
  var { app_state } = app.get();
  app_state.show_sidebar = !app_state.show_sidebar;
  app.set({ app_state });
});

app.on('hideSidebar', function () {
  var { app_state } = app.get();
  app_state.show_sidebar = false;
  app.set({ app_state });

});

//--END--Mobile only functionality

app.on('duplicateLogin', function () {
  var { app_state } = app.get();
  app_state.show_duplicate_login_modal = true;
  app.set({ app_state });
});

app.on('updateReady', function () {
  store.set({ update_ready: true });
});

app.on('updateLoggedIn', function (payload) {
  var { user } = store.get();
  user.name = payload.name;
  user.surname = payload.surname;
  user.email = payload.email;
  user.avatar = payload.avatar;
  user.should_change_password = payload.should_change_password;
  store.set({ user });
});

app.on('validatelogin', function (comp) {
  var { username, password } = comp.get();
  let type = 'SA';

  State.authenticate(username, password, type).then(function (r) {
    if (r.valid) {
      comp.valid();

      var state = {
        user: r,
        key: r.key,
        role: r.role,
        is_logged_in: true
      };

      store.set(state);

      var oh = window.location.hash;
      Router.navigate('nf');
      setTimeout(function () {
        Router.navigate(oh.substring(1));
      }, 10);

      return;
    }
    comp.invalid();
  }, function (r) {
    comp.invalid();
  });

});

app.on('logout', function () {
  var self = this;
  State.deauthenticate();

  var state = {
    is_logged_in: false,
    user: { name: '', surname: '', email: '', username: '', avatar: '', should_change_password:'' },
    role: null,
    key: null
  },

    { app_state } = app.get();

  app_state.show_duplicate_login_modal = false;

  store.set(state);
  self.set({ app_state });
});


store.on('state', function ({ changed, current, previous }) {
  var obsStateKeys = ['is_logged_in', 'user', 'key', 'role'];

  var changedProps = {};

  obsStateKeys.forEach((item) => {
    if (changed[item]) {
      changedProps[item] = current[item];
    }
  });

  State.updateState(changedProps);

});

//Instantiate sibsidiary services
State.init(app);


export default app;