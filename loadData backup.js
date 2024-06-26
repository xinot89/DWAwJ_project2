function loadDataBackup(inputdata) {
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
        if (station == targetStation && type == "DEPARTURE" && ttrow.commercialStop) {
  
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
          /*Last row of timetablerows could be good and simple to put into table as destination.
          There's problem, that commuter trains have only one timetable for day's all trips.
          Long distance trains timetable seems to end on last stop.
          For that, i take all timetable's entries into array and take last of them:*/
          var keys = obj.timeTableRows
          window['iteratedTableColumn'+tableColumnNum].textContent = keys[keys.length -1].stationShortCode;
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

//Loaddata backup before implementation of fetching multiple data types to array:

  /*Function to load data to array.
Originally this function was used to put tata into table,
but i needed way to order trains by departure time so array offered simple -sounding solution to that.
Because of this, there might be out of context comments.*/
function loadData(inputdata) {

  //Make array for timetable entries:
  timetableEntries = []

  //Following iterates through every object in data and returns train number and other data on same level:
  inputdata.forEach(obj => {

    //console.log(obj); // This will log each object individually
    // If you want to access specific properties of each object, you can do so like this:
    //console.log(obj.timeTableRows); // Replace propertyName with the actual property name you want to access

    //This iterates through each subentry called "timeTableRows":
    obj.timeTableRows.forEach(ttrow => {
      
      station = ttrow.stationShortCode
      type = ttrow.type

      //console.log("Station: "+station)
      //console.log("Targetstation timetable -loopissa: "+ targetStation)
      if (station == targetStation && type == "DEPARTURE" && ttrow.commercialStop) {
        //Create array for each timetable entry:
        ttEntry = []

        //Get timedata from JSON to variable:
        timestamp = ttrow.scheduledTime
        //Make new date object out of it, date object usage also automatically converts time to local time.:
        //Date object is milliseconds since epoch, so it's easy to compare
        var date = new Date(timestamp);
        //Get hours and minutes from date -object:
        //var hours = date.getHours();
        //var minutes = date.getMinutes();
        ttEntry.push(date)
        ttEntry.push(obj.commuterLineID)
        //Temporary array for current timetable:
        var keys = obj.timeTableRows
        //Take current timetables last entry:
        ttEntry.push(keys[keys.length -1].stationShortCode);
        //console.log(ttEntry)
        timetableEntries.push(ttEntry)
      }
    });
    
  });

  //Sort array's contents by time:
  //This compares every pair of first entries in subarrays.
  timetableEntries.sort((a, b) => a[0] - b[0]);

  console.log(timetableEntries)
  //Finally, call function to put array's data to table:
  populatetable(timetableEntries)
}

Dump after failed try to use dynamic variables:
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



    //This iterates through each subentry called "timeTableRows":
    //noStopMarket -variable is for putting only one yes/no at start of array whether train stops in station:
    stoppingIndicatorEnabled = true;
    obj.timeTableRows.forEach(ttrow => {
      //Initialize dynamic subarray numbers:
      window['iteratedArray'+currentObj+currentRow] = [];
      console.log("Last array at start of ttrow: "+window['iteratedArray'+currentObj+currentRow-1]);
      
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
          window['iteratedArray'+currentObj+(currentRow-1)].push("---");
        } else {
          window['iteratedArray'+currentObj+(currentRow-1)].push(lastCommuterLineID);
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
  