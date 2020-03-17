export default function(format, dt){
  var today = new Date(),
  days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  months = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

  dt = dt || today;
  var ret = dt;
  switch(format){
    case 'short':
      var dd = dt.getDate(),
      mm = dt.getMonth()+1, //January is 0!
      yyyy = dt.getFullYear();
      if(dd<10){
          dd='0'+dd
      }
      if(mm<10){
          mm='0'+mm
      }
      ret =  dd+'/'+mm+'/'+yyyy;
    break;
    case 'long':
      var d = days[dt.getDay()],
      dd = dt.getDate()+'',
      m = months[dt.getMonth()],
      y = dt.getFullYear(),
      lastChar = dd.slice(-1);
      if(lastChar == '1' && dd != '11'){
        dd = dd+'st';
      }
      else if(lastChar == '2'){
        dd = dd+'nd';
      }
      else if(lastChar == '3'){
        dd = dd+'rd';
      }
      else{
        dd = dd+'th';
      }

      ret = d+' '+dd+' of '+m+' '+y;
    break;
  }

  return ret;
}

