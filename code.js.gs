//Code.gs - Ken Burcham - December 21, 2016

//Basic demonstration of how to call an Algorithmia algorithm from a custom function in a Google Sheet
// In the Google Sheet, in the first column, paste in a URL for a website you want a summary for.
// Then in the second column, give a function like: =ALGO("analyze-url",A1)
// (where A1 is your URL that you want to summarize).
// Google sheets will execute the function and return the summary using the Algorithmia API.

//Login to Algorithmia (create an account if necessary) then put your api_key below.
var api_key = "API_KEY";

/*
* Call from a cell in a Google Sheet to make a call to a Algorithmia algorithm API.
* Note: the algorithm must be already defined below.

* a_algorithm: algorithm that you want to run. must match a configured algorithm in the array below
* a_input: a cell or value that you want to provide as input
* a_options: any options that you want to send to your algorithm function defined below
*/
function ALGO(a_algorithm, a_input, a_options) {
  //a_algorithm = "analyze-url";
  //a_input = "http://www.theverge.com/2016/12/20/14020720/uber-self-driving-cars-bike-lane-problem";
  return algorithms[a_algorithm](a_input, a_options);
}

//Running this code from inside the script editor will have permission
// to write out all of the columns that return in the results to adjacent cells.
function DIRECT_ALGO() {
  a_algorithm = "analyze-url-direct"; //the one we want to call below
  a_input = "https://www.theatlantic.com/health/archive/2016/12/no-doctor-should-work-30-straight-hours/510395/"; //test url

  algorithms[a_algorithm](a_input);

}

algorithms = {};

function add_algorithm(a_name, a_function){
  algorithms[a_name]=a_function;
}

//Define the "analyze-url" algorithm from Algorithmia so we can call it.
add_algorithm("analyze-url",
     function(a_inputURL){

       var input = [a_inputURL];
       result = Algorithmia.client(api_key)
           .algo("algo://web/AnalyzeURL/0.2.17")
           .pipe(input);

       // in our case, we want the "summary" field from the resulting JSON
       //Logger.log(result);
       if(result.summary == "")
         return "<no summary>";
       else
         return result.summary;
     });

 //this function will copy all of the result columns/values into adjacent cells to A1
 add_algorithm("analyze-url-direct",
      function(a_inputURL, a_firstcell){

        var input = [a_inputURL];
        result = Algorithmia.client(api_key)
            .algo("algo://web/AnalyzeURL/0.2.17")
            .pipe(input);

        //Logger.log(result);
        copyDataToFields(result)
      });


//mm - can't do this until we create this as an ADD-ON due to permission restrictions by Google...

//option: copy a json result to the fields to the right of the running function
function copyDataToFields(a_data) {
  var results = a_data;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0];

  //var cell = sheet.getActiveCell();

  var active_row = 1; //cell.getRow()+1;
  var active_col = 1; //cell.getColumn()+1;

  var target_col = active_col;
  var target_row = active_row;

  //label the headers
  for(key in results) {
    target_col++;
    sheet.getRange(target_row, target_col).setValue(key); //key = label
  }

  target_col = active_col; //reset to beginning column
  target_row++; //move to the next row...

  //copy each json field in the top level to each consecutive cell to the right AFTER the current one
  for(key in results)  {
    target_col++;
    sheet.getRange(target_row, target_col).setValue(results[key].toString().substring(0,255));
  }

}
