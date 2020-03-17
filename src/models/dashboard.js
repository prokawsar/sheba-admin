import baseModel from './basemodel.js';
import Net from '../services/net';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/dashboard';
  }
};