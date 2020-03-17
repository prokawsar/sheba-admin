import { Store } from 'svelte/store.js';

class OptigenStore extends Store {};

const store = new OptigenStore({
  ENV_MARKER: K_ENV == K_ENV_PROD ? '' : K_ENV,
  is_loading: true,
  is_logged_in: false,
  user: { name: '', surname: '', email: '', avatar: '', should_change_password: '' },
  role: null,
  key: null,
  mainSections: {},
  nav: { activeTab: 'Home', activeView: 'home', params: {} },
  update_ready: false,
  settings: { transition: true }
});

export default store;