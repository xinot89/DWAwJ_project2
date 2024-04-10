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

//Event handler function calls encapsulated in anymous function calls, so they aren't called automatically every time that page loads:
document.getElementById("stationDropDown").addEventListener('change', function() {
  initializeLoad("dropdown");
});
document.getElementById("stationSearchButton").addEventListener('click', function() {
  initializeLoad("searchbutton");
});

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
arrivedComponent = "?arrived_trains=0"
//Get checkboxes state to know, what to fetch:
arrivedBoolean = document.getElementById("CheckboxGroup1_0").checked
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
  nonstoppingComponent = "&include_nonstopping="+fetchcount
}

fetchurl = urlbasePerStation+targetStation+arrivedComponent+arrivingComponent+departedComponent+departingComponent+nonstoppingComponent
//console.log(fetchurl)
datafetch()
/*
Fetched JSON Contains following data:
Train number -train's number, initial departure date and other infos.
  /timeTableRows -each arrival and stop's times and other infos.
    stationShortCode = targetStation (variable) NEEDS TO MATCH
    type = "DEPARTURE" NEEDS TO MATCH

 */
}

//Function to actually fetch data from server:
//Async when fetching from web.
function datafetch() {
  fetch('Datasample.json')
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
function loadData() {
  /*Options from eventlisteners: "dropdown" or "searchbutton"
  Target url:
  https://rata.digitraffic.fi/api/v2/graphql/graphql
  HTTP-pyyntöön tulee lisätä otsikot Content-Type: application/json ja Accept-Encoding: gzip
  */
  const targetdiv = document.getElementById('contentbyscript');
  const Table = document.createElement('table');
  const TableHead = document.createElement('thead');
  const TableBody = document.createElement('tbody');
  const TableRow = document.createElement('tr');
  const TableHeading = document.createElement('th');
  const TableColumn = document.createElement('td');

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