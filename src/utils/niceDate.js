export default function(d, withTime, ampm){
  var is_date_object = d instanceof Date;
  if (d && (is_date_object || d.trim()!='')) {
    var dt = is_date_object ? d : new Date(d.replace(/-/g, '/')),
    date = dt.getDate();
    if(isNaN(date)){
      return '';
    }
    var _date = date,
    _month = (dt.getMonth() + 1);
    _date = _date < 10 ? '0' + _date : _date;
    _month = _month < 10 ? '0' + _month : _month;

    _date = _date + '/' + _month + '/' + dt.getFullYear().toString();

    if(withTime){
      var h = dt.getHours(),
      m = dt.getMinutes();

      if(h == 9 && m == 0 && ampm){
        _date += ' AM';
      }else if(h == 12 && m == 0 && ampm){
        _date += ' PM';
      }else{
        h = h < 10 ? '0'+h : h;
        m = m < 10 ? '0'+m : m;
        _date += ' ' + h + ':' + m;
      }
    }


    return _date;
  }
  return '';
}