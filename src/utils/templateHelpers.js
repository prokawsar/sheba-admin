export function truncate(str, len){
  return (str && (str.length >= (len + 3))) ? str.substr(0, len) + '...' : str;
}

export function nl2br(input){
  if (!input) { return ''; }
  return (input + '').replace(/\n/g, '<br>');
}

export function currency(n){
  var nn = Number(n);
  return (isNaN(nn) ? 0 : nn).toFixed(2);
}

export function YNUtoString(val){
  let message = {
    'Y' : 'Yes',
    'N' : 'No',
    'U' : 'Unknown'
  }
  return message[val]
}

export function YNUtoClass(val){
  let message = {
    'Y' : 'is-success',
    'N' : 'is-danger',
    'U' : 'is-light'
  }
  return message[val]
}


export default {
  truncate, nl2br, currency, YNUtoString, YNUtoClass
}