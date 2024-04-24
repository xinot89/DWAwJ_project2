function populatetable(dataarray) {
    /*Originally i meant to use flat array as input for this function, which i then swapped to subarray -structure
    and back to flat array when it started feel too complex. Now i again try on this function to split input array to 
    subarrays for sorting purposes.*/
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
  
  //Rolling number for cells which got their contents via dynamix variables.
  tableComponentNumber = 0;
  //Rolling number for table content rows.
  //Needs to be separate from cells because othervise all cells would be appended to one line.
  tableRowNumber = 0;
  
  //There was some though where this might be necessary, but that thought got lost:
  dateObjectsAfterStopInfo = 0;
  
  //Used for making new row element at start of loop:
  firstloop = true;
  
  
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
      if (firstloop) {
        window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
        firstloop = false;
      }
      regexPatternForTrainLetters=/^[A-Z]+$/;
      regexPatternForTrainStations=/^[A-Z]{2,3}\d{1,}$/;
      //If input array's first entrry is stopping indicator:
      if (obj == "Yes." || obj=="No.") {
        //If non-stopping trains have been requested, put stopping indicator to table:
        if (nonStoppingBoolean) {
          //Store current object (stopping indicator) in dynamic variable and append it to table row.
          window['iterated'+tableComponentNumber] = document.createElement('td');
          window['iterated'+tableComponentNumber].textContent = obj;
          window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
          tableComponentNumber +=1;
        }
        //Found guide to following from: https://stackoverflow.com/questions/2831345/is-there-a-way-to-check-if-a-variable-is-a-date-in-javascript
      } else if (obj instanceof Date) {
        /*Take hours and minutes, add leading zero to minutes.*/
        hours = obj.getHours();
        minutes = obj.getMinutes();
        //Add leading zero to minutes if minute -value < 10
        minutes = minutes < 10 ? "0" + minutes : minutes;
        window['iterated'+tableComponentNumber] = document.createElement('td');
        window['iterated'+tableComponentNumber].textContent = hours;
        window['iterated'+tableComponentNumber].textContent += ":"+minutes;
        window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
        dateObjectsAfterStopInfo +=1;
        tableComponentNumber +=1;
      } else if (regexPatternForTrainLetters.test(obj)&&obj.length==1) {
        window['iterated'+tableComponentNumber] = document.createElement('td');
        window['iterated'+tableComponentNumber].textContent = obj;
        window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
        tableComponentNumber +=1;
      } else if (obj.length >1 && obj.length <4) {
        window['iterated'+tableComponentNumber] = document.createElement('td');
        window['iterated'+tableComponentNumber].textContent = obj;
        window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
        tableComponentNumber +=1;
      } else if (obj == "NEWTRAIN_6b9d87b08a2ee") {
        TableBody.appendChild(window['iteratedTableRow'+tableRowNumber]);
        tableRowNumber += 1;
        window['iteratedTableRow'+tableRowNumber] = document.createElement('tr');
      }
    });
    //Add table body to table:
  Table.appendChild(TableBody);
  
  //Clear target div before appending table:
  targetdiv.innerHTML = "";
  //Finally, inject table to target div:
  targetdiv.appendChild(Table);
  }
  