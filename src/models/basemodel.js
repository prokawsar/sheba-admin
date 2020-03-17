import Net from '../services/net';

class baseModel {
  constructor() {
    this.apiEndpoint = '';
  }

  _obj2Qs(q) {
    var ret = [];
    for (var k in q) {
      ret.push(k + '=' + q[k]);
    }
    return '?' + ret.join('&');
  }

  authContext(ctx) {
    var ctx = ctx ? '/' + ctx : '';
    return Net.get('/auth' + ctx)
  }

  getAllPages(q, endpoint) {
    q = this._obj2Qs(q);
    return Net.getAllPages((endpoint || this.apiEndpoint) + q);
  }

  getAll(q, endpoint) {
    q = this._obj2Qs(q);
    return Net.get((endpoint || this.apiEndpoint) + q);
  }

  getOne(id, endpoint) {
    return Net.get((endpoint || this.apiEndpoint) + '/' + id);
  }

  save(id, payload, endpoint) {
    return Net.putJSON((endpoint || this.apiEndpoint) + '/' + id, payload);
  }

  create(payload, endpoint) {
    return Net.postJSON((endpoint || this.apiEndpoint), payload);
  }

  delete(id, endpoint) {
    return Net.delete((endpoint || this.apiEndpoint) + '/' + id);
  }

  upload(id, payload, onprogress, endpoint) {
    onprogress = onprogress || function () { };
    return Net.upload((endpoint || this.apiEndpoint) + '/' + id, payload, onprogress);
  }

  download(q, endpoint){
    q = this._obj2Qs(q);
    return Net.getRaw((endpoint || this.apiEndpoint) + q);
  }

}

export default baseModel;