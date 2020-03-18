import cloneObject from '../utils/cloneObject';

var Access = function(){
  var self = this;

  //all roles in the system
  var ROLE = {
    CONTEXT_ADMIN             : 'SA',
    CONTEXT_USER              : 'SU',
  };

  //roles allowed to login to this system
  var ALLOWED = [
    ROLE.CONTEXT_ADMIN, ROLE.CONTEXT_USER
  ];

  // sections on main Navigation
  var sections = {
    'Dashboard'           : {icon:'dashboard', url:''},
    'Users'               : {icon:'vcard-o', url:'users'},
    'Profile'             : {visible: false },
    'Remedies'              : {icon: 'user', url: 'remedies'},
  },
  allowedMap = {},
  allowedSections  = {};

  allowedMap[ROLE.CONTEXT_ADMIN] = [
    'Dashboard', 'Users', 'Profile', 'Remedies'
  ];
  allowedMap[ROLE.CONTEXT_USER] = [
    'Dashboard', 'Profile'
  ];


  //map allowedMap to allowedSections
  for(var k in allowedMap){
    allowedSections[k] = {};
    for (var i = 0; i < allowedMap[k].length; i++){
      allowedSections[k][allowedMap[k][i]] = sections[allowedMap[k][i]];
    }
  }


  self.isAllowed = function(role){
    return ALLOWED.indexOf(role) !== -1;
  }

  self.sectionAllowed = function(section, user){
    var {role} = user
    return typeof allowedSections[role] != 'undefined' && typeof allowedSections[role][section] != 'undefined';
  }

  self.mainSections = function(role){
    return allowedSections[role] || {};
  }

  self.roles = ROLE;

};

export default new Access;
