import baseModel from './basemodel.js';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/treatments';
  }
  
  createWithCase(payload) {
    return this.create(payload, this.apiEndpoint + '/create_with_case');
  }

};