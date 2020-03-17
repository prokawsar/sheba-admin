import Nanoajax from 'nanoajax';
import 'promis';
import EventEmitter from 'microevent';

import baseUrl from '../config/endpoint';

var serialize = function (obj, prefix) {
  var str = [];
  for (var p in obj) {
    if (obj.hasOwnProperty(p)) {
      var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
      str.push(typeof v == "object" ?
        serialize(v, k) :
        encodeURIComponent(k) + "=" + encodeURIComponent(v));
    }
  }
  return str.join("&");
};

var parseNextLink = function (meta) {

  if (typeof meta.links != 'undefined') {
    if (typeof meta.links.next != 'undefined') {
      var l = meta.links.next.uri.split('/');
      l.shift(); l.shift();
      return '/' + l.join('/');
    }
  }
  return false;
}

var buildFakeResponse = function (records, meta) {
  return {
    code: 200,
    response: records,
    xhr: {},
    headers: {},
    _meta: meta
  }
}

var network = function () {
  var self = this,
    key = '';

  EventEmitter.mixin(self);

  self.raw = function (params) {
    return new Promise(function (fulfil, reject) {
      if (typeof params.headers == 'undefined') {
        params.headers = {};
      }
      params.headers['Api-key'] = key;
      Nanoajax.ajax(params, function (code, response, xhr) {
        var resp = {};
        if (code >= 200 && code < 400) {
          fulfil(response)
        } else {
          self.trigger('httpError', code);
          try {
            resp = JSON.parse(response);
          } catch (e) { }
          if (typeof resp.records != 'undefined') {
            reject({ code: code, response: resp });
          } else {
            reject({ code: code, response: response });
          }
        }
      });
    });
  };

  self.ajax = function (params) {
    return new Promise(function (fulfil, reject) {
      if (typeof params.headers == 'undefined') {
        params.headers = {};
      }
      params.headers['Api-key'] = key;
      Nanoajax.ajax(params, function (code, response, xhr) {
        var resp = {};
        if (code >= 200 && code < 400) {
          try {
            resp = JSON.parse(response);
          } catch (e) { }

          if (typeof resp.records != 'undefined') {
            fulfil({
              code: code,
              response: resp.records,
              xhr: xhr,
              headers: xhr.getAllResponseHeaders(),
              _meta: resp._meta
            });
          } else {
            self.trigger('httpError', 501);
            reject({ code: code, response: response });
          }
        } else {
          self.trigger('httpError', code);
          try {
            resp = JSON.parse(response);
          } catch (e) { }
          if (typeof resp.records != 'undefined') {
            reject({ code: code, response: resp });
          } else {
            reject({ code: code, response: response });
          }
        }
      });
    });
  };

  self.get = function (url) {
    return self.ajax({ url: baseUrl + url, method: 'GET' });
  };

  self.getRaw = function (url) {
    return self.raw({ url: baseUrl + url, method: 'GET' });
  };

  self.delete = function (url) {
    return self.ajax({ url: baseUrl + url, method: 'DELETE' });
  };

  //examples:
  // pages = 3, for pages 1-3
  // pages = all, for all pages
  self.getAllPages = function (url, pages) {
    var pages = pages || 'all',
      done = 0,
      fullResponse = [],
      next = baseUrl + url,
      link;
    return new Promise(function (fulfil, reject) {

      function getNextPage() {
        self.ajax({ url: next, method: 'GET' }).then(function (r) {

          if (pages == 'all') {
            pages = Math.ceil(r._meta.total / r._meta.limit);
          }

          done++;

          link = parseNextLink(r._meta);
          if (r.response.length) {
            fullResponse = fullResponse.concat(r.response);
          }

          //if there is no next page
          if (!link) {
            fulfil(buildFakeResponse(fullResponse, r._meta));
            return;
          } else {
            next = baseUrl + link;
          }

          //if we have got all the pages we need
          if (done >= pages) {
            fulfil(buildFakeResponse(fullResponse, r._meta));
            return;
          }

          getNextPage();

        }, function () {
          fulfil(buildFakeResponse(fullResponse, {}));
        })
      }

      getNextPage();

    });
  };

  self.post = function (url, data) {
    return self.ajax({ url: baseUrl + url, method: 'POST', body: serialize(data) });
  };

  self.upload = function (url, formData, onprogress) {
    return self.ajax({ url: baseUrl + url, method: 'POST', body: formData, onprogress: onprogress });
  }

  self.postJSON = function (url, data) {
    return self.ajax({
      url: baseUrl + url,
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  self.putJSON = function (url, data) {
    return self.ajax({
      url: baseUrl + url,
      method: 'PUT',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' }
    });
  };

  self.authenticate = function (user, password, type) {
    return new Promise(function (fulfil, reject) {
      var p = self.post('/auth', { username: user, password: password, login_type: type});
      p.then(function (r) {
        var resp = { valid: false }
        if (r.code == 200 || r.code == 201) {
          try {
            resp = r.response;
            if (typeof resp.key != 'undefined' && resp.key != '') {
              resp.valid = true;
            }
          } catch (e) { }
        }
        fulfil(resp);
      }, function (r) {
        reject(r);
      });
    });
  };

  self.setKey = function (k) {
    key = k;
  };

};

//this ensures a singleton of this class
export default new network();