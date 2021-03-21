export default function(data, remedies){
  let _payload = [],
      matched_remedies = {},
      omitted_field = [ 'id', 'name', 'created', 'modified', 'deleted', 'patient', 'treatments', 'book_references', 'total_data_size'];

  //reducing null fields from payload
  for(let [key, value] of Object.entries(data)) {
    if(value && !omitted_field.includes(key)){
      _payload[key] = value.split(',')
    }
  }
  // console.log(_payload)

  for(let [key, values] of Object.entries(_payload)) { // values are array of symptoms
    values.forEach( (value) => {
      remedies.forEach( (remedy) => {
        if(remedy[key] != '' && remedy[key] ){
          remedy[key].split(',').forEach( (symptom) =>{ // matching with each symptoms for remedy

            if(symptom.trim() === value.trim() && value.trim() != ''){
              if( matched_remedies.hasOwnProperty(remedy['name']) ){
                matched_remedies[remedy['name']].mark++;
                matched_remedies[remedy['name']].field += ', ' + key;
                matched_remedies[remedy['name']].symptoms += ', ' + value.trim();

              }else{
                matched_remedies[remedy['name']] = {};
                matched_remedies[remedy['name']].field = key;
                matched_remedies[remedy['name']].mark = 1;
                matched_remedies[remedy['name']].symptoms = value.trim();

              }
            }
          })
        }

      })
    })
  }
  return matched_remedies;
}