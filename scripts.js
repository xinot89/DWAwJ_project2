/* Aletaan pusertamaan seuraavalla eteenpäin:
https://www.digitraffic.fi/en/railway-traffic/
*/
/*I used https://jshint.com/ for additional checking of code, this is to tell checker that my code is using functionalities from EcmaScript 6:*/
/*jshint esversion: 6 */


/* Short tutorial on event handlers: https://blog.logrocket.com/dynamically-create-javascript-elements-event-handlers/
Cannot make sense on */
//Training section for fetching some data to site and formatting tables:
/*Variables:
let -only available inside the block where they're defined
var -available throught the function in which they're declared
https://sentry.io/answers/difference-between-let-and-var-in-javascript/
*/

/*Original event handlers, issue with these was that they called configured function every time page loaded.
//Event listeners for station dropdown -menu and search without setting constants:
document.getElementById("stationDropDown").addEventListener('onchange', initializeLoad("dropdown"));
document.getElementById("stationSearchButton").addEventListener('click', initializeLoad("searchbutton"));
*/

//Initialize targetStation -variable here, so it can be used on all functions.
targetStation = "";

//Preformatted string for if clauses, which contains selected entries:
//Used when picking entries to table with loaddata()
selectedDataIfClause = "";

//Variable to store last changed element, so browser knows whether to use dropdown menu's or search box's
//input when e.g. radio buttons are changed.
lastChanged = "dropdown";

/*Initialize checkboxex boolean values here
initializeLoad -function sets then to actual values for each round
and populatetable -function makes table's headings according to these.
*/
arrivedBoolean = false;
arrivingBoolean = false;
departedBoolean = false;
departingBoolean = false;
nonStoppingBoolean = false;

//Event handler function calls encapsulated in anymous function calls, so they aren't called automatically every time that page loads:
//Listener for Dropdown -menu:
document.getElementById("stationDropDown").addEventListener('change', function() {
  lastChanged="dropdown";
  initializeLoad(lastChanged);
});
//Listener for search -box:
document.getElementById("stationSearchButton").addEventListener('click', function() {
  lastChanged="searchbutton";
  initializeLoad(lastChanged);
});
//Event listener for radio buttons:
var radioButtons = document.getElementsByName("howManyToFetch");
radioButtons.forEach(function(radioButton) {
  radioButton.addEventListener('click', function() {
    initializeLoad(lastChanged);
  });
});
//Eventlistener to load data when page is loaded:
document.addEventListener('DOMContentLoaded', () => {
  initializeLoad("dropdown");
});

//Variable where if statement can check if interval is already running:
let intervalForCheckboxes = 0;
const initialcheckboxdelay = 1500;
checkBoxDelayAmount = initialcheckboxdelay;
//Event listener that starts delay function for checkboxes or resets delay to 1,5s in case, delay timer is already running:
document.getElementById("checkBoxes").addEventListener('click', function() {
    //If interval isn't set:
    if (intervalForCheckboxes == 0) {
      /*Story: I implemented this with setInterval because javascript didn't stop at setTimeout() 
      For delay, there was also resource intensive for -loop option available which kept javascript occupied
      by running loop for waiting time, until set time come. That seemed inappropriate.*/

      //Call checkboxdelay function every 100ms:
      intervalForCheckboxes = setInterval(checkboxdelay,100);
      //console.log("intervalForCheckboxes after setting: "+ intervalForCheckboxes)
    } else {
      //console.log("Timeout reset")
      //reset delay back to 1 second:
      checkBoxDelayAmount = initialcheckboxdelay;
    }

});

function checkboxdelay() {
  //console.log("Checkbox delay amount at start of checkboxdelay: "+checkBoxDelayAmount)
  if (checkBoxDelayAmount == 100) {
    //console.log("CheckboxDelayAmount 100")
      //Seems unnecessary: //Set delay to 0, so event listener knows to start new interval in case of checkbox clicks:
      //Seems unnecessary: checkBoxDelayAmount = 0
    //Remove current interval:
    clearInterval(intervalForCheckboxes);
    //This variable gets set to 2 by timer setting, setting this back to 0 enables event listener to start new delay in case of checkbox clicks:
    intervalForCheckboxes = 0;
    //console.log("intervalForCheckboxes after clearing: "+ intervalForCheckboxes)
    //Initialize loading of data mentioned in dropdown/seachbox:
    initializeLoad(lastChanged);
    //Reset checkbox delay:
    checkBoxDelayAmount = initialcheckboxdelay;
  } else if (checkBoxDelayAmount > 100) {
    //console.log("CheckboxDelayAmount over 100");
    checkBoxDelayAmount = checkBoxDelayAmount -100;
  } else {
    console.log("Something unplanned on checkboxdelay -function.");
    //console.log("Checkbox delay amount: "+checkBoxDelayAmount);
  }
}

//Function to set parameters right for loading data.
//Renamed following, so it doesn't run all the time and started developing data parsing on separate function:

function initializeLoad(fromwhere) {
  var fetchcount = 0;
  checkboxwhitening();
  //Query's base address, which is common to all station queries:
  urlbasePerStation = "https://rata.digitraffic.fi/api/v1/live-trains/station/";
  if (fromwhere == "dropdown") {
    //Get dropdown menu's value (Station code):
    targetStation = document.getElementById("stationDropDown").value;
  } else if (fromwhere == "searchbutton") {
    //get textbox's entry:
    targetStation = document.getElementById("stationsearch").value;
    //Search entries in JSON:
    //https://rata.digitraffic.fi/api/v1/metadata/stations (107kb)
  } else {
    console.log("initializeLoad " +fromwhere+" didn't get correct arguments.");
    return false;
    }
  //Get entries to fetch:
  //fetchcount = document.getElementsByName("howManyToFetch").values;

  //FETCHCOUNT limits: 1-600
  var radioButtons = document.getElementsByName("howManyToFetch");
  //For -loop which goes through radio buttons and get's checked radio button's value:
  for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
        fetchcount = radioButtons[i].value;
        //Exit loop when checked radio button found:
        break;
    }
  }
  //List of train  categories, in case if needed: https://rata.digitraffic.fi/api/v1/metadata/train-categories

  //Variable to make sure that even something is selected before proceeding with fetching:
  proceed = false;

  //Make variable for url part which length's verification is easy and can be left empty if concerning checkbox is unchecked:
  //First, set each fetch -setting to 0:
  arrivedComponent = "?arrived_trains=0";

  //Get checkboxes state to know, what/how many of each to fetch:
  arrivedBoolean = document.getElementById("CheckboxGroup1_0").checked;
  //...And if entry data in question is requested, take amount to fetch from radio button's options and modify request URL accordingly:
  if (arrivedBoolean) {
    arrivedComponent = "?arrived_trains="+fetchcount;
    proceed = true;
  }
  arrivingComponent = "&arriving_trains=0";
  arrivingBoolean = document.getElementById("CheckboxGroup1_1").checked;
  if (arrivingBoolean) {
    arrivingComponent = "&arriving_trains="+fetchcount;
    proceed = true;
  }
  departedComponent = "&departed_trains=0";
  departedBoolean = document.getElementById("CheckboxGroup1_2").checked;
  if (departedBoolean) {
    departedComponent = "&departed_trains="+fetchcount;
    proceed = true;
  }
  departingComponent = "&departing_trains=0";
  departingBoolean = document.getElementById("CheckboxGroup1_3").checked;
  if (departingBoolean) {
    departingComponent = "&departing_trains="+fetchcount;
    proceed = true;
  }
  nonstoppingComponent = "&include_nonstopping=0";
  nonStoppingBoolean = document.getElementById("CheckboxGroup1_4").checked;
  if (nonStoppingBoolean) {
    nonstoppingComponent = "&include_nonstopping=1";
  }

  fetchurl = urlbasePerStation+targetStation+arrivedComponent+arrivingComponent+departedComponent+departingComponent+nonstoppingComponent;
  //console.log(fetchurl)

  //In production version, fetchurl goes as datafetch's parameter:
  if (proceed) {
    datafetch();
  } else {
    checkboxerror();
  }
}

function checkboxerror() {
  document.getElementById("checkboxErrorOutput").innerHTML = "Select at least one datatype to fetch.";
  errorElements = document.querySelectorAll("checkboxErrorGroup");
  errorElements.forEach(function(element){
  element.classList.add("checkboxErrorOverlay");
});
}
function checkboxwhitening() {
  document.getElementById("checkboxErrorOutput").innerHTML = "";
  errorElements = document.querySelectorAll("checkboxErrorGroup");
  errorElements.forEach(function(element){
  element.classList.remove("checkboxErrorOverlay");
});
}

//Function to actually fetch data from server:
//Async when fetching from web.
function datafetch() {
  //When playing with production data, make this function to expect string as input and give that string as parameter to next line instead of sample data.
  
  //Choose sample or production data:
  fetch('Datasample_short.json')
  //fetch(fetchurl);
  
  .then(response => {
    if (!response.ok) {
      throw new Error('Sample file loading was not ok');
    }
    return response.json();
  })
  .then(jsonData => {
    loadData(jsonData);
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
}

/*Function to load data to array.
Originally this function was used to put tata into table,
but i needed way to order trains by departure time so array offered simple -sounding solution to that.
Because of this, there might be out of context comments.*/
function loadData(inputdata) {
  //Save station's name which's info has processed most recently:
  lastStation ="";
  lastCommuterLineID ="";
  //Make array for timetable entries:
  timetableEntries = [];
  currentObj = 0;
  //Following iterates through every object in data and returns train number and other data on same level:
  inputdata.forEach(obj => {
    //Save amount of timetablerows on train, so even last times get pushed into timetablerow's subarray:
    timeTableRows = obj.timeTableRows.length;
    //Start counting rows from 1 as timeTableRows also starts from 1.
    currentRow = 1;

    /*In order to get both arrival and departure to same subarray (timetable row) i needed to implement comparison mechanism which persists between timetable rows:*/
    //Initialize new subarray for timetable-entry:
    ttEntry = [];

    //Initialize dynamic subarray numbers:
    window['iteratedArray'+currentObj+currentRow] = [];

    //This iterates through each subentry called "timeTableRows":
    //noStopMarket -variable is for putting only one yes/no at start of array whether train stops in station:
    stoppingIndicatorEnabled = true;
    obj.timeTableRows.forEach(ttrow => {

      console.log("Last array at start of ttrow: "+window['iteratedArray'+currentObj+currentRow]);
      
      //console.log("Row: "+ currentRow + ", obj version: " + obj.version+ " Scheduled time: "+ttrow.scheduledTime)
      saveAtEnd = false;
      station = ttrow.stationShortCode;
      type = ttrow.type;
      //Save timetablerow's array to main array if station has changed since.
      //Reset laststation, train's potential letter and subarray.
      if (lastStation.length >0 && lastStation != station) {
        //console.log(lastStation)
        //This clause saves train's letter or "---" and train's final destination to array.
        if (lastCommuterLineID.length == 0) {
          window['iteratedArray'+currentObj+currentRow-1].push("---");
        } else {
          window['iteratedArray'+currentObj+currentRow-1].push(lastCommuterLineID);
        }
        //Make temporary array from current train's timetable rows to get final destination station:
        var keys = obj.timeTableRows;
        //Take current timetables last entry:
        window['iteratedArray'+currentObj+currentRow].push(keys[keys.length -1].stationShortCode);
        timetableEntries.push(window['iteratedArray'+currentObj+currentRow]);
        console.log("timetableEntries after saved window['iteratedArray'+currentObj+currentRow]: "+timetableEntries);
        //Empty lastStation -variable so next round of this loop checks nonstoppingBoolean and gives output accordingly:
        lastStation="";
        lastCommuterLineID = "";
        stoppingIndicatorEnabled = true;
      } else {
          //Checks if this is last round of timetablerows:
          if (currentRow == timeTableRows) {
            saveAtEnd = true;
          }
        //Put "Yes/no" to subarrays first entry, if non-stopping trains are selected:
        console.log("Currentrow + object ennen herjaa: "+currentRow+" "+currentObj);
        if (station == targetStation && stoppingIndicatorEnabled) {
          if (ttrow.commercialStop) {
            window['iteratedArray'+currentObj+currentRow].push("Yes.");
            stoppingIndicatorEnabled=false;
          } else {
          window['iteratedArray'+currentObj+currentRow].push("No.");
          stoppingIndicatorEnabled=false;
          }
        }

        if (arrivingBoolean && station == targetStation && type == "ARRIVAL" && (ttrow.commercialStop || nonStoppingBoolean)) {
          console.log("Arrivingboolean triggasi, trigannut ttrow:");
          console.log(ttrow);
          //Get timedata from JSON to variable:
          timestamp = ttrow.scheduledTime;
          //Make new date object out of it, date object usage also automatically converts time to local time.:
          //Date object is milliseconds since epoch, so it's easy to compare
          var arrivalTime = new Date(timestamp);
          //Get hours and minutes from date -object:
          //var hours = date.getHours();
          //var minutes = date.getMinutes();
          console.log(arrivalTime);
          window['iteratedArray'+currentObj+currentRow].push(arrivalTime);
          lastStation = station;
        }

        if (departingBoolean && station == targetStation && type == "DEPARTURE" && (ttrow.commercialStop || nonStoppingBoolean)) {
          console.log("Departingboolean triggasi, trigannut ttrow:");
          console.log(ttrow);
          timestamp = ttrow.scheduledTime;
          var departureTime = new Date(timestamp);
          console.log(departureTime);
          window['iteratedArray'+currentObj+currentRow].push(departureTime);
          lastStation = station;
        }
        lastCommuterLineID = obj.commuterLineID;
      }
      //Saving for timetablerow's last row as there's no next round to save previous round's values:
      if (saveAtEnd && window['iteratedArray'+currentObj+currentRow].length > 0) {
        console.log("Saveatend triggered");
        console.log(window['iteratedArray'+currentObj+currentRow].length);
        //This clause saves train's letter or "---" and train's final destination to array.
        if (obj.commuterLineID.length == 0) {
          window['iteratedArray'+currentObj+currentRow].push("---");
        } else {
          window['iteratedArray'+currentObj+currentRow].push(obj.commuterLineID);
        }
        //Make temporary array from current train's timetable rows to get final destination station:
        var keys = obj.timeTableRows;
        //Take current timetables last entry:
        window['iteratedArray'+currentObj+currentRow].push(keys[keys.length -1].stationShortCode);
        timetableEntries.push(window['iteratedArray'+currentObj+currentRow]);
        //Empty lastStation -variable so next round of this loop checks nonstoppingBoolean and gives output accordingly:
        lastStation="";
      }
      currentRow +=1;
    }); //This line is end of ttrow -loop.
    currentObj += 1;
  });
//console.log(timetableEntries)
  //Sort array's contents by time:
  //This compares every pair of first entries in subarrays.
  //timetableEntries.sort((a, b) => a[1] - b[1]);

  console.log("This was going to populatetable: "+timetableEntries);
  //Finally, call function to put array's data to table:
  //populatetable(timetableEntries)
}
//Function to output array's contents to HTML table.
function populatetable(dataarray) {
  //console.log(dataarray)
  
  //Define different table's components:
  const targetdiv = document.getElementById('contentbyscript');
  const Table = document.createElement('table');
  //Table's heading -part:
  const TableHead = document.createElement('thead');
  const TableBody = document.createElement('tbody');
  const TableHeadingRow = document.createElement('tr');
  //Table's heading cells:
  const doesTrainStop = document.createElement('th');
  const ArrivedTime = document.createElement('th');
  const ArrivingTime = document.createElement('th');
  const DepartedTime = document.createElement('th');
  const DepartureTime = document.createElement('th');

  const TrainLetter = document.createElement("th");
  const TrainDestination = document.createElement("th");

//Create needed heading -columns to table:
if (nonStoppingBoolean) {
  doesTrainStop.textContent="Stopping?";
  TableHeadingRow.appendChild(doesTrainStop);
}
if (arrivedBoolean) {
  ArrivedTime.textContent ="Arrived";
  //Append heading column:
  TableHeadingRow.appendChild(ArrivedTime);
}
if (arrivingBoolean) {
  ArrivingTime.textContent = "Arriving";
  TableHeadingRow.appendChild(ArrivingTime);
}
if (departedBoolean) {
  DepartedTime.textContent = "Departed";
  TableHeadingRow.appendChild(DepartedTime);
}
if (departingBoolean) {
  DepartureTime.textContent ="Departure";
  TableHeadingRow.appendChild(DepartureTime);
}

TrainLetter.textContent = "Line";
TrainDestination.textContent ="Destination";
TableHeadingRow.appendChild(TrainLetter);
TableHeadingRow.appendChild(TrainDestination);
//Put row created in previous step to table heading -element:
TableHead.appendChild(TableHeadingRow);
//Put created table heading -section to table:
Table.appendChild(TableHead);

//Rolling number for dynamic variables to create new element for each table row and cell:
tableRowNum = 0;
tableColumnNum = 0;


/*
Boolean values used: 
nonStoppingBoolean
arrivedBoolean
arrivingBoolean
departedBoolean
departingBoolean
*/
  //Following iterates through every object in data-array and returns train number and other data on same level:
  dataarray.forEach(obj => {

    //Start row processing by generating unique id to row:
    //Use iteratedTableRow to generate new rows to table:
    window['iteratedTableRow'+tableRowNum] = document.createElement('tr');
    //console.log(obj); // This will log each object individually
    // If you want to access specific properties of each object, you can do so like this:
    //console.log(obj.timeTableRows); // Replace propertyName with the actual property name you want to access
    console.log(dataarray);
    console.log(obj.length);

    if (nonStoppingBoolean) {
      window['iteratedTableColumn'+tableColumnNum].textContent = obj[0];
      window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
      //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
      tableColumnNum ++;
    }
    if (arrivedBoolean) {
      window['iteratedTableColumn'+tableColumnNum].textContent = obj[1];
      //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
      window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes;
      window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
      //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
      tableColumnNum ++;
    }
    if (arrivingBoolean) {
      window['iteratedTableColumn'+tableColumnNum].textContent = hours;
      //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
      window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes;
      window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
      //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
      tableColumnNum ++;
    }
    if (departedBoolean) {
      window['iteratedTableColumn'+tableColumnNum].textContent = hours;
      //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
      window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes;
      window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
      //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
      tableColumnNum ++;
    }
    if (departingBoolean) {
      window['iteratedTableColumn'+tableColumnNum].textContent = hours;
      //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
      window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes;
      window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
      //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
      tableColumnNum ++;
    }
    //Columns made with rolling number:
    //"window" packages given string and variable's value as string name, so it suits well this use case.
    window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');
    //Parse array entry's time to nice format:
    var hours = obj[0].getHours();
    var minutes = obj[0].getMinutes();
    //Add leading zero to minutes if minute -value < 10
    minutes = minutes < 10 ? "0" + minutes : minutes;

    window['iteratedTableColumn'+tableColumnNum].textContent = hours;
    //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
    window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes;
    window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
    //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
    tableColumnNum ++;
    //console.log("TableColumnNum plussauksen jälkeen: " + tableColumnNum)

    //This is basically new variable, so it's necessary to set this each time separately:
    window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');
    window['iteratedTableColumn'+tableColumnNum].textContent = obj[1];
    window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
    tableColumnNum ++;
    window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');
    /*Last row of timetablerows could be good and simple to put into table as destination.
    There's problem, that commuter trains have only one timetable for day's all trips.
    Long distance trains timetable seems to end on last stop.
    For that, i take all timetable's entries into array and take last of them:*/
    window['iteratedTableColumn'+tableColumnNum].textContent = obj[2];
    window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum]);
    tableColumnNum ++;

    //And row to Table body:
    TableBody.appendChild(window['iteratedTableRow'+tableRowNum]);
    //console.log("Appendin jälkeen: " + window['iteratedTableRow'+tableRowNum].textContent + "Rnro:" + tableRowNum)      
    
    //console.log("Appendin jälkeen, ennen lisäystä: " + window['iteratedTableRow'+tableRowNum].textContent + "Rnro:" + tableRowNum)
    tableRowNum ++;
  });
  //Add table body to table:
Table.appendChild(TableBody);

//Clear target div before appending table:
targetdiv.innerHTML = "";
//Finally, inject table to target div:
targetdiv.appendChild(Table);
}
