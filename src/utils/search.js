export default function(data, remedies){
  let _payload = [],
      matched_remedies = {},
      omitted_field = [ 'id', 'name', 'created', 'modified', 'deleted', 'patient', 'treatments', 'book_references', 'total_data_size'];

  //reducing null fields from payload
  for(let [key, value] of Object.entries(data)) {
    if(value && !omitted_field.includes(key)){
      _payload[key] = value.split(',').filter( (e) => {
        return e != null && e.trim() != '';
      })
    }
  }
  // console.log(_payload)

  for(let [key, values] of Object.entries(_payload)) { // values are array of symptoms
    values.forEach( (value) => {
      remedies.forEach( (remedy) => {
        if(remedy[key] != '' && remedy[key] ){
          remedy[key].split(',').forEach( (symptom) =>{ // matching with each symptoms for remedy
            // if(symptom.trim() === value.trim() && value.trim() != ''){
            if( value.trim() != '' && symptom.trim().includes(value.trim())){
              if( matched_remedies.hasOwnProperty(remedy['name']) ){
                matched_remedies[remedy['name']].mark++;
                // matched_remedies[remedy['name']].field += ', ' + key;
                // matched_remedies[remedy['name']].symptoms += ', ' + symptom.trim();

                if( !matched_remedies[remedy['name']].fields[key] ){
                  matched_remedies[remedy['name']].fields[key] = [];
                }
                matched_remedies[remedy['name']].fields[key].push({
                  matched: symptom.trim(),
                  query: value.trim()
                });

              }else{
                matched_remedies[remedy['name']] = {};
                matched_remedies[remedy['name']].mark = 1;
                // matched_remedies[remedy['name']].field = key;
                // matched_remedies[remedy['name']].symptoms = symptom.trim();

                matched_remedies[remedy['name']].fields = {};
                matched_remedies[remedy['name']].fields[key] = [];
                matched_remedies[remedy['name']].fields[key].push({
                  matched: symptom.trim(),
                  query: value.trim()
                });


              }
            }
          })
        }

      })
    })
  }
  return matched_remedies;
}