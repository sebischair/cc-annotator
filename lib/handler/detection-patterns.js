'use babel';

patterns = {}

module.exports =  {

      get_patterns: function(projectId){
          url="https://spotlight.in.tum.de/pattern?projectId="+projectId
          query.sebis_services_get(url).then((response) => {
            patterns = response
          }).catch((err) => {
            console.log("ERROR: "+JSON.stringify(err))
          })/**/
      },





}
