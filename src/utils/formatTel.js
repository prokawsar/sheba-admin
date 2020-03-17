export default function(tel){
  var number = "";

  if(tel == null){
    return number;
  }

  if(tel != false){
    number = tel.replace(" ", "");
    if(number.substr(0, 1) == '+'){
      return number;
    }

    if(number.substr(0, 1) == '0'){
      number = number.substr(1);
      number = '+44'+number;
    }
  }

  return number;
}

