
//create app object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/";
// Sal's key
// trackerApp.apiKey = "cfcdc8d5af30432ed42334fb974070b9949133aa";
trackerApp.apiKey = "2d3eddbd0f5ceef04711b52ea8b1742b41b52a62";

// stores the number of weekdays in index 0 and the number of weekends in index 1
trackerApp.daysParam = [];

// trackerApp.countries = document.querySelector('select').querySelectorAll('option').value;

// add selectedCountries property in global scope
trackerApp.selectedCountries = [];

// add holiday dates array of selected countries
trackerApp.holidaysByCountry = [];

// Add array of all previously retrieved countries that we ran through the API
trackerApp.retrievedCountries = [];

// add empty array to track all holidays from all selected countries (1-D array)
trackerApp.allHolidays = [];

// add empty array  to keep the number of shared holidays between all selected countries
trackerApp.sharedHolidays = [];

// add new variable to track the number of filtered working days for all countries retrieved 
trackerApp.filteredWorkingDays = 0;


// trackerApp.country = 'US';


trackerApp.getCountries = () => {
    const url = new URL(trackerApp.apiUrl + `countries`);
    url.search = new URLSearchParams({
        api_key: trackerApp.apiKey,
    })

    fetch(url)
        .then((response) => {
            return response.json();
        })

        //parse the JSON Promise and log out readable data (AKA data JSON format)
        .then((jsonResponse) => {
            trackerApp.appendCountries(jsonResponse);

        })
}

trackerApp.appendCountries = (countriesFromApi) => {
    // i=0;
    let country = '';
    let countryCode = '';
    const selectElement = document.querySelector('select');
    let option;

    for (i = 0; i < countriesFromApi.response.countries.length; i++) {

        country = countriesFromApi.response.countries[i].country_name;
        countryCode = countriesFromApi.response.countries[i]['iso-3166'];

        option = document.createElement('option');
        option.value = countryCode;
        option.textContent = country;

        selectElement.appendChild(option);
    };

    option = document.getElementsByClassName('placehOption');
    option[0].disabled = true;
}

// Placeholder function to display trackerApp data onto screen
trackerApp.displayData = () => {

}

trackerApp.getHolidays = () => {

    //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the request we are making to the API)

    document.querySelector('form').addEventListener('submit', (event) => {

        event.preventDefault();

        // Reset error log array to empty
        let errorLog = [];

        trackerApp.startDate = new Date(document.getElementById("start").value);
        trackerApp.endDate = new Date(document.getElementById("end").value);
        trackerApp.year = trackerApp.startDate.getFullYear();

        // Push "invalid date range" error to errorLog array if end date input is earlier than start date.
        if (trackerApp.startDate > trackerApp.endDate) {
            errorLog.push("Please select a valid date range.");
        }

        // Push "Please select start and end dates in the same year." to error log array if start and end dates are on different years.
        if (trackerApp.startDate.getFullYear() !== trackerApp.endDate.getFullYear()) {
            errorLog.push("Please select start and end dates in the same year.");
        }

        // Only fetch from the API if errorLog array is empty.
        if (errorLog.length > 0) {
            alert(errorLog.join("\n"));
        } else {
            // Reset selected countries to empty array
            trackerApp.selectedCountries = [];

            // Reset holiday dates array of selected countries
            trackerApp.holidaysByCountry = [];

            // Reset array of all previously retrieved countries that we ran through the API
            trackerApp.retrievedCountries = [];

            // Reset all holidays to empty array
            trackerApp.allHolidays = [];

            // Reset array of holidays shared by all selected countries to 0
            trackerApp.sharedHolidays = [];

            // Reset the daysParam array to an empty array
            trackerApp.daysParam = [];

            // Reset the number of filtered working days between all retrieved countries to 0
            trackerApp.filteredWorkingDays = 0

            const allUserCountrySelections = document.querySelector('select').selectedOptions;

            // Push all selected country codes into trackerApp.countries array
            for (let index = 0; index < allUserCountrySelections.length; index++) {
                trackerApp.selectedCountries.push(allUserCountrySelections[index].value);

                console.log(trackerApp.selectedCountries);

                // CW: Need to pass in all selected countries from trackerApp.countries array into the URL.searh.country and call the API the same number of times as the number of countries selected.

                // for (let i = 0; i < trackerApp.selectedCountries.length; i++) {
                const url = new URL(trackerApp.apiUrl + `holidays`);
                url.search = new URLSearchParams({
                    api_key: trackerApp.apiKey,
                    country: trackerApp.selectedCountries[index],
                    year: trackerApp.year,
                })

                //using the fetch API to make a request to the Calendarific API photos endpoint
                fetch(url)
                    .then((response) => {
                        // console.log(response);
                        //parse this response into JSON
                        //return JSON response so that it can be used in the next function
                        return response.json();
                    })

                    //parse the JSON Promise and log out readable data (AKA data JSON format)
                    .then((jsonResponse) => {
                        //pass the data into the displayPhotos method
                        //AKA call the displayPhotos within getPhotos
                        trackerApp.filterHolidays(jsonResponse, index);
                        // log out array of all holidays of selected countries
                        console.log("TrackerApp Holidays by Country:", trackerApp.holidaysByCountry);
                        console.log("Retrieved Countries: ", trackerApp.retrievedCountries);
                        // Perform comparison of shared holidays between countries
                        // trackerApp.compareSharedHolidays();
                        console.log("all holidays: ", trackerApp.allHolidays);
                        // Run this function only if we have cycled through to the last selected country on the list of selected countries
                        if (index === allUserCountrySelections.length - 1) {
                            trackerApp.filterSharedHolidays();
                            console.log("successfully ran filterSharedHolidays()- Should run once only");
                        }
                    })
                    .catch(error => {
                        // Logs out the error when API fetch fails
                        console.log(`Error, unable to fetch country selection #${index + 1} from API: `, error);
                    })
            }
        }
    })
}

// Function to generate an array of shared holidays that exist between all selected countries only
trackerApp.filterSharedHolidays = () => {

    // Step 1: Loop through the array of trackerApp.allholidays (which includes duplicate dates from all selected countries).  Compare the holiday date stored in the current index of the trackerApp.allHolidays array to all holiday dates from this array belonging to the current index position and higher.
    // Step 2: If a holiday occurs the same number of times as the number of countries the user had selected, store this holiday date into a new sharedHolidays array and reset the counter back to 0.  
    // Step 3: Repeat steps 1 and 2 for every index position in the trackerApp.allHolidays array.

    // Clear all trackerApp shared holidays
    trackerApp.sharedHolidays = [];

    for (let i = 0; i < trackerApp.allHolidays.length; i++) {
        let counter = 0;
        for (let j = i; j < trackerApp.allHolidays.length; j++) {
            if (trackerApp.allHolidays[j].getTime() === trackerApp.allHolidays[i].getTime()) {
                // console.log("i counted 1");
                counter++;
                if (counter === trackerApp.selectedCountries.length) {
                    trackerApp.sharedHolidays.push(trackerApp.allHolidays[i]);
                    // console.log("storing date");
                    break;
                }
            }
        }

    }
    console.log('All shared holidays: ', trackerApp.sharedHolidays);

    trackerApp.filteredWorkingDays = trackerApp.daysParam[0] - trackerApp.sharedHolidays.length;

    console.log('Number of workdays between given dates:', trackerApp.filteredWorkingDays);
    console.log('Number of shared holidays between given dates:', trackerApp.sharedHolidays.length);

}

// function to compare shared holidays between selected countries
// trackerApp.compareSharedHolidays = () => {
//     // trackerApp.selectedCountries
//     // trackerApp.holidaysByCountry

//     // Define shared holidays array
//     let sharedHolidays = [];

//     for (let j = 0; j < trackerApp.allHolidays.length; j++) {

//         for (let i = 0; i < trackerApp.allHolidays.length; i++) {
//             if (i === j) {
//                 // Do nothing
//             }
//             else if (trackerApp.allHolidays[j].getTime() === trackerApp.allHolidays[i].getTime()) {
//                 sharedHolidays.push(trackerApp.allHolidays[j]);
//             }
//         }
//     }

//     for (let j = 0; j < sharedHolidays.length; j++) {

//         for (let i = 0; i < sharedHolidays.length; i++) {
//             if (i === j) {
//                 // Do nothing
//             }
//             else if (sharedHolidays[j].getTime() === sharedHolidays[i].getTime()) {
//                 // sharedHolidays.pop(trackerApp.allHolidays[j]);
//                 sharedHolidays.pop();
//             }
//         }

//     }


//     //     result = array.filter(function(a, i, aa){
//     //     (aa.indexOf(a) === i && aa.lastIndexOf(a) !== i);
//     //     });    

//     // console.log(result);


//     // var arr = ["apple", "bannana", "orange", "apple", "orange"];

//     // sharedHolidays = sharedHolidays.filter(function (item, index, inputArray) {
//     //     return inputArray.indexOf(item) == index;
//     // });


//     console.log("trackerApp allholidays: ", trackerApp.allHolidays);
//     console.log("Shared Holidays", sharedHolidays);

//     let newHolidays = sharedHolidays.slice(0, (sharedHolidays.length / trackerApp.selectedCountries.length) - 1);





//     // // For loop to cycle through each country within the selected countries array
//     // for (let currCountryInd = 0; currCountryInd < trackerApp.selectedCountries.length; currCountryInd++) {

//     //     // For loop to cycle through all dates for the currently selected county in the selected countries array
//     //     for (let currDateInd = 0; currDateInd < trackerApp.holidaysByCountry[currCountryInd][currDateInd].length; currDateInd++) {

//     //         // For loop to compare the current holiday for the selected country with each holiday in the next selected country on the list 
//     //         for (let currDateToCompare = 0; currDateToCompare < trackerApp.holidaysByCountry[currCountryInd + 1][currDateToCompare].length; currDateToCompare++) {

//     //             if (trackerApp.holidaysByCountry[currCountryInd][currDateInd] === trackerApp.holidaysByCountry[currCountryInd + 1][currDateToCompare]) {
//     //                 sharedHolidays.push(trackerApp.holidaysByCountry[currCountryInd][currDateInd]);
//     //             }
//     //             // trackerApp.holidaysByCountry[currDateInd];
//     //         }
//     //     }
//     // }

//     console.log("Shared Holidays Array: ", newHolidays);



// }



trackerApp.filterHolidays = (dataFromApi, indexVal) => {

    // query the document and find the first ul
    // const ul = document.querySelector('ul');
    trackerApp.calcDays();
    // console.log(trackerApp.daysParam);
    const holidayData = [];
    let j = 0;
    let counter = 0;
    let holidays = 0;
    // let filteredWorkingDays = 0;
    // let sharedHolidays = 0;
    let currentHolidays = [];
    // console.log(dataFromApi.response.holidays);
    let retrievedCountry = '';

    for (i = 0; i < dataFromApi.response.holidays.length; i++) {

        if (dataFromApi.response.holidays[i].type[0] === "National holiday" && dataFromApi.response.holidays[i].locations === "All") {

            holidayData.push(dataFromApi.response.holidays[i].date.iso);
            const holiDate = new Date(holidayData[j]);

            console.log(dataFromApi.response.holidays[i].country.id);

            // let holiDateArray=[];
            // holiDateArray.push(holiDate);

            let holiDay = holiDate.getDay();

            j++;

            // console.log("holidayData: ", holidayData);
            // console.log("holiDate: ", holiDate);

            if (trackerApp.startDate <= holiDate && trackerApp.endDate >= holiDate) {
                // const holidaysInDateRange = holiDate;
                // console.log("Date vault:", dateVault);

                // console.log('indexVal:', indexVal);
                // console.log('trackerApp HolidaysbyCountry: ', trackerApp.holidaysByCountry);
                currentHolidays.push(holiDate);
                // trackerApp.holidaysByCountry[indexVal].push(holiDate);
                // console.log("holidayData[j]:", holidayData[j]);

                // push all holidays from this country into a stacked array
                trackerApp.allHolidays.push(holiDate);

                holidays++;
                if (holiDay > 5 || holiDay < 1) {
                    counter++;
                }
            }

        }
    }
    // console.log(trackerApp.daysParam);

    trackerApp.holidaysByCountry.push(currentHolidays);

    // Push the retrieved country into trackerApp.retrievedCountries that corresponds to the current holidays that we are running.
    trackerApp.retrievedCountries.push(dataFromApi.response.holidays[0].country.id);




    // trackerApp.countryCode

    // filteredWorkingDays = trackerApp.daysParam[0] - trackerApp.sharedHolidays.length;
    // filteredWorkingDays = trackerApp.daysParam[0] - trackerApp.sharedHolidays.length;
    // console.log('Number of workdays between given dates:', filteredWorkingDays);

    // console.log('Number of shared holidays between given dates:', trackerApp.sharedHolidays.length);

    // console.log('Holidays that fall on weekends:', counter);

    // console.log('Number of weekends between given dates:', trackerApp.daysParam[1]);

    // Push holidays by selected countries into our trackerApp.holidaysByCountry array
    // trackerApp.holidaysByCountry.push(holidayData);

    // console.log(holidayData);
}


trackerApp.calcDays = () => {

    // hours*minutes*seconds*milliseconds
    const oneDay = 24 * 60 * 60 * 1000;

    // Get the user input from date selector and store the value in order to convert it into an array to pass it on to the Date() constructor

    // const startDate = new Date(trackerApp.startDateInput);
    // console.log(startDate);



    // const endDate = new Date(trackerApp.endDateInput);
    // console.log(endDate);

    // Get the duration by subtracting the Date() constructors between start and end date. Because the date constructor value is represnted by the number of millisceonds we need to divide by the number of milliseconds per day to get back the number of days. We then add 1 in order to count the first day.
    let totalDays = ((trackerApp.endDate - trackerApp.startDate) / oneDay) + 1;
    // console.log('Total Days:', totalDays);


    // We use startDay and endDay to know the day of the week that we are on in order to pass this information to our algorithm for calculating the number of actual weekend days accurately.
    let startDay = trackerApp.startDate.getDay();
    // console.log('Start Day:', startDay);

    let endDay = trackerApp.endDate.getDay();


    // Tracks the number of surplus days over and above a series of complete weeks or if it is less than a week then it tracks the number of days before it completes a week.
    let extraDays = 0;

    // Modify the startDay and endDay date values so that sunday will correspond to Day 7. This way Monday (start of the week) will correspond to Day 1 and Sunday (end of the week) will correspond to Day 7.
    if (startDay === 0) {
        startDay += 7;
    }

    if (endDay === 0) {
        endDay += 7;
    }

    // console.log('End Day:', endDay);


    // If the totalDays is more than a week then it will divide the number of weeks by 7 and give us the remainder of the number of surplus days over and above a series of complete weeks. Else if the number of totalDays is less than a week then it calculates the number of days before it completes a full week.
    if (totalDays >= 7) {
        extraDays = totalDays % 7;
        // console.log('Extra Days:', extraDays);

    }
    else {
        extraDays = 6 - totalDays;
        // console.log('Extra Days:', extraDays);
    }
    console.log('ExtraDays:', extraDays);

    // Calculates the number of weekEndDays in the project timeline (for every week we pass it should be multiplied by 2 cause we have Saturday and Sunday)
    let weekEndDays = Math.trunc(totalDays / 7) * 2;
    // console.log('Weekend before adding extra days:', weekEndDays);


    // Checks if startDay or endDay falls on a Saturday to add an extra weekend day
    if (extraDays > 0) {

        if ((startDay <= 6 && endDay === 6) || startDay === 7) {
            weekEndDays++;
        }

        // Checks if startDay or endDay falls on a Sunday to add an extra weekend day
        else if ((startDay <= 6 && endDay === 7) || startDay === 6) {
            weekEndDays += 2;
        }
    }

    console.log('Start Day:', startDay);
    console.log('End Day:', endDay);

    // console.log("Number of Weekend Days: ", weekEndDays);
    const workDays = (totalDays) - weekEndDays;
    // console.log("Number of Work Days:", workDays);
    trackerApp.daysParam.push(workDays, weekEndDays);

    // days.push(weekEndDays);
}


//create an initialization method
trackerApp.init = () => {

    trackerApp.getCountries();

    trackerApp.getHolidays();
}


trackerApp.init();