import baseModel from './basemodel.js';
import Net from '../services/net';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/profile';

    this.oldGetOne = this.getOne;
    this.getOne = (endpoint) => {
      return Net.get((endpoint || this.apiEndpoint));
    }

    this.oldSave = this.save;
    this.save = (payload, endpoint) => {
      return this.oldSave('', payload, endpoint);
    }

  }

  uploadAvatar(payload, onprogress) {
    return this.upload(('avatar'), payload, onprogress);
  }

};