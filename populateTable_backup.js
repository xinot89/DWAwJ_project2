

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

    //26.4.2024 OBJ -loop before started developing this by array position:
          //If subarray has been marked uninteresting, we may skip it's processing:
          if (rowOfInterest) {
            if (firstloop) {
              //Create new row -element for first row of data:
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
                console.log("Nonstoppingboolean triggasi taulukonteossa.")
                window['iterated'+tableComponentNumber] = document.createElement('td');
                window['iterated'+tableComponentNumber].textContent = obj;
                window['iteratedTableRow'+tableRowNumber].appendChild(window['iterated'+tableComponentNumber]);
                tableComponentNumber +=1;
                //If non-stopping trains haven't been selected, skip appending this row to tbody:
              } else if (obj == "No.") {
                rowOfInterest = false;
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
          }