/* Aletaan pusertamaan seuraavalla eteenpäin:
https://www.digitraffic.fi/en/railway-traffic/
*/

//Yhden rivin kommentti.
/*Example GrapQL query from: https://www.digitraffic.fi/en/railway-traffic/#graphql
{
  currentlyRunningTrains(where: {operator: {shortCode: {equals: "vr"}}}) {
    trainNumber
    departureDate
    trainLocations(where: {speed: {greaterThan: 30}}, orderBy: {timestamp: DESCENDING}, take: 1) {
      speed
      timestamp
      location
    }
  }
}
*/
/* Short tutorial on event handlers: https://blog.logrocket.com/dynamically-create-javascript-elements-event-handlers/
Cannot make sense on */
//Training section for fetching some data to site and formatting tables:
/*Variables:
let -only available inside the block where they're defined
var -available throught the function in which they're declared
https://sentry.io/answers/difference-between-let-and-var-in-javascript/
*/

//FAILSAFE EVENT LISTENERS: Assign constant to dropdown -menu:
//const stationdropdown = document.getElementById("stationDropDown");
//const stationSearchButton = document.getElementById("stationSearchButton");
//Event listener for dropdown menu (Last one is function to be triggered:):
//stationdropdown.addEventListener('onchange', initializeLoad("dropdown"));
//Event listener for search button, "click" -events sounds right.
//stationSearchButton.addEventListener('click', initializeLoad("searchbutton"));

/*Original event handlers, issue with these was that they called configured function every time page loaded.
//Event listeners for station dropdown -menu and search without setting constants:
document.getElementById("stationDropDown").addEventListener('onchange', initializeLoad("dropdown"));
document.getElementById("stationSearchButton").addEventListener('click', initializeLoad("searchbutton"));
*/

//Initialize targetStation -variable here, so it can be used on all functions.
targetStation = ""

//Preformatted string for if clauses, which contains selected entries:
//Used when picking entries to table with loaddata()
selectedDataIfClause = ""

//Variable to store last changed element, so browser knows whether to use dropdown menu's or search box's
//input when e.g. radio buttons are changed.
lastChanged = "dropdown"

//Event handler function calls encapsulated in anymous function calls, so they aren't called automatically every time that page loads:
//Listener for Dropdown -menu:
document.getElementById("stationDropDown").addEventListener('change', function() {
  lastChanged="dropdown"
  initializeLoad(lastChanged);
});
//Listener for search -box:
document.getElementById("stationSearchButton").addEventListener('click', function() {
  lastChanged="searchbutton"
  initializeLoad(lastChanged);
});
//Event listener for radio buttons:
var radioButtons = document.getElementsByName("howManyToFetch");
radioButtons.forEach(function(radioButton) {
  radioButton.addEventListener('click', function() {
    initializeLoad(lastChanged);
  });
});

//Variable where if statement can check is interval already running:
let intervalForCheckboxes = 0;
const initialcheckboxdelay = 1500
checkBoxDelayAmount = initialcheckboxdelay
//Event listener for checkboxes:
document.getElementById("checkBoxes").addEventListener('click', function() {
    //If interval isn't set:
    if (intervalForCheckboxes == 0) {
      //Call checkboxdelay function every 100ms:
      intervalForCheckboxes = setInterval(checkboxdelay,100);
      //console.log("intervalForCheckboxes after setting: "+ intervalForCheckboxes)
    } else {
      //console.log("Timeout reset")
      //reset delay back to 1 second:
      checkBoxDelayAmount = initialcheckboxdelay
    }

});

function checkboxdelay() {
  //console.log("Checkbox delay amount at start of checkboxdelay: "+checkBoxDelayAmount)
  if (checkBoxDelayAmount == 100) {
    //console.log("CheckboxDelayAmount 100")
    checkBoxDelayAmount = 0
    clearInterval(intervalForCheckboxes)
    intervalForCheckboxes = 0;
    //console.log("intervalForCheckboxes after clearing: "+ intervalForCheckboxes)
    initializeLoad(lastChanged);
    checkBoxDelayAmount = initialcheckboxdelay
  } else if (checkBoxDelayAmount > 100) {
    //console.log("CheckboxDelayAmount over 100")
    checkBoxDelayAmount = checkBoxDelayAmount -100
  } else {
    console.log("Something unplanned on checkboxdelay -function.")
    //console.log("Checkbox delay amount: "+checkBoxDelayAmount)
  }
}


//Eventlistener to load data when page is loaded:
document.addEventListener('DOMContentLoaded', () => {
  initializeLoad("dropdown");
  //koeQuery();
});

const debugdiv = document.getElementById("debugContentByScript");
async function justgetqueryworking() {
  /*https://rata.digitraffic.fi/api/v1/live-trains/station/HKI?arrived_trains=5&arriving_trains=5&departed_trains=5&departing_trains=5&include_nonstopping=false&train_categories=Commuter*/
  debugdiv.innerHTML= await datafetch();
}
//Function to set parameters right for loading data.
//Renamed following, so it doesn't run all the time and started developing data parsing on separate function:

function initializeLoad(fromwhere) {
  console.log("Initializeload: "+fromwhere)
  //Query's base address, which is common to all station queries:
  urlbasePerStation = "https://rata.digitraffic.fi/api/v1/live-trains/station/"
  if (fromwhere == "dropdown") {
    //Get dropdown menu's value (Station code):
    targetStation = document.getElementById("stationDropDown").value;
  } else if (fromwhere == "searchbutton") {
    //get textbox's entry:
    targetStation = document.getElementById("stationsearch").value;
    //Search entries in JSON:
    //https://rata.digitraffic.fi/api/v1/metadata/stations (107kb)
  } else {
    console.log("initializeLoad(fromwhere) didn't get correct arguments.")
    return false
    }
  //Get entries to fetch:
  //fetchcount = document.getElementsByName("howManyToFetch").values;

  //FETCHCOUNT limits: 1-600
  var radioButtons = document.getElementsByName("howManyToFetch");
  //For -loop which goes through radio buttons and get's checked radio button's value:
  for (var i = 0; i < radioButtons.length; i++) {
    if (radioButtons[i].checked) {
        var fetchcount = radioButtons[i].value;
        //Exit loop when checked radio button found:
        break;
    }
  }
  //List of train  categories, in case if needed: https://rata.digitraffic.fi/api/v1/metadata/train-categories

  //Make variable for url part which length's verification is easy and can be left empty if concerning checkbox is unchecked:
  //First, set each fetch -setting to 0:
  arrivedComponent = "?arrived_trains=0"

  //Get checkboxes state to know, what/how many of each to fetch:
  arrivedBoolean = document.getElementById("CheckboxGroup1_0").checked
  //...And if entry data in question is requested, take amount to fetch from radio button's options and modify request URL accordingly:
  if (arrivedBoolean) {
    arrivedComponent = "?arrived_trains="+fetchcount
  }
  arrivingComponent = "&arriving_trains=0"
  arrivingBoolean = document.getElementById("CheckboxGroup1_1").checked
  if (arrivingBoolean) {
    arrivingComponent = "&arriving_trains="+fetchcount
  }
  departedComponent = "&departed_trains=0"
  departedBoolean = document.getElementById("CheckboxGroup1_2").checked
  if (departedBoolean) {
    departedComponent = "&departed_trains="+fetchcount
  }
  departingComponent = "&departing_trains=0"
  departingBoolean = document.getElementById("CheckboxGroup1_3").checked
  if (departingBoolean) {
    departingComponent = "&departing_trains="+fetchcount
  }
  nonstoppingComponent = "&include_nonstopping=0"
  nonstoppingBoolean = document.getElementById("CheckboxGroup1_4").checked
  if (nonstoppingBoolean) {
    nonstoppingComponent = "&include_nonstopping=1"
  }

  fetchurl = urlbasePerStation+targetStation+arrivedComponent+arrivingComponent+departedComponent+departingComponent+nonstoppingComponent
  //console.log(fetchurl)

  //In production version, fetchurl goes as datafetch's parameter:
  datafetch()
}

//Function to actually fetch data from server:
//Async when fetching from web.
function datafetch() {
  //When playing with production data, make this function to expect string as input and give that string as parameter to next line instead of sample data.
  
  //Fetch sample data:
  //fetch('Datasample.json')

  //Fetch production data:
  fetch(fetchurl)
  .then(response => {
    if (!response.ok) {
      throw new Error('Sample file loading was not ok');
    }
    return response.json();
  })
  .then(jsonData => {
    loadData(jsonData)
    //console.log(jsonData)
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
  });
  //Rest of this function is redundant code for web fetching purposes.
  /*
  try {
    //Await needed for fetch to work at all. Fetch is javascript's built in function.
    const response = await fetch("https://rata.digitraffic.fi/api/v1/live-trains/station/HKI?arrived_trains=5&arriving_trains=5&departed_trains=5&departing_trains=5&include_nonstopping=false&train_categories=Commuter");
    if (!response.ok) {
        console.log("fetch ei onnistunut.")
        throw new Error('Network response was not ok');
    }
    const data = await response.text();
    //console.log("fetch4exc2 ulosanti: " + data);
    return data;
  } catch (error) {
    console.error("Error:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
  */
}
//Function to parse data to site:
function loadData(inputdata) {
  //Define different table's components:
  const targetdiv = document.getElementById('contentbyscript');
  const Table = document.createElement('table');
  //Table's heading -part:
  const TableHead = document.createElement('thead');
  const TableBody = document.createElement('tbody');
  const TableHeadingRow = document.createElement('tr');
  const TableRow = document.createElement('tr');
  //Table's heading cells:
  const DepartureTime = document.createElement('th');
  const DepartedTime = document.createElement('th');
  const TrainLetter = document.createElement("th")
  const TrainDestination = document.createElement("th")

  /* Not in use because dynamic variables are being used for these.
  Dynamic variables are needed because otherwise javascript messes different data entries together.
  //Regular columns:
  const DepartureCol = document.createElement('td');
  const DepartedCol = document.createElement('td')
  const TrainLetterCol = document.createElement('td');
  const TrainDestinationCol = document.createElement('td');
  */

  //Create heading -columns to table:
  DepartureTime.textContent ="Departure time"
  TrainLetter.textContent = "Line"
  TrainDestination.textContent ="Destination"
  //Append heading columns to new row:
  TableHeadingRow.appendChild(DepartureTime)
  TableHeadingRow.appendChild(TrainLetter)
  TableHeadingRow.appendChild(TrainDestination)
  //Put row created in previous step to table heading -element:
  TableHead.appendChild(TableHeadingRow)
  //Put created table heading -section to table:
  Table.appendChild(TableHead)

  //Rolling numbers to create new element for each table row and cell:
  tableRowNum = 0
  tableColumnNum = 0 

  //Following iterates through every object in data and returns train number and other data on same level:
  //Sample variable is used to print one sample entry from one entry's subobject:
  sample = true
  inputdata.forEach(obj => {
    //Print one sample row of top level data also:
    if (sample) {
      //console.log(obj)
      sample = false
    }

    //Start row processing by generating unique id to row:
    //Use iteratedTableRow to generate new rows to table:
    window['iteratedTableRow'+tableRowNum] = document.createElement('tr');

    //console.log(obj); // This will log each object individually
    // If you want to access specific properties of each object, you can do so like this:
    //console.log(obj.timeTableRows); // Replace propertyName with the actual property name you want to access

    //This iterates through each subentry called "timeTableRows":
    obj.timeTableRows.forEach(ttrow => {
      
      station = ttrow.stationShortCode
      type = ttrow.type
      //console.log("Station: "+station)
      //console.log("Targetstation timetable -loopissa: "+ targetStation)
      if (station == targetStation && type == "DEPARTURE") {

        //console.log("Lyhyt asemakoodi: "+station)
        //console.log(ttrow); // This will log each object individually
        //Get timedata from JSON to variable:
        timestamp = ttrow.scheduledTime
        //Make new date object out of it, date object usage also automatically converts time to local time.:
        var date = new Date(timestamp);
        //Get hours and minutes from date -object:
        var hours = date.getHours();
        var minutes = date.getMinutes();

        /*
        Add leading zero to minutes if minute -value < 10
        This is conditional (/ternary) operation, basically simple if-else
        it goes like this:
        <condition>?<this runs if condition is true.>:<this runs if condition is false>
        */
        minutes = minutes < 10 ? "0" + minutes : minutes;


        //Columns made with rolling number:
        //"window" packages given string and variable's value as string name, so it suits well this use case.
        window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');

        //Initial, ugly table:
        window['iteratedTableColumn'+tableColumnNum].textContent = hours
        //Needed to add following retrospectively as othervise javascript counts hours+minutes together.
        window['iteratedTableColumn'+tableColumnNum].textContent += ":"+minutes
        window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum])
        //console.log("TableColumnNum ennen plussausta: " + tableColumnNum)
        tableColumnNum ++
        //console.log("TableColumnNum plussauksen jälkeen: " + tableColumnNum)

        //This is basically new variable, so it's necessary to set this each time separately:
        window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');
        window['iteratedTableColumn'+tableColumnNum].textContent = obj.commuterLineID
        window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum])
        tableColumnNum ++
        window['iteratedTableColumn'+tableColumnNum] = document.createElement('td');
        window['iteratedTableColumn'+tableColumnNum].textContent = "No idea yet."
        window['iteratedTableRow'+tableRowNum].appendChild(window['iteratedTableColumn'+tableColumnNum])
        tableColumnNum ++

        //And row to Table body:
        TableBody.appendChild(window['iteratedTableRow'+tableRowNum])
        //console.log("Appendin jälkeen: " + window['iteratedTableRow'+tableRowNum].textContent + "Rnro:" + tableRowNum)
        

      }
      
    });
    //console.log("Appendin jälkeen, ennen lisäystä: " + window['iteratedTableRow'+tableRowNum].textContent + "Rnro:" + tableRowNum)
    tableRowNum ++
  });
  //Add table body to table:
Table.appendChild(TableBody)

  //Clear target div before appending table:
  targetdiv.innerHTML = ""
  //Finally, inject table to target div:
  targetdiv.appendChild(Table)

}
function addTask() {
  //taskInput = task input text-box
  const taskInput = document.getElementById('taskInput');
  const taskTable = document.getElementById('taskTable');
  const taskList = document.getElementById('taskList');
  if (taskInput.value.trim() === '') {
      alert('Please enter a task!');
      const inputbox = document.getElementById("taskInput");
      inputbox.style.background ="rgba(255, 0, 0, 0.3)";
      inputbox.placeholder = "Enter your new task here";
      return;
  }
  // Create task row & column:
  const taskRow = document.createElement('tr');
  const taskColumn = document.createElement('td');
  taskColumn.textContent = taskInput.value;
  taskColumn.classList.add("todotasks");
  taskRow.appendChild(taskColumn);
  // Making of "Done" -column.
  const doneColumn = document.createElement('td');
  const doneButton = document.createElement('input');
  doneButton.type = "checkbox";
  doneButton.name = "Task done";
  doneButton.addEventListener('change', markTaskAsDone);
  doneColumn.appendChild(doneButton);
  taskRow.appendChild(doneColumn);
  // Make remove -column
  const removeColumn = document.createElement('td');
  const removeButton = document.createElement('button');
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', removeTask);
  removeColumn.appendChild(removeButton);
  taskRow.appendChild(removeColumn);
  // Add task row to the table
  taskList.appendChild(taskRow);
  saveTasks();
  taskInput.value = '';
}