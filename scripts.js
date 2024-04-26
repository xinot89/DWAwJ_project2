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

//Storage for fetched data, so no new fetch is necessary when sorting data:
//Used by populateTable -function.
dataarrayStore = []

//Dropdown menu for selecting sorting order:
var sortorder = document.getElementById("sortSelectionDropdown");
//console.log(sortorder.value);
//console.log(sortorder.selectedIndex);
//Variable to store populatetable's sorting order:
/*
0: departures, ascending
1: departures, descending
2: arrivals, ascending
3: arrivals, descending */
//Original sortorder -variable before dropdown:
//sortorder = 0;

//Event handler function calls encapsulated in anymous function calls, so they aren't called automatically every time that page loads:
//Listener for Dropdown -menu:
document.getElementById("stationDropDown").addEventListener('change', function() {
  lastChanged="dropdown";
  initializeLoad(lastChanged);
});

//Event listener for dropdown menu to make populatetable sort entries again:
//Sets also sortorder back to ex. departures, trying to sort with arrivals with only departures selected.
document.getElementById("sortSelectionDropdown").addEventListener('change', function() {
  if (-1 < sortorder.value && sortorder.value < 2 && departingBoolean == false) {
    sortorder.selectedIndex = 2;
  } else if (sortorder.value > 1 && sortorder.value < 4 && arrivingBoolean == false) {
    sortorder.selectedIndex = 0;
  }
  populatetable(["Sortrequest"])
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
//Developed originally when there was 4 options so quite futile now.
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

  //24.4.2024: Removed arrived/departed selections from page as their value add is questionable.
  //arrivedBoolean = document.getElementById("CheckboxGroup1_0").checked;
  arrivedBoolean = false;
  //...And if entry data in question is requested, take amount to fetch from radio button's options and modify request URL accordingly:
  if (arrivedBoolean) {
    arrivedComponent = "?arrived_trains="+fetchcount;
    proceed = true;
  }
  arrivingComponent = "&arriving_trains=0";
  arrivingBoolean = document.getElementById("CheckboxGroup1_1").checked;
  //Set sorting by selected data if it's set to unselected data:
  //Sortorder 0-1: departures
  //Change sort order to "Arrivals, ascending" if sorting by departures is selected but departures aren't fetched:
  if (-1 < sortorder.value && sortorder.value < 2 && departingBoolean == false) {
    sortorder.selectedIndex = 2;
  }
  if (arrivingBoolean) {
    arrivingComponent = "&arriving_trains="+fetchcount;
    proceed = true;
  }
  departedComponent = "&departed_trains=0";
  //departedBoolean = document.getElementById("CheckboxGroup1_2").checked;
  departedBoolean = false;
  if (departedBoolean) {
    departedComponent = "&departed_trains="+fetchcount;
    proceed = true;
  }
  departingComponent = "&departing_trains=0";
  departingBoolean = document.getElementById("CheckboxGroup1_3").checked;
  //Set sorting by selected data if it's set to unselected data:
  //Sortorder 2-3: arrivals
  //Change sort order to "Departures, ascending" if sorting by arrivals is selected but arrivals aren't fetched:
  if (sortorder.value > 1 && sortorder.value < 4 && arrivingBoolean == false) {
    sortorder.selectedIndex = 0;
  }
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
  timetableEntries = [];
  //Last station's code to compare between timetable runs.
  //Each data addition sets these to one it's currently processing: 
  lastStation = "noHitsYet";
  lastTrainLetter = "";
  lastTrainDestination ="";

  inputdata.forEach(obj => {
    //Following integer helps timetablerows to recognize, if it's last run or not, so those train letters and destinations come to even last entries:
    //length starts from 1.
    timetablerow = 1;
    //variable which makes loop save train letter and destination to last entry:
    saveOnLast = false;
    //Variable to indicate if there is saved times at array so we won't get excess train letters and destinations in array:
    savedTimes=false;
    //Variable to set boolean value on each train if there's stop on targetStation.
    stoppingIndicatorNotInserted = true;
    obj.timeTableRows.forEach(ttrow => {
      //Define timetable event type:
      type = ttrow.type;
      //If station of interest is last, save train letter and destination:
      if (ttrow.stationShortCode == targetStation && timetablerow == obj.timeTableRows.length && savedTimes) {
        console.log("SaveOnLast triggered")
        saveOnLast = true
      }
      //Station code for comparison below:
      currentStation = ttrow.stationShortCode;
      //For each timetablerow, we first check that is this continuing old entry or completely new entry.
      if (savedTimes && lastStation != currentStation) {
        //Save last train letter and destination only if there has been previous run.
        if (lastStation.length >0) {
          if (lastTrainLetter.length == 0) {
            timetableEntries.push("---");
          } else {
            timetableEntries.push(lastTrainLetter);
          }
          timetableEntries.push(lastTrainDestination);
        }
        //Save separator to array:
        timetableEntries.push("NEWTRAIN_6b9d87b08a2ee")
        savedTimes = false;
      }
      if (currentStation == targetStation && stoppingIndicatorNotInserted) {
        if (ttrow.commercialStop) {
          timetableEntries.push("Yes.");
          stoppingIndicatorNotInserted=false;
        } else {
        timetableEntries.push("No.");
        stoppingIndicatorNotInserted=false;
        }
      }
      if (arrivingBoolean && currentStation == targetStation && type == "ARRIVAL") {
        //Get timedata from JSON to variable:
        timestamp = ttrow.scheduledTime;
        //Make new date object out of it, date object usage also automatically converts time to local time.:
        //Date object is milliseconds since epoch, so it's easy to compare
        var arrivalTime = new Date(timestamp);
        //Get hours and minutes from date -object:
        //var hours = date.getHours();
        //var minutes = date.getMinutes();
        timetableEntries.push(arrivalTime);
        lastStation = currentStation;
        savedTimes = true;
      } else if (departingBoolean && currentStation == targetStation && type == "DEPARTURE") {
        timestamp = ttrow.scheduledTime;
        var departureTime = new Date(timestamp);
        timetableEntries.push(departureTime);
        lastStation = currentStation;
        savedTimes = true;
      }
      lastTrainLetter = obj.commuterLineID;
      lastTrainDestination = obj.timeTableRows[obj.timeTableRows.length-1].stationShortCode;
        
      if (saveOnLast && savedTimes) {
        //Save last train letter and destination only if there is saved times.
        if (lastTrainLetter.length == 0) {
          timetableEntries.push("---");
        } else {
          timetableEntries.push(lastTrainLetter);
        }
        timetableEntries.push(lastTrainDestination);
      }
      timetablerow +=1;
      //Following line is end of ttrow -loop.
    });
  });
//console.log(timetableEntries)
  //Sort array's contents by time:
  //This compares every pair of first entries in subarrays.
  //timetableEntries.sort((a, b) => a[1] - b[1]);

  //Make sure that populatetable's dataarrayStore is empty, before it ads current data to it:
  dataarrayStore.length = 0;
  //Finally, call function to put array's data to table:
  populatetable(timetableEntries)
}
//Function to output array's contents to HTML table.
function populatetable(dataarray) {
  var arrayOfArrays = [];
  if (dataarray[0]=="Sortrequest") {
    //console.log("Sorting request received");
    //Fill arrayOfArrays with stored data:
    arrayOfArrays = dataarrayStore;
  } else {
    //This block was originally start of function, until i started developing sorting.
    /*Originally i meant to use flat array as input for this function, which i then swapped to subarray -structure
    and back to flat array when it started feel too complex. Now i again try on this function to split input array to 
    subarrays for sorting purposes.*/
    //Split input array to subarrays:
    const separator = "NEWTRAIN_6b9d87b08a2ee"
    
    var startIndex = 0;

    for (var i = 0; i < dataarray.length; i++) {
        if (dataarray[i] === separator) {
            // Slice the flat array from startIndex to i and push it to arrayOfArrays
            arrayOfArrays.push(dataarray.slice(startIndex, i));
            //Put processed data to side for potential sorting requests:
            dataarrayStore.push(dataarray.slice(startIndex, i));
            // Update the startIndex to the next element after the separator
            startIndex = i + 1;
        }
    }
  }
//Define where dates are by selections:
  if (departingBoolean) {
    departuresPosition = 1;
    if (arrivingBoolean) {
      arrivalsPosition = 2;
    } else {
      //Put something to integer so if statement below won't produce errors with potential empty variables:
      arrivalsPosition = 99;
    }
  } else {
    if (arrivingBoolean) {
      arrivalsPosition = 1;
    } else {
      console.log("Populatetable didn't find selected departures or arrivals.")
    }
  }
//Sort arrays by wanted sorting order:
//0: departures, ascending:
if (sortorder.value == 0) {
  arrayOfArrays.sort((a, b) => a[departuresPosition] - b[departuresPosition]);
//1: departures, descending:
} else if (sortorder.value == 1) {
  arrayOfArrays.sort((b, a) => a[departuresPosition] - b[departuresPosition]);
//2: arrivals, ascending:
} else if (sortorder.value == 2) {
  arrayOfArrays.sort((a, b) => a[arrivalsPosition] - b[arrivalsPosition]);
//3: arrivals, descending:
} else if (sortorder.value == 3) {
 arrayOfArrays.sort((b, a) => a[arrivalsPosition] - b[arrivalsPosition]);
} else {
  console.log("Populatetable didn't get correct sort order parameter.")
}

  //Define different table's components:
  const targetdiv = document.getElementById('contentbyscript');
  const Table = document.createElement('table');
  //Table's heading -part:
  const TableHead = document.createElement('thead');
  const TableBody = document.createElement('tbody');
  const TableHeadingRow = document.createElement('tr');
  //Table's heading cells:
  const doesTrainStop = document.createElement('th');
  //const ArrivedTime = document.createElement('th');
  const ArrivingTime = document.createElement('th');
  //const DepartedTime = document.createElement('th');
  const DepartureTime = document.createElement('th');

  const TrainLetter = document.createElement("th");
  const TrainDestination = document.createElement("th");

//Create needed heading -columns to table:
if (nonStoppingBoolean) {
  doesTrainStop.textContent="Stopping?";
  TableHeadingRow.appendChild(doesTrainStop);
}
/*if (arrivedBoolean) {
  ArrivedTime.textContent ="Arrived";
  //Append heading column:
  TableHeadingRow.appendChild(ArrivedTime);
}*/
if (arrivingBoolean) {
  ArrivingTime.textContent = "Arriving";
  TableHeadingRow.appendChild(ArrivingTime);
}
/*if (departedBoolean) {
  DepartedTime.textContent = "Departed";
  TableHeadingRow.appendChild(DepartedTime);
}*/
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

//Rolling number for cells which got their contents via dynamix variables.
tableComponentNumber = 0;
//Rolling number for table content rows.
//Needs to be separate from cells because othervise all cells would be appended to one line.
tableRowNumber = 0;

//Used for making new row element at start of loop:
firstloop = true;
console.log("Loopit alkaa.")
arrayOfArrays.forEach(arrayEntries => {
  /*Declare variable here, so it provides usable data for
  TableBody.appendChild(window['iteratedTableRow'+tableRowNumber]);
  Whether to save row or not.*/
  rowOfInterest = true;
  arrayEntryNumber = 0;
  secondDate = false
    //Following iterates through every object in data-array and returns train number and other data on same level:
    arrayEntries.forEach(obj => {
      console.log(obj);
      //If subarray has been marked uninteresting, we may skip it's processing:
      if (rowOfInterest) {
        if (firstloop) {
          //Create new row -element for first row of data:
          window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
          firstloop = false;
        }
        //Yes/no if non-stopping trains have been selected:
        if (arrayEntryNumber == 0) {
          console.log("Ehto 1");
          if (nonStoppingBoolean) {
            window['iterated'+tableComponentNumber] = document.createElement('td');
            window['iterated'+tableComponentNumber].textContent = obj;
            window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
            tableComponentNumber ++;
          } 
          arrayEntryNumber ++;
        } else if (arrayEntryNumber == 1 || secondDate) {
          //Increment to arrayEntrynumber which sets to 0 on potential second run of this condition:
          arrayEntryIncrement = 1;
          //This condition is intended for train times.
          console.log("Ehto 2");
          if (secondDate) {
            //In case this condition is run again by secondDate, set arrayentrynumber 1 step back so remaining conditions can run:
            arrayEntryIncrement = 0;
          //if this condition is run again by secondDate, reset it:
          secondDate = false;
          }

          hours = obj.getHours();
          minutes = obj.getMinutes();
          //Add leading zero to minutes if minute -value < 10
          minutes = minutes < 10 ? "0" + minutes : minutes;
          window['iterated'+tableComponentNumber] = document.createElement('td');
          window['iterated'+tableComponentNumber].textContent = hours;
          window['iterated'+tableComponentNumber].textContent += ":"+minutes;
          window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
          tableComponentNumber +=1;
          //Check if next obj is also timestamp:
          if (arrayEntries[arrayEntryNumber+1] instanceof Date) {
            console.log("Seuraava entry on date.")
            secondDate = true;
          }

          arrayEntryNumber = arrayEntryNumber + arrayEntryIncrement;
        } else if (arrayEntryNumber > 1 && obj!="NEWTRAIN_6b9d87b08a2ee") {
          console.log("Ehto 3");
          window['iterated'+tableComponentNumber] = document.createElement('td');
          window['iterated'+tableComponentNumber].textContent = obj;
          window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
          tableComponentNumber +=1;
          arrayEntryNumber ++;
        } else {
          console.log("Ehto 4");
          TableBody.appendChild(window['iteratedTableRow'+tableRowNumber]);
          tableRowNumber += 1;
          window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
        }
      }
    });
    //If subarray had relevant data, append row to table body:
    if (rowOfInterest) {
      TableBody.appendChild(window['iteratedTableRow'+tableRowNumber]);
    }
    //Increment table row number for next round:
    tableRowNumber ++;
    //Create new row element with new number for next line:
    window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
  });
    //Add table body to table:
  Table.appendChild(TableBody);

//Clear target div before appending table:
targetdiv.innerHTML = "";
//Finally, inject table to target div:
targetdiv.appendChild(Table);
}
