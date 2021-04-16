/*
return resut as array of objects
[
  {
    id: remedy id,
    name: remedy name,
    mark: remedy gets matched mark
    fields:[ array of matched symptoms and queries
      {
        matched:
        query:
      }
    ]
  }
]
*/
export default function(data, remedies){
  let _payload = [],
      matched_remedies = [],
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

            if( value.trim() != '' && symptom.trim().includes(value.trim())){
              var is_remedy_exist = matched_remedies.find(obj => {
                return obj.name === remedy['name']
              })

              if(is_remedy_exist){
                let objIndex = matched_remedies.findIndex((obj => obj.id == is_remedy_exist.id));
                matched_remedies[objIndex].mark++;
                if(!matched_remedies[objIndex].fields[key]){
                  matched_remedies[objIndex].fields[key] = [];
                  matched_remedies[objIndex].fields[key].push({
                    matched: symptom.trim(),
                    query: value.trim()
                  });
                }else{
                  matched_remedies[objIndex].fields[key].push({
                    matched: symptom.trim(),
                    query: value.trim()
                  });
                }
              }else{
                let fields = {};
                fields[key] = [];
                fields[key].push({
                  matched: symptom.trim(),
                  query: value.trim()
                });

                matched_remedies.push({
                  id: remedy.id,
                  name: remedy.name,
                  mark: 1,
                  fields
                })
              }
              // if( matched_remedies.hasOwnProperty(remedy['name']) ){
              //   matched_remedies[remedy['name']].mark++;

              //   if( !matched_remedies[remedy['name']].fields[key] ){
              //     matched_remedies[remedy['name']].fields[key] = [];
              //   }
              //   matched_remedies[remedy['name']].fields[key].push({
              //     matched: symptom.trim(),
              //     query: value.trim()
              //   });

              // }else{
              //   matched_remedies[remedy['name']] = {};
              //   matched_remedies[remedy['name']].id = remedy['id'];
              //   matched_remedies[remedy['name']].mark = 1;

              //   matched_remedies[remedy['name']].fields = {};
              //   matched_remedies[remedy['name']].fields[key] = [];
              //   matched_remedies[remedy['name']].fields[key].push({
              //     matched: symptom.trim(),
              //     query: value.trim()
              //   });

              // }
            }
          })
        }

      })
    })
  }
  return matched_remedies;
}