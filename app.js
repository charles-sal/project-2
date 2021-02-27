
//create trackerApp object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/";
// Sal's key
// trackerApp.apiKey = "cfcdc8d5af30432ed42334fb974070b9949133aa";

// Charles' old key
// trackerApp.apiKey = "2d3eddbd0f5ceef04711b52ea8b1742b41b52a62";

//Sal's new key
trackerApp.apiKey = "099ee5f3450265283c463cb3031de3e4d7164028";

// stores the number of weekdays in index 0 and the number of weekends in index 1
trackerApp.daysParam = [];

// add selectedCountries property in global scope
trackerApp.selectedCountries = [];

// add holiday dates array of selected countries
trackerApp.holidaysByCountry = [];

// Add array of all previously retrieved countries that we ran through the API.  The indices in this array are in sync with the indices in the trackerApp.holidaysByCountry array
trackerApp.retrievedCountries = [];

// add empty array to track all holidays from all selected countries (1-D array)
trackerApp.allHolidays = [];

// add empty array  to keep the number of shared holidays between all selected countries
trackerApp.sharedHolidays = [];

// add new variable to track the number of filtered working days for all countries retrieved 
trackerApp.filteredWorkingDays = 0;

// Function to set the start date as the user's current date (for improved UX)
trackerApp.setCurrentDate = () => {
    // Set todaysMonthSt and todaysDaySt variables to empty
    let todaysMonthSt = '';
    let todaysDaySt = '';

    const todaysDate = new Date();

    const todaysDay = todaysDate.getDate();
    const todaysMonth = todaysDate.getMonth() + 1;
    const todaysYear = todaysDate.getFullYear();

    // Appends a 0 to the front of the month number if the month is single digit
    if (todaysMonth < 10) {
        todaysMonth.toString();
        todaysMonthSt = '0' + todaysMonth;
    } else {
        todaysMonthSt = todaysMonth;
    }

    // Appends a 0 to the front of the date number if the date is single digit
    if (todaysDay < 10) {
        todaysDay.toString();
        todaysDaySt = '0' + todaysDay;
    } else {
        todaysDaySt = todaysDay;
    }

    // Set the start date input field with the user's current date
    const startDateEl = document.getElementById('start');
    startDateEl.value = `${todaysYear}-${todaysMonthSt}-${todaysDaySt}`;
}

// Function to get the list of all countries supported by the API
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

// Function to append list of all countries received from the API to the dropdown menu on the .sidePane
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



    //Tracks unused countries (country #2 and #3) if user does not select them
    const unusedCountryEl2 = document.querySelector(`#country2`);
    const unusedCountryEl3 = document.querySelector(`#country3`);

    // Renders country #2 and country #3 elements to be visible on page.
    unusedCountryEl2.classList.remove('hideEl');
    unusedCountryEl3.classList.remove('hideEl');

    // Resets all bar graphs and their values to 0
    // for (let i = 0; i < 3; i++) {
    //     const countryEl = document.querySelector(`#country${i + 1} .graph`);
    //     countryEl.style.width = `0%`;
    //     const countryNum = document.querySelector(`#country${i + 1} h3`);
    //     countryNum.textContent = `Country #${i + 1}, 0`;
    // }

    // For total working days bar graph
    const totalWorkingDaysEl = document.querySelector('#workingDays .graph');
    totalWorkingDaysEl.style.width = '80%';
    const totalWorkingDaysNumEl = document.querySelector('#workingDays h3');
    totalWorkingDaysNumEl.textContent = trackerApp.filteredWorkingDays;

    // For total weekend days bar graph
    const totalWeekendDaysEl = document.querySelector('#weekendDays .graph');
    totalWeekendDaysEl.style.width = `${(trackerApp.daysParam[1] / trackerApp.filteredWorkingDays) * 80}%`;
    const totalWeekendDaysNumEl = document.querySelector('#weekendDays h3');
    totalWeekendDaysNumEl.textContent = trackerApp.daysParam[1];

    // For shared holidays bar graph
    const sharedHolidaysEl = document.querySelector('#sharedHolidays .graph');
    sharedHolidaysEl.style.width = `${(trackerApp.sharedHolidays.length / trackerApp.filteredWorkingDays) * 80}%`;
    const sharedHolidaysNum = document.querySelector('#sharedHolidays h3');
    sharedHolidaysNum.textContent = trackerApp.sharedHolidays.length;


    // Function to hide unused countries #2 and/or #3 from the results if necessary
    if (trackerApp.retrievedCountries.length === 2) {
        // Display: none for the third DIV
        unusedCountryEl3.classList.add('hideEl');
        // console.log(unusedCountryEl3);
    } else if (trackerApp.retrievedCountries.length === 1) {
        // Display:none for the second and third DIV
        unusedCountryEl2.classList.add('hideEl');
        unusedCountryEl3.classList.add('hideEl');
    }

    console.log(trackerApp.retrievedCountries);
    // For holidays by country #1, #2, and #3 bar graphs
    for (let i = 0; i < trackerApp.retrievedCountries.length; i++) {
        const countryEl = document.querySelector(`#country${i + 1} .graph`);
        countryEl.style.width = `${(trackerApp.holidaysByCountry[i].length / trackerApp.filteredWorkingDays) * 80}%`;
        const countryNum = document.querySelector(`#country${i + 1} h3`);
        countryNum.textContent = `${trackerApp.retrievedCountries[i].toUpperCase()}, ${trackerApp.holidaysByCountry[i].length}`;
        console.log(countryNum);
    }

    // document.querySelector('.resultsContainer').style.display = 'block';
    console.log(document.querySelector('.resultsContainer'));
    // document.getElementById(‘id1’).style.color = ‘red’



}

trackerApp.getHolidays = () => {

    //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the request we are making to the API)

    document.querySelector('form').addEventListener('submit', (event) => {

        event.preventDefault();
        document.querySelector('.resultsContainer').style.display = 'block';
        // Reset error log array to empty
        let errorLog = [];
        let apiError = false;

        // Get the user input from date selectors and store the values in order to convert them into arrays to pass it on to the Date() constructors
        trackerApp.startDate = new Date(document.getElementById("start").value);
        trackerApp.endDate = new Date(document.getElementById("end").value);
        trackerApp.year = trackerApp.startDate.getFullYear();

        // Push "invalid date range" error to errorLog array if end date input is earlier than start date.
        if (trackerApp.startDate >= trackerApp.endDate) {
            errorLog.push("Please select a valid date range.");
        }

        // Push "Please select start and end dates in the same year." to error log array if start and end dates are on different years.
        if (trackerApp.startDate.getFullYear() !== trackerApp.endDate.getFullYear()) {
            errorLog.push("Please select start and end dates in the same year.");
        }

        // Checks if user has selected > 3 countries
        if (trackerApp.selectedCountries.length > 3) {
            errorLog.push("Please select 3 countries or less.")
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

            const alertApiErrors = (countryIndex) => {
                // Logs out the error when API fetch fails
                if (countryIndex === allUserCountrySelections.length - 1 && apiError === true) {
                    alert(`One or more countries were not retrieved. Please try again.`);
                }
            }

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
                        //parse this response into JSON
                        //return JSON response so that it can be used in the next function
                        return response.json();
                    })

                    //parse the JSON Promise and log out readable data (AKA data JSON format)
                    .then((jsonResponse) => {
                        //pass the data into the displayPhotos method
                        //AKA call the displayPhotos within getPhotos
                        trackerApp.filterHolidays(jsonResponse);
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

                        alertApiErrors(index);
                    })
                    .catch(error => {

                        apiError = true;
                        alertApiErrors(index);
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
                    // break;
                }
            }
        }

    }
    console.log('All shared holidays: ', trackerApp.sharedHolidays);

    trackerApp.filteredWorkingDays = trackerApp.daysParam[0] - trackerApp.sharedHolidays.length;

    console.log('Number of workdays between given dates:', trackerApp.filteredWorkingDays);
    console.log('Number of shared holidays between given dates:', trackerApp.sharedHolidays.length);

    setTimeout(function () { trackerApp.displayData(); }, 500);

}

trackerApp.filterHolidays = (dataFromApi) => {

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

}


trackerApp.calcDays = () => {

    // hours*minutes*seconds*milliseconds
    const oneDay = 24 * 60 * 60 * 1000;

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
    trackerApp.setCurrentDate();

    trackerApp.getCountries();

    trackerApp.getHolidays();
}


trackerApp.init();