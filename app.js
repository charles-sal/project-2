
//create trackerApp object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/";

// API key
trackerApp.apiKey = "7a972d65dd8c5d720ff7964ff537e32fff7fde67";

// stores the number of weekdays in index 0 and the number of weekends in index 1
trackerApp.daysParam = [];

// add selectedCountries property in global scope
trackerApp.selectedCountries = [];

// add holiday dates array of selected countries
trackerApp.holidaysByCountry = [];

// Add array of all retrieved countries that we ran through the API.  The indices in this array are in sync with the indices in the trackerApp.holidaysByCountry array
trackerApp.retrievedCountries = [];

// add empty array to track all holidays from all selected countries (1-D array)
trackerApp.allHolidays = [];

// add empty array to keep the number of shared holidays between all selected countries
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
        .then((jsonResponse) => {
            trackerApp.appendCountries(jsonResponse);
        })
}

// Function to append list of all countries received from the API to the dropdown menu on the .sidePane for user selection
trackerApp.appendCountries = (countriesFromApi) => {
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

// Function to reset and display latest trackerApp data onto screen
trackerApp.displayData = () => {
    //Tracks unused countries (country #2 and #3) if user does not select them
    const unusedCountryEl2 = document.querySelector(`#country2`);
    const unusedCountryEl3 = document.querySelector(`#country3`);

    // Renders country #2 and country #3 elements to be visible on page.
    unusedCountryEl2.classList.remove('hideEl');
    unusedCountryEl3.classList.remove('hideEl');

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
    } else if (trackerApp.retrievedCountries.length === 1) {
        // Display:none for the second and third DIV
        unusedCountryEl2.classList.add('hideEl');
        unusedCountryEl3.classList.add('hideEl');
    }

    // For "holidays by country" #1, #2, and #3 bar graphs
    for (let i = 0; i < trackerApp.retrievedCountries.length; i++) {
        const countryEl = document.querySelector(`#country${i + 1} .graph`);
        countryEl.style.width = `${(trackerApp.holidaysByCountry[i].length / trackerApp.filteredWorkingDays) * 80}%`;
        const countryNum = document.querySelector(`#country${i + 1} h3`);
        countryNum.textContent = `${trackerApp.retrievedCountries[i].toUpperCase()}, ${trackerApp.holidaysByCountry[i].length}`;
    }
}

// Function to get all user inputs on form submit (which is later used to process and display the data to the user)
// Includes error checking to alert the user if their input date range and/or their countries selected > 3 countries
// Also includes reporting of error in retrieving data in case one or more API calls fail
trackerApp.getHolidays = () => {
    //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the requests we are making to the API)
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
            // Reset array of all retrieved countries that we ran through the API
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

                const url = new URL(trackerApp.apiUrl + `holidays`);
                url.search = new URLSearchParams({
                    api_key: trackerApp.apiKey,
                    country: trackerApp.selectedCountries[index],
                    year: trackerApp.year,
                })

                //Using the fetch API to make requests to the Calendarific API endpoint
                fetch(url)
                    .then((response) => {
                        return response.json();
                    })
                    .then((jsonResponse) => {
                        trackerApp.filterHolidays(jsonResponse);
                        if (index === allUserCountrySelections.length - 1) {
                            trackerApp.filterSharedHolidays();
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
// Step 1: Loop through the array of trackerApp.allholidays (which includes duplicate dates from all selected countries).  Compare the holiday date stored in the current index of the trackerApp.allHolidays array to all holiday dates from this array belonging to the current index position and higher.
// Step 2: If a holiday occurs the same number of times as the number of countries the user had selected, store this holiday date into a new sharedHolidays array and reset the counter back to 0.  
// Step 3: Repeat steps 1 and 2 for every index position in the trackerApp.allHolidays array.
trackerApp.filterSharedHolidays = () => {
    // Clear all trackerApp shared holidays before running this function
    trackerApp.sharedHolidays = [];
    for (let i = 0; i < trackerApp.allHolidays.length; i++) {
        let counter = 0;
        for (let j = i; j < trackerApp.allHolidays.length; j++) {
            if (trackerApp.allHolidays[j].getTime() === trackerApp.allHolidays[i].getTime()) {
                counter++;
                if (counter === trackerApp.selectedCountries.length) {
                    trackerApp.sharedHolidays.push(trackerApp.allHolidays[i]);
                }
            }
        }
    }
    trackerApp.filteredWorkingDays = trackerApp.daysParam[0] - trackerApp.sharedHolidays.length;
    setTimeout(function () { trackerApp.displayData(); }, 500);
}

// Extract out all national holidays for all retrieved countries between the input dates and store them into the holidayData array.
trackerApp.filterHolidays = (dataFromApi) => {

    trackerApp.calcDays();
    const holidayData = [];
    let j = 0;
    let currentHolidays = [];

    for (i = 0; i < dataFromApi.response.holidays.length; i++) {

        // Filters out all holidays for the current country that are national holidays observed throughout the entire country. 
        if (dataFromApi.response.holidays[i].type[0] === "National holiday" && dataFromApi.response.holidays[i].locations === "All") {
            holidayData.push(dataFromApi.response.holidays[i].date.iso);
            const holiDate = new Date(holidayData[j]);
            j++;

            // Filters out all holidays between the start and end dates of the input date range and push them 1) to the currentHolidays array and 2) push them to the trackerApp.allHolidays array (which stores all holidays from all retieved countries into an array)
            if (trackerApp.startDate <= holiDate && trackerApp.endDate >= holiDate) {
                currentHolidays.push(holiDate);
                trackerApp.allHolidays.push(holiDate);
            }
        }
    }

    // Push the holidays from the currently processed country as an array into the larger trackerApp.holidaysByCountry array.
    trackerApp.holidaysByCountry.push(currentHolidays);

    // Push the currently processed country code into trackerApp.retrievedCountries (an array with indices that corresponds to the current holidays that we are running.)
    trackerApp.retrievedCountries.push(dataFromApi.response.holidays[0].country.id);
}

// Function to calculate the number of working days and weekend days for the input date range from the user
trackerApp.calcDays = () => {

    // Hours*minutes*seconds*milliseconds
    const oneDay = 24 * 60 * 60 * 1000;

    // Get the duration by subtracting the Date() constructors between start and end date. Because the date constructor value is represnted by the number of millisceonds we need to divide by the number of milliseconds per day to get back the number of days. We then add 1 in order to count the first day.
    let totalDays = ((trackerApp.endDate - trackerApp.startDate) / oneDay) + 1;

    // We use startDay and endDay to know the day of the week that we are on in order to pass this information to our algorithm for calculating the number of actual weekend days accurately.
    let startDay = trackerApp.startDate.getDay();
    let endDay = trackerApp.endDate.getDay();

    // Tracks the number of surplus days over and above a series of complete weeks or if it is less than a week, then it tracks the number of days before it completes a week.
    let extraDays = 0;

    // Modify the startDay and endDay date values so that sunday will correspond to Day 7. This way Monday (start of the week) will correspond to Day 1 and Sunday (end of the week) will correspond to Day 7.
    if (startDay === 0) {
        startDay += 7;
    }

    if (endDay === 0) {
        endDay += 7;
    }

    // If the totalDays is more than a week then it will divide the number of weeks by 7 and give us the remainder of the number of surplus days over and above a series of complete weeks. Else if the number of totalDays is less than a week then it calculates the number of days before it completes a full week.
    if (totalDays >= 7) {
        extraDays = totalDays % 7;
    }
    else {
        extraDays = 6 - totalDays;
    }

    // Calculates the number of weekEndDays in the project timeline (for every week we pass in, it should be multiplied by 2 because we have Saturday and Sunday)
    let weekEndDays = Math.trunc(totalDays / 7) * 2;

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

    const workDays = (totalDays) - weekEndDays;
    trackerApp.daysParam.push(workDays, weekEndDays);
}

//create an initialization method
trackerApp.init = () => {
    trackerApp.setCurrentDate();
    trackerApp.getCountries();
    trackerApp.getHolidays();
}

trackerApp.init();