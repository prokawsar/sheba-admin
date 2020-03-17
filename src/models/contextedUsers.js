import baseModel from './basemodel.js';
import 'promis';

export default new class extends baseModel{

  constructor(){
    super();
    this.apiEndpoint = '/contextedusers';
    this.ctx = '';

    this.getRoles = (ctx, endpoint) => {
        return this.authContext.apply(this, [ctx]);
    }

    var oldGetAll = this.getAll;
    this.getAll = (q) => {
        return oldGetAll.apply(this, [q, this.apiEndpoint+'/'+this.ctx]);
    }

    var oldGetOne = this.getOne;
    this.getOne = (id, ctx) => {
        return Promise.all([
            this.getRoles(ctx),
            oldGetOne.apply(this, [id, this.apiEndpoint+'/'+this.ctx])
        ])
    }

    var oldSave = this.save;
    this.save = (id, payload) => {
        return oldSave.apply(this, [id, payload, this.apiEndpoint+'/'+this.ctx]);
    }

    var oldCreate = this.create;
    this.create = (payload) => {
        return oldCreate.apply(this, [payload, this.apiEndpoint+'/'+this.ctx]);
    }

    var oldDelete = this.delete;
    this.delete = (id) => {
        return oldDelete.apply(this, [id, this.apiEndpoint+'/'+this.ctx]);
    }

    var oldUpload = this.upload;
    this.uploadAvatar = (id, payload, onprogress) => {
        return oldUpload.apply(this, [id, payload, onprogress,  this.apiEndpoint+'/'+this.ctx+'/avatar']);
    }

  }

};