var url = '';

switch(K_ENV){
  case K_ENV_PROD:
    url = '';
  break;
  case K_ENV_TEST:
    url = '';
  break;
  default:
    url = 'http://localhost:500/v1';
  break;
}

export default url;
