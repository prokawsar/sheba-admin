import baseModel from './basemodel.js';

export default new class extends baseModel {
  constructor() {
    super();
    this.apiEndpoint = '/users';

    var old = this.getOne;
    this.getOne = (id, ctx)=>{
      return Promise.all([
        this.authContext.apply(this, [ctx]),
        old.apply(this, [id])
      ]);
    }
  }

  uploadAvatar(id, payload, onprogress) {
    return this.upload((id + '/avatar'), payload, onprogress);
  }

  premiseByOrg(id){
    return this.getAll('', this.apiEndpoint+'/'+id + '/premises');
  }

};