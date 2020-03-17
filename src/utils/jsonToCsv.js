function getWhitelistedKeys(item, whitelist){
  if (
      !whitelist ||
      (!(whitelist instanceof Array) && !(whitelist instanceof Object)) ||
      !item
  ){
      return item;
  }

  var newObj = {};
  Object.entries(item)
  .forEach(function(entry){
      if (whitelist instanceof Array && whitelist.indexOf(entry[0]) !== -1){
          newObj[entry[0]] = entry[1];
      }
      else if ((whitelist instanceof Object) && typeof whitelist[entry[0]] != 'undefined'){
          newObj[whitelist[entry[0]]] = entry[1];
      }
  });

  return newObj;
}

function getCSVLine(arr, transformer){
  transformer = transformer || function(item){return item;}
  return arr.map(function(item){
      return '"' + (item && item.toString().replace('"', '\"')) + '"';
  })
  .map(transformer)
  .join(',') + "\r\n";
}

export default function(data, withHeaders, whitelist, transformer){
  if (!data) return '';

  var array = typeof data != 'object' ? JSON.parse(data) : data;

  if(array.length < 1) return '';

  var str = '';

  if(withHeaders && array[0]){
      var arr = getWhitelistedKeys(array[0], whitelist);
      str += getCSVLine(Object.keys(arr));
  }

  for (var i = 0; i < array.length; i++) {
      var arr = getWhitelistedKeys(array[i], whitelist);
      str += getCSVLine(Object.values(arr), transformer);
  }

  //"sep=," tells Excel to use commas as separators
  //otherwise it cries for no reason
  //the extra line is not displayed when you open file in excel
  return "sep=,\r\n" + str;
}
