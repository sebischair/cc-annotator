'use babel';

import request from 'request'

var rp = require('request-promise');

module.exports =  {

  ms_services: function(url, content) {

    return new Promise((resolve, reject) => {
      request.post(
          {
            headers: {
              'content-type' : 'application/json',
              'Ocp-Apim-Subscription-Key' : '7f3435eadc484c32b084d406684a7b7a'
            },
            url: url,
            body: JSON.stringify(content)
          },
          function(err,response,body) {
              if (!err && response.statusCode == 200) {
                resolve(body)
              } else {
                reject({
                  reason: 'Unable to query!',
                  error: err
                  })
              }
          })
    })
  },

  sebis_services: function(url, content) {
    return new Promise((resolve, reject) => {
      request.post(
          {
            headers: {
              'content-type' : 'application/json',
            },
            url: url,
            body: JSON.stringify(content)
          },
          function(err,response,body) {
              if (!err && response.statusCode == 200) {
                resolve(body)
              } else {
                reject({
                  reason: 'Unable to query!',
                  error: err
                  })
              }
          })
    })
  },

  sebis_services_get: function(url, projectId) {

    qs = {}
    if (projectId != ""){
      qs = {
            projectId: projectId
      }
    }

    var options = {
        uri: url,
        qs: qs,
        headers: {
            //'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    return rp(options)
    },

}
