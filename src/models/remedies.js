import baseModel from './basemodel.js';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/remedies';
  }

  search(payload) {
    return this.create(payload, this.apiEndpoint + '/search');
  }

};