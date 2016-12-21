//Google Apps (Javascript) Client for Algorithmia
// by Ken Burcham - (mostly copied from Algorithmia's JavaScript client)
// Add this file to your Google Sheet Script Editor to define the Algorithmia client you can
// call from your own custom function.

var Algorithmia = {};

(function() {
  var Client, algoPattern, getDefaultApiAddress;

  getDefaultApiAddress = function() {
    if (Algorithmia.apiAddress !== void 0) {
      return Algorithmia.apiAddress;
    } else {
      return "https://api.algorithmia.com/v1/web/algo";
    }
  };

  algoPattern = /^(?:algo:\/\/|\/|)(\w+\/.+)$/;

  Algorithmia.query = function(algo_uri, api_key, input, cb) {
    return Algorithmia.client(api_key).algo(algo_uri).pipe(input, function(result) {
      if (result.error) {
        return cb(result.error.message || result.error);
      } else {
        return cb(void 0, result.result);
      }
    });
  };

  Algorithmia.client = function(api_key, api_address) {
    //Logger.log("Client loading...");
    api_key = api_key || Algorithmia.apiKey;
    api_address = api_address || getDefaultApiAddress();
    return new Client(api_key, api_address);
  };

  Client = function(api_key, api_address) {
    this.api_key = api_key;
    this.api_address = api_address;
    this.algo = function(algo_uri) {
      if (algo_uri && typeof algo_uri === "string") {
        return new Algorithm(this, algo_uri);
      } else {
        console.error("Invalid algorithm url: " + algo_uri);
        return null;
      }
    };
  };

  Algorithmia.algo = function(algo_uri) {
    return Algorithmia.client().algo(algo_uri);
  };

  Algorithm = function(client, algo_uri) {
    if (!(typeof algo_uri === "string" && algo_uri.match(algoPattern))) {
      throw "Invalid Algorithm URI (expected /owner/algo)";
    }
    this.client = client;
    this.algo_uri = algo_uri.match(algoPattern)[1];
    this.pipe = function(input, cb) {
          endpoint_url = client.api_address + "/" + this.algo_uri;
          payload = JSON.stringify(input);
          //Logger.log(payload);
          var options = {
            'muteHttpExceptions':false,
            'method': 'post',
            'headers': {"Content-Type":"application/json", 
                        "Accept":"application/json, text/javascript",
                        "Authorization":"Simple " + client.api_key
                       },
            'payload':payload
          };
          
          var response = UrlFetchApp.fetch(endpoint_url, options);
          
          var json = response.getContentText();
          var data = JSON.parse(json);
          
          return data.result; 
        };
      
  };

}).call(this);

//# sourceMappingURL=algorithmia-0.2.0.js.map
