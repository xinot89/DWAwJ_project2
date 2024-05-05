/* Aletaan pusertamaan seuraavalla eteenpäin:
https://www.digitraffic.fi/en/railway-traffic/

Finnish documentation:
https://www.digitraffic.fi/rautatieliikenne/

Train types:
https://rata.digitraffic.fi/api/v1/metadata/train-types

Station codes:
https://rata.digitraffic.fi/api/v1/metadata/stations
*/

//Eventlistener to load data when page is loaded:
document.addEventListener('DOMContentLoaded', () => {
  //Clear also textbox when page is refreshed/loaded:
  document.getElementById("stationsearch").value="";
  //Load auxiliary data automatically on page load: (Stations and train types)
  datafetch("Pageload");
  //Load automatically preselected station's times:
  //Moved automatic page load function call from here to end of datafetch's auxiliary data part.
});

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

//Initialize targetStation -variable here, so it can be used on all functions.
targetStation = "";

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
//Selection of non-passenger trains. This takes initial value on page load:
nonPassengerTrainBoolean = document.getElementById("CheckboxGroup1_5").checked;
//Variable to hold array of train types, used in filtering:
trainTypes = null;
//Variable to hold train station data, datafetch fills, populatetable uses (and maybe initializeload)
trainStations = null;

//Storage for fetched data, so no new fetch is necessary when sorting data:
//Used by populateTable -function.
dataarrayStore = []

//array for station names for station suggestions:
stationNames = [];

//Dropdown menu for selecting sorting order:
const sortorder = document.getElementById("sortSelectionDropdown");
//Arrival and departure checkboxes:
const arrivalCheckbox = document.getElementById("CheckboxGroup1_1")
const departureCheckbox = document.getElementById("CheckboxGroup1_3")
//Variable to store populatetable's sorting order:
/*
0: departures, ascending
1: departures, descending
2: arrivals, ascending
3: arrivals, descending */
//Original sortorder -variable before dropdown:
//sortorder = 0;

//Variable where if statement can check if interval is already running:
let intervalForCheckboxes = 0;
const initialcheckboxdelay = 1000;
checkBoxDelayAmount = initialcheckboxdelay;
//Event listener that starts delay function for checkboxes or resets delay to 1s in case that, delay timer is already running:
//Developed originally when there was 4 time options so quite futile now.
document.getElementById("checkBoxes").addEventListener('click', function() {
    //Update Non-Passenger trains variable, others get updated in initializeLoad.
    nonPassengerTrainBoolean = document.getElementById("CheckboxGroup1_5").checked;
    //If interval isn't set:
    if (intervalForCheckboxes == 0) {
      /*Story: I implemented this with setInterval because javascript didn't stop at setTimeout() 
      For delay, there was also resource intensive for -loop option available which kept computer/javascript occupied
      by running loop for waiting time, until set time come. That seemed inappropriate.*/
      //Call checkboxdelay function every 100ms:
      intervalForCheckboxes = setInterval(checkboxdelay,100);
    } else {
      //If there's something on interval (ie. checkboxes are being clicked and "timer" is running" reset delay back to 1 second:
      checkBoxDelayAmount = initialcheckboxdelay;
    }
});

//Event listener for station search -box's button:
document.getElementById("stationSearchByNameButton").addEventListener('click', function() {
  dealWithStationSearch()
});

//I made this update suggestions on each keyup, didn't seem excessive resource intensive. CPU grap actually doesn't even move noticeably when generating suggestions.
document.getElementById("stationsearchByName").addEventListener('keyup', function() {
  //Get station search box's value as query:
  const searchSuggestionQuery = document.getElementById("stationsearchByName").value;

  //Set div to variable, where to place suggestions:
  const suggestionsTargetDiv = document.getElementById("searchSuggestions");
  //Empty previous suggestions first:
  suggestionsTargetDiv.innerHTML ="";
  //Number of suggestion, so each created HTML element gets appended, instead just last.
  var suggestionNumber = 0;
  //Change query's first letter to uppercase:
  const modSearchSuggestionQuery = searchSuggestionQuery[0].toUpperCase()+searchSuggestionQuery.slice(1);
  //Array to store suggestions:
  var suggestionArray = [];
  //Saves each filtered method to new array, where each entry has passed contidion includes(searchSuggestionQuery)
  suggestionArray = (stationNames.filter(entry => entry.startsWith(modSearchSuggestionQuery)));
  //Limits suggestion array's length:
  suggestionArray = suggestionArray.slice(0, 10);
  //Create HTML buttons for each suggestion in array, use incrementing numbers in their id's:
  suggestionArray.forEach(function(query) {
    //Create HTML button element.
    window['suggestionButton'+suggestionNumber] = document.createElement('button');
    //Set button's value to query's value:
    window['suggestionButton'+suggestionNumber].value = query;
    //Add text to button:
    window['suggestionButton'+suggestionNumber].textContent = query;
    //Set also class to these suggestion buttons, so their selection is easier on event listener listening them:
    window['suggestionButton'+suggestionNumber].classList.add("suggestionButtons");
    suggestionsTargetDiv.append(window['suggestionButton'+suggestionNumber]);
    suggestionNumber ++;
  });
  });
  //Event listener for search suggestions div:
document.getElementById("searchSuggestions").addEventListener('click', function() {
  //https://stackoverflow.com/questions/63199551/how-to-get-the-values-of-buttons-with-eventlistener
  const clickedButton = event.target;
  document.getElementById("stationsearchByName").value = clickedButton.value;
  dealWithStationSearch();
});

//Event handler function calls encapsulated in anymous function calls, so they aren't called automatically every time that page loads:
//Listener for Dropdown -menu:
document.getElementById("stationDropDown").addEventListener('change', function() {
  //Clear also textbox when dropdown is used:
  document.getElementById("stationsearch").value="";
  lastChanged="dropdown";
  initializeLoad(lastChanged);
});
//Listener for search -box:
document.getElementById("stationSearchButton").addEventListener('click', function() {
  lastChanged="searchbutton";
  initializeLoad(lastChanged);
});

//Event listener for dropdown menu to make populatetable sort entries again:
//Sets also sortorder back to departures, for example in case of trying to sort with arrivals with only departures selected.
//(And other way around)
document.getElementById("sortSelectionDropdown").addEventListener('change', function() {
  //If sortorder is set to departures, but departures aren't selected:
  if (-1 < sortorder.value && sortorder.value < 2 && departingBoolean == false) {
    //Select sorting by arrivals, descending:
    //sortorder.selectedIndex = 2;
    //Edit 30.4.2024: Fetch departures and set checkboxes accordingly:
    departureCheckbox.checked = true;
    arrivalCheckbox.checked = false;
    initializeLoad(lastChanged);
  } else if (sortorder.value > 1 && sortorder.value < 4 && arrivingBoolean == false) {
    //sortorder.selectedIndex = 0;
    arrivalCheckbox.checked = true;
    departureCheckbox.checked = false;
    initializeLoad(lastChanged);
  } else {
    //If required data is already loaded (ie: ascending-descending -swap) use readily loaded data instead of new query.
    populatetable(["Sortrequest"])
  }
});

//Event listener for radio buttons:
var radioButtons = document.getElementsByName("howManyToFetch");
radioButtons.forEach(function(radioButton) {
  radioButton.addEventListener('click', function() {
    initializeLoad(lastChanged);
  });
});

//Function to convert station search query into short code and search by that:
function dealWithStationSearch() {
  const searchQuery = document.getElementById("stationsearchByName").value;
  /*Here i used "find" method for array, then provided callback function to it. Item represents
  each array's entry one at a time and saves object into nameFoundFrom -variable if item meeting conditions has been found.*/
  var nameFoundFrom = trainStations.find(function(item) {
    return item.stationName === searchQuery;
  });
  if (nameFoundFrom) {
    // Get the index of the object, stored in variable.
    const nameFoundFromIndex = trainStations.indexOf(nameFoundFrom);
    lastChanged="searchbutton";
    document.getElementById("stationsearch").value=trainStations[nameFoundFromIndex].stationShortCode;
    initializeLoad(lastChanged);
  } else {
    console.error("Station name not found.");
  }
}

function checkboxdelay() {
  if (checkBoxDelayAmount == 100) {
      //Seems unnecessary: //Set delay to 0, so event listener knows to start new interval in case of checkbox clicks:
      //Seems unnecessary: checkBoxDelayAmount = 0
    //Remove current interval:
    clearInterval(intervalForCheckboxes);
    //This variable gets set to 2 by timer setting, setting this back to 0 enables event listener to start new delay in case of checkbox clicks:
    intervalForCheckboxes = 0;
    //Initialize loading of data mentioned in dropdown/seachbox:
    initializeLoad(lastChanged);
    //Reset checkbox delay:
    checkBoxDelayAmount = initialcheckboxdelay;
  } else if (checkBoxDelayAmount > 100) {
    checkBoxDelayAmount = checkBoxDelayAmount -100;
  } else {
    console.error("Something unplanned on checkboxdelay -function.");
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
    console.error("initializeLoad " +fromwhere+" didn't get correct arguments.");
    return false;
  }
  //Station setting for debug purposes:
  //targetStation = "HKI"
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
  arrivingBoolean = arrivalCheckbox.checked;
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
  departingBoolean = departureCheckbox.checked;
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
  //In production version, fetchurl goes as datafetch's parameter:
  if (proceed) {
    //1.5.2024: Added "Dummy", so datafetch's if statement goes into "else" -section which is normal fetch.
    datafetch("Dummy");
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
async function datafetch(startParameters) {
  //When playing with production data, make this function to expect string as input and give that string as parameter to next line instead of sample data.
  //Choose sample or production data:
  //fetch('Datasample.json')
  //Sample data from kouvola 26.4.2024 which produces errors cell/row changes:
  //fetch("Kouvola_sample.json")
  //Load data used by search and populatetable automatically on page load and timetable data when needed information is acquired.
  if (startParameters == "Pageload") {
    //Load station data:
    await fetch("https://rata.digitraffic.fi/api/v1/metadata/stations")
    .then(response => {
      if (!response.ok) {
        throw new Error('Station data loading was not ok.');
      }
      return response.json();
    })
    .then(jsonStationData => {
      trainStations = jsonStationData;
      trainStations.forEach(tempEntry => {
        //Include only those entries on search suggestions, which have passenger traffic:
        if (tempEntry.passengerTraffic) {
          stationNames.push(tempEntry.stationName);
        }
      });
    })
    .catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
    //Moved before time data load because otherwise times might get into the table before train types are loaded.
    //Functionality to get train types from api:
    //Used by populatetable.
    //Alternate approach to prevent getting "promises" in trainTypes.
    //Approach itself didn't work, but moving initializeLoad call to here from domcontentloaded -eventlistener worked.
    try {
    const response = await fetch("https://rata.digitraffic.fi/api/v1/metadata/train-types")
      if (!response.ok) {
        throw new Error('Train type -data loading was not ok');
      }
    const jsonTypeData = await response.json();
    trainTypes = jsonTypeData;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
    //Initial data load:
    initializeLoad("dropdown");
  } else {
    //Train/timetable data:
    await fetch(fetchurl)
    //fetch ("HKI_5.5.2024_debug2.json")
    
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
  //console.log(fetchurl)
}

/*Function to load data to array.*/
function loadData(inputdata) {
  //Array to store all entries of interest:
  timetableEntries = [];
  /* Store last station's code to compare between timetable runs.
  Each timetablerow sets this to one it's currently processing:
  Set laststation to visible value so that it's noticeable, if it pops out somewhere.
  Hasn't popped yet anywhere.*/ 
  lastStation = "";
  /*My implementation uses mostly same loop for timetablerows to do data saving to array and get data from source data.
  Previous train's station timetable is saved when new train's handling starts and if entry is last in source data, saveOnLast -boolean gets set and this function stores
  datas in array at the loop's end.*/
  lastTrainLetter = "";
  lastTrainDestination ="";
  lastCommercialTrack = 0;
  lastTrainType="";
  lastTrainNumber="";
  //Variables to store arrival and departure times until target station has passed, so we know whether to put real times in array or n/a:
  var delayedArrivalTime=null;
  var delayedDepartureTime=null;

  //Should we take track number from Arrival or departure data reading:
  //Modification 28.4.2024: Instead of 2 single if statements, now only 1 combined.
  //Both should yield same result point is not to get 2 track entries on array.
  //Could probably simplified even more by just initially setting to arrival and if departingBoolean is true, to departure.
  //....Probably this is completely unnecessary, as both departure and arrival should yield same track number, so whichever runs could save it.
  if (arrivingBoolean) {
    trackSaver="Arrival";
  } else if (departingBoolean) {
    trackSaver="Departure";
  }
  //This loop goes through each train's data:
  inputdata.forEach(obj => {
    //These variables are for mechanism to insert "---" in case of no departure entries:
    lacksArrival = true;
    lacksDeparture = true;
    //Indicator if target station has passed, so loop saves whatever it gots.:
    targetStationPassed = false;

    //Following integer helps timetablerows to recognize, if it's last entry of timetablerows or not, so also last timetable entries get train letters and destinations.
    //length starts from 1, so this is set to match it. Needs to be inside train loop that this gets resetted on every train.
    timetablerow = 1;

    //Following boolean is for Arrival/departure -time getting block so that they set saveonlast if loop is handling train's last timetable row:
    lastTimeTableRow = false;

    //variable which makes loop save train letter and destination to last entry:
    saveOnLast = false;
    //Variable to indicate if there is saved times at array so we won't get excess train letters and destinations in array:
    savedTimes=false;
    //Variable to set boolean value on each train if there's stop on targetStation.
    stoppingIndicatorNotInserted = true;

    //These set current train's data to variables that retain then, until we start processing next train's data or saveOnLast gets set:
    lastTrainLetter = obj.commuterLineID;
    lastTrainDestination = obj.timeTableRows[obj.timeTableRows.length-1].stationShortCode;
    lastTrainType = obj.trainType;
    lastTrainNumber = obj.trainNumber;
    //This loop starts processing invidual timetable rows:
    obj.timeTableRows.forEach(ttrow => {
      //Define timetable event type:
      type = ttrow.type;
      //If station of interest is last in timetablerows, use save functionality after all if clauses instead of next round's.
      if (ttrow.stationShortCode == targetStation && timetablerow == obj.timeTableRows.length) {
        lastTimeTableRow = true;
      }
      //Station code for comparison below:
      currentStation = ttrow.stationShortCode;
      //check if target station is passed:
      if (lastStation==targetStation && currentStation != targetStation) {
        /*Resetting also stopping indicator as some trains stop multiple times on same station.
        One example of this is T2241 which departs from Kouvola, goes to Kouvola tavara and then back to Kouvola.*/
        stoppingIndicatorNotInserted = true;
        targetStationPassed = true;
        if (obj.trainNumber==8663 && ttrow.stationShortCode =="HKI") {
          console.log(obj)
        }   
      }
      /*
      For each timetablerow, we first check that is this continuing old entry (savedTimes already present.
      or completely new entry. "lastStation != currentStation" is for recognizing that all times for
      target station are recorded and we can continue putting track, line-id, destination and train-id to array.
      Edit 28.4.2024: May cause glitches for table rendering if timetable includes target station twice.
      Problems especially with station "KV", train T2241, T2813 and T31206 when both, arrivals and departure is selected. 
      */
      if (savedTimes && lastStation != currentStation) {
        if (targetStationPassed) {
          //Reset targetStationPassed for next use:
          targetStationPassed = false;
          if (arrivingBoolean) {
            //Handle storing of arrival time.
            if (lacksArrival) {
              //Handle situation, if arrival time is unavailable.
              if (timetablerow == 2) {
                //If we're left target station at second timetable row and arrival time is requested but not recorded we may assume that train has begin it's journey from our station of interest. 
                timetableEntries.push("Line start")
              } else {
                //In other cases (not yet encountered) just state that arrival time is unavailable.
                timetableEntries.push("Arrival n/a");
              }
            } else {
              //If arrival time is available, put it into train's array as it is:
              timetableEntries.push(delayedArrivalTime);
              //Reset time variable to reduce likelihood of mixing up times:
              delayedArrivalTime=null;
              //5.5.2024: Added following to reset state of time acquirement due to cases where train starts and terminates from same station (e.g. P&I trains from/to Helsinki).
              lacksArrival=true;
            }
          }
          if (departingBoolean) {
            //This handles departure time saving.
            //Scenario where train terminates on station has purposefully omitted from here as those scenarios are handled by similar saving mechanism
            //on end of this loop which triggers if variables saveOnLast && savedTimes are set.
            if (lacksDeparture) {
              //If train has changed, but requested departure time hasn't been saved:
              timetableEntries.push("Departure n/a");
            } else {
            timetableEntries.push(delayedDepartureTime);
            delayedDepartureTime=null;
            //5.5.2024: Added following to reset state of time acquirement due to cases where train starts and terminates from same station (e.g. P&I trains from/to Helsinki).
            lacksDeparture=true;
            }
          }
          //Save track number data:
          if (trackSaver == "Departure" || trackSaver == "Arrival") {
            timetableEntries.push(lastCommercialTrack);
          }
        }        
        //Save last train letter and destination only if there has been previous run.
        if (lastStation.length >0) {
          if (lastTrainLetter.length == 0) {
            timetableEntries.push("-");
          } else {
            timetableEntries.push(lastTrainLetter);
          }
          timetableEntries.push(lastTrainDestination);
        }
        timetableEntries.push(lastTrainType);
        timetableEntries.push(lastTrainNumber);
        //Save separator to array:
        timetableEntries.push("NEWTRAIN_6b9d87b08a2ee")
        savedTimes = false;
      }

      if (arrivingBoolean && currentStation == targetStation && type == "ARRIVAL") {
        //Put Yes/no in start of array entry to indicate if this train stops on target station:
        if (stoppingIndicatorNotInserted) {
          if (ttrow.commercialStop) {
            timetableEntries.push("Yes.");
            stoppingIndicatorNotInserted=false;
          } else {
          timetableEntries.push("No.");
          stoppingIndicatorNotInserted=false;
          }
        }
        //Get timedata from JSON to variable:
        timestamp = ttrow.scheduledTime;
        //Make new date object out of it, date object usage also automatically converts time to local time.:
        //Date object is milliseconds since epoch, so it's easy to compare
        delayedArrivalTime = new Date(timestamp);
        //Moved to setting date object directly to used variable 29.4.2024, 9:34. was:delayedArrivalTime = arrivalTime;
        
        lacksArrival = false;
        if (trackSaver == "Arrival") {
          if (ttrow.commercialTrack.length==0) {
            lastCommercialTrack="n/a";
          } else {
            lastCommercialTrack = ttrow.commercialTrack;
          }
        }
        lastStation = currentStation;
        savedTimes = true;
        if (lastTimeTableRow) {
          saveOnLast = true;
        }
      } else if (departingBoolean && currentStation == targetStation && type == "DEPARTURE") {
        if (stoppingIndicatorNotInserted) {
          if (ttrow.commercialStop) {
            timetableEntries.push("Yes.");
            stoppingIndicatorNotInserted=false;
          } else {
          timetableEntries.push("No.");
          stoppingIndicatorNotInserted=false;
          }
        }
        timestamp = ttrow.scheduledTime;
        delayedDepartureTime = new Date(timestamp);
        //Moved to setting date object directly to used variable 29.4.2024, 9:34. was:delayedDepartureTime = departureTime;
        lacksDeparture = false;
        if (trackSaver == "Departure") {
          if (ttrow.commercialTrack.length==0) {
            lastCommercialTrack="n/a";
          } else {
            lastCommercialTrack = ttrow.commercialTrack;
          }
        }
        lastStation = currentStation;
        savedTimes = true;
        if (lastTimeTableRow) {
          saveOnLast = true;
        }
      } 

      if (saveOnLast && savedTimes) {     
        if (targetStationPassed || lastTimeTableRow) {
          //Reset targetStationPassed for next use:
          targetStationPassed = false;
          //Put "Not available" -entry to array if arrival/departure time is not available:
          if (arrivingBoolean) {
            if (lacksArrival) {
              timetableEntries.push("Arrival n/a");
            } else {
              timetableEntries.push(delayedArrivalTime);
              delayedArrivalTime=null;
            }
          }
          if (departingBoolean) {
            if (lacksDeparture) {
              if (lastTimeTableRow) {
                timetableEntries.push("Terminates")
              } else {
                timetableEntries.push("Departure n/a");
              }
            } else {
            timetableEntries.push(delayedDepartureTime);
            delayedDepartureTime=null;
            }
          }
          if (trackSaver == "Departure" || trackSaver == "Arrival") {
            timetableEntries.push(lastCommercialTrack);
          }
        }
        //Save last train letter and destination only if there has been previous run.
        if (lastStation.length >0) {
          if (lastTrainLetter.length == 0) {
            timetableEntries.push("-");
          } else {
            timetableEntries.push(lastTrainLetter);
          }
          timetableEntries.push(lastTrainDestination);
        }
        timetableEntries.push(lastTrainType);
        timetableEntries.push(lastTrainNumber);
        //Save separator to array:
        timetableEntries.push("NEWTRAIN_6b9d87b08a2ee")
        savedTimes = false;
        lastTimeTableRow = false;
      }
      timetablerow +=1;
      //Following line is end of ttrow -loop.
    });
  });
  //Make sure that populatetable's dataarrayStore is empty, before it ads current data to it:
  dataarrayStore.length = 0;
  //Finally, call function to put array's data to table:
  populatetable(timetableEntries)
}

//Function to output array's contents to HTML table.
async function populatetable(dataarray) {
  var arrayOfArrays = [];
  if (dataarray[0]=="Sortrequest") {
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
    trainNumberPosition = 6;
    if (arrivingBoolean) {
      arrivalsPosition = 1;
      departuresPosition = 2;
      trainNumberPosition = 7;
    } else {
      //Put something to integer so if statement below won't produce errors with potential empty variables:
      arrivalsPosition = 99;
      trainNumberPosition = 99;
    }
  } else {
    if (arrivingBoolean) {
      arrivalsPosition = 1;
      trainNumberPosition = 6;
    } else {
      console.error("Populatetable didn't find selected departures or arrivals.")
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
  } else if (sortorder.value == 4) {
    arrayOfArrays.sort((a, b) => a[trainNumberPosition] - b[trainNumberPosition]);
  } else if (sortorder.value == 5) {
    arrayOfArrays.sort((b, a) => a[trainNumberPosition] - b[trainNumberPosition]);
    } else {
    console.error("Populatetable didn't get correct sort order parameter.")
  }
  //Define different table's components:
  const targetdiv = document.getElementById('contentbyscript');
  const Table = document.createElement('table');
  const TableHead = document.createElement('thead');
  const TableBody = document.createElement('tbody');
  //Table's heading -part:
  //Heading row for "now showing" needs unique name to avoid being ovewritten by next row.
  const NowShowingHeadingRow = document.createElement('tr');
  //I also created cell to textcontent, so i can set colspan for it:
  const NowShowingHeadingCell = document.createElement('th');
  //Heading row for table data explanations:
  const TableHeadingRow = document.createElement('tr');
  //Define table's heading cells:
  const doesTrainStop = document.createElement('th');
  const ArrivingTime = document.createElement('th');
  const DepartureTime = document.createElement('th');
  const TrackNumber = document.createElement('th');
  const TrainLetter = document.createElement("th");
  const TrainDestination = document.createElement("th");
  const TrainNumber = document.createElement("th");
  //Create needed heading -columns to table:
  //First, there's "now showing" -heading row for clarity, as at the moment there's 3 elements where station can be selected:
  NowShowingHeadingCell.textContent="Now showing: "+ targetStation;
  //Set colspan to 5, so "Now showing goes in middle of table's top:"
  /*Fixed colspan causes "Now showing" to shift left if non-stopping trains or both, departure and arrival times are selected
  But this problem seems so minor that adding variables to set colspan isn't worth it. */
  NowShowingHeadingCell.setAttribute("colspan", "5");
  //Append cell to row:
  NowShowingHeadingRow.appendChild(NowShowingHeadingCell);
  //Append row to table's "head" -part.
  TableHead.appendChild(NowShowingHeadingRow);
  //If non-stopping trains are selected, make separate marking if the train stops or not.
  if (nonStoppingBoolean) {
    doesTrainStop.textContent="Stopping?";
    TableHeadingRow.appendChild(doesTrainStop);
  }
  if (arrivingBoolean) {
    ArrivingTime.textContent = "Arriving";
    TableHeadingRow.appendChild(ArrivingTime);
  }
  if (departingBoolean) {
    DepartureTime.textContent ="Departure";
    TableHeadingRow.appendChild(DepartureTime);
  }
  //Create column explanation texts for fixed data cells and append then to table's heading row:
  TrackNumber.textContent ="Track";
  TableHeadingRow.appendChild(TrackNumber);
  TrainLetter.textContent = "Line";
  TrainDestination.textContent ="Destination";
  TableHeadingRow.appendChild(TrainLetter);
  TableHeadingRow.appendChild(TrainDestination);
  TrainNumber.textContent ="Train number";
  TableHeadingRow.appendChild(TrainNumber);
  //Put heading row, created in previous step to table heading -element:
  TableHead.appendChild(TableHeadingRow);
  //Put created table heading -section to table:
  Table.appendChild(TableHead);
  /*I Used dynamic variables so i don't have to manually define names for variables one by one.
  At first, i was also planning to use those and subarrays also on function loadData but reverted to current,
  single array system with separator as loadData's core logic was puzzling enough at the point of initial development.*/
  //Rolling number for cells which got their contents via dynamic variables.
  tableComponentNumber = 0;
  //Rolling number for table content rows.
  //Needs to be separate from cells because othervise all cells would be appended to one line.
  tableRowNumber = 0;
  //Array for non-passenger trains, gets types from api.:
  nonPassengerTrainTypes = [];
  //Go through train types:
  trainTypes.forEach(type => {
    if (type.trainCategory.name != "Commuter" && type.trainCategory.name !="Long-distance"){
      nonPassengerTrainTypes.push(type.name);
    }
  });
  //This makes new row element at start of first train's data which contain relevant information:
  firstloop = true;
  //This forEach loop goes through each train's data:
  arrayOfArrays.forEach(arrayEntries => {
    //EntryCount is recorded that we can compare each timetable row to amount of total entries and thus know, when we are at last timetable entry.
    let entryCount = arrayEntries.length;
    //rowOfInterest is used to keep non-stopping trains away from table if they haven't been requested.
    //Also used, when sorting by departures to filter out trains that terminate on selected station. (or similarly arrivals + line start.)
    //Used also to filter out non passenger trains.
    rowOfInterest = true;
    //This variable is to easily select proper handling for each of timetable-entries and to get train's data to row's end when wanted timetable data's are listed:
    arrayEntryNumber = 0;
    //This variable is used to apply date object handling twice, in case that both arrivals and departures are selected.
    secondDate = false
    //Compares, if current train's type is found in nonPassengerTrainTypes:
    if (nonPassengerTrainBoolean == false && nonPassengerTrainTypes.includes(arrayEntries[entryCount-2])) {
      rowOfInterest = false;
    }
      //Following iterates through every object in data-array and returns train number and other data on same level:
      arrayEntries.forEach(obj => {
        //If subarray has been marked uninteresting, we may skip it's processing:
        if (rowOfInterest) {
          if (firstloop) {
            //Create new row -element for first row of data:
            //For next trains, new rows are created after this arrayEntries.forEach -loop which handles timetable entries.
            window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
            firstloop = false;
          }
          //Yes/no if non-stopping trains have been selected:
          if (arrayEntryNumber == 0) {
            if (nonStoppingBoolean) {
              window['iterated'+tableComponentNumber] = document.createElement('td');
              window['iterated'+tableComponentNumber].textContent = obj;
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
              tableComponentNumber ++;
            } else if (obj == "No.") {
              //If non-stopping trains haven't requested and stop -indicator is "No." skip that entry.
              rowOfInterest = false;
            }
            arrayEntryNumber ++;
            //Following clause handles first date object of subarray and checks if next object is also date object.
            //If so, this clause get's executed again by secondDate -boolean.
          } else if (rowOfInterest && arrayEntryNumber == 1 || arrayEntryNumber == 2 && secondDate) {
            //Reset secondDate if it's set:
            if (secondDate) {
              secondDate = false;
            }
            //Make sure at first that this entry is date entry:
            if (obj instanceof Date) {
              //Convert date object's unix -timestamp to hours+minutes+seconds:
              hours = obj.getHours();
              minutes = obj.getMinutes();
              seconds = obj.getSeconds();
              //Add leading zero to minutes and seconds if value < 10
              minutes = minutes < 10 ? "0" + minutes : minutes;
              seconds = seconds < 10 ? "0" + seconds : seconds;
              //Create cell with rolling number in variable name:
              window['iterated'+tableComponentNumber] = document.createElement('td');
              //Set cell's value to hours:
              window['iterated'+tableComponentNumber].textContent = hours;
              //Append : + minutes/seconds to that cell.
              window['iterated'+tableComponentNumber].textContent += ":"+minutes;
              window['iterated'+tableComponentNumber].textContent += ":"+seconds;
              //Append cell with time to current train's table row:
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
              //After this clause is executed, cell is done and we can increment cells number by one, to get clear cell for next entries:
              tableComponentNumber +=1;
            } else {
              //If there isn't time-entries in cells, where they should be, this checks if there's markings of line's start or termination, and appends that info to table as it is.
              //Cleans also trains from terminal stations, which have only arrival/departure time, in case of opposite is selected.
              if (obj=="Line start") {
                //Refinement: If sorting is by arrivals, we probably don't want to see starting trains at all:
                if (sortorder.value == 2 || sortorder.value == 3) {
                  rowOfInterest = false;
                } 
              } else if (obj=="Terminates") {
                //This requires triggering secondDate below to work:
                if (sortorder.value == 0 || sortorder.value == 1) {
                  rowOfInterest = false;
                } 
              }
              //refactoring of this else statement 29.4.2024:
              window['iterated'+tableComponentNumber] = document.createElement('td');
              window['iterated'+tableComponentNumber].textContent = obj;
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
              tableComponentNumber +=1;
            }
            //Check if next obj is also timestamp. Triggers new round with secondDate also, if there's termination code in next array entry:
            if (arrayEntries[arrayEntryNumber+1] instanceof Date || arrayEntries[arrayEntryNumber+1] == "Terminates") {
              secondDate = true;
            }
            arrayEntryNumber++;
          } else if (rowOfInterest && arrayEntryNumber > 1) {
            if (arrayEntryNumber == entryCount-3) {
              //Third last entry of array, which should be station code.
              //Converts displayed station code to station name.
              //First we try to find station code:
              // Check if any property value contains the keyword
              var codeContainingObject = trainStations.find(function(item) {
                return item.hasOwnProperty('stationShortCode') && typeof item.stationShortCode === "string" && item.stationShortCode === obj;
              });
                window['iterated'+tableComponentNumber] = document.createElement('td');
              if (codeContainingObject) {
                // Get the index of the entry
                var entryIndex = trainStations.indexOf(codeContainingObject);
                window['iterated'+tableComponentNumber].textContent = trainStations[entryIndex].stationName;
              } else {
                window['iterated'+tableComponentNumber].textContent = obj;
              }
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);      
            } else if (arrayEntryNumber == entryCount-2) {
              //Second last cell (Train type)
              //Create cell:
              window['iterated'+tableComponentNumber] = document.createElement('td');
              //Put array position's contents into cell:
              window['iterated'+tableComponentNumber].textContent = obj;
              //Take 1 back of tablecomponentnumber, so when it gets additioned after these statements, it remains same for else if below.
              //This could probably also be made by using -1 on tablecomponentnumber below.
              tableComponentNumber --;
            } else if (arrayEntryNumber == entryCount-1) {
              //Last cell (Train number)
              window['iterated'+tableComponentNumber].textContent += obj;
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
              //tableComponentNumberIncrement = 1;
            } else {
              window['iterated'+tableComponentNumber] = document.createElement('td');
              window['iterated'+tableComponentNumber].textContent = obj;
              window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
            }
            arrayEntryNumber ++;
          } else {
            console.error("Populatetable condition 4 (Else. Shouldn't never appear)");
          }
          //tableComponentNumber = tableComponentNumber + tableComponentNumberIncrement;
          tableComponentNumber++;
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