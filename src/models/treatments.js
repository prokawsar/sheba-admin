import baseModel from './basemodel.js';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/treatments';
  }
};