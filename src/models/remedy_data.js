import baseModel from './basemodel.js';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/remedy_data';
  }

  getByRemedy(id) {
    return this.getAll(id, this.apiEndpoint + '/getbyremedy');
  }

};