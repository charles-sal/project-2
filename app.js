

//create app object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/";
trackerApp.apiKey = "cfcdc8d5af30432ed42334fb974070b9949133aa";
trackerApp.daysParam = [];

trackerApp.startDate = new Date(document.getElementById("start").value);


trackerApp.endDate = new Date(document.getElementById("end").value);


// trackerApp.time = 
trackerApp.year = 2021;
trackerApp.country = "UK";


//create a method (AKA function on the app object) which requests information from the API
//logs it to the console

trackerApp.getCountries = () => {
    const url = new URL(trackerApp.apiUrl+`countries`);
    url.search = new URLSearchParams({
    api_key: trackerApp.apiKey,
    })

    fetch(url)
    .then((response) => {
        console.log(response);
        return response.json();
    })

    //parse the JSON Promise and log out readable data (AKA data JSON format)
    .then((jsonResponse) => {
        console.log(jsonResponse);
        trackerApp.appendCountries(jsonResponse);
    })
}

trackerApp.appendCountries = (countriesFromApi) => {
    // i=0;
    let country = '';
    let countryCode = '';
    const selectElement = document.querySelector('select');
    let option ;

     for (i=0; i < countriesFromApi.response.countries.length; i++) { 
        
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


trackerApp.getHolidays = () => {

    //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the request we are making to the API)
    const url = new URL(trackerApp.apiUrl+`holidays`);
    url.search = new URLSearchParams({

    api_key: trackerApp.apiKey,
    country: trackerApp.country,
    year: trackerApp.year,

    })

    //using the fetch API to make a request to the Unsplash API photos endpoint
    fetch(url)
    .then((response) => {
        console.log(response);
        //parse this response into JSON
        //return JSON response so that it can be used in the next function
        return response.json();
    })

    //parse the JSON Promise and log out readable data (AKA data JSON format)
    .then((jsonResponse) => {
        console.log(jsonResponse);

        //pass the data into the displayPhotos method
        //AKA call the displayPhotos within getPhotos
        trackerApp.filterHolidays(jsonResponse);
    })
}


//create a method to display phots on the front end
trackerApp.filterHolidays = (dataFromApi) => {

    // query the document and find the first ul
    // const ul = document.querySelector('ul');
    trackerApp.calcDays();
    // console.log(trackerApp.daysParam);
    

    const holidayData = [];
    let j = 0;
    let counter = 0;
    let holidays = 0;
    let filteredWorkingDays = 0;
    const sharedHolidays = 0;

    // console.log(dataFromApi.response.holidays);

    for (i=0; i < dataFromApi.response.holidays.length; i++) {

        if (dataFromApi.response.holidays[i].type[0] === "National holiday" && dataFromApi.response.holidays[i].locations === "All") {
        
            holidayData.push(dataFromApi.response.holidays[i].date.iso);
            const holiDate = new Date(holidayData[j]);
            
            let holiDay = holiDate.getDay();
            j++;
            
            

            if (trackerApp.startDate <= holiDate && trackerApp.endDate >= holiDate) {

                holidays++;
                if (holiDay > 5 || holiDay < 1) {
                    counter++;
                }
            }

        }
    }
    // console.log(trackerApp.daysParam);
    
    filteredWorkingDays = trackerApp.daysParam[0] - holidays;

    console.log('Number of workdays between given dates:', filteredWorkingDays);
    
    console.log('Number of holidays between given dates:', holidays);
    
    console.log('Holidays that fall on weekends:', counter);

    console.log('Number of weekends between given dates:', trackerApp.daysParam[1]);
    
    
    console.log(holidayData);
}


trackerApp.calcDays = () =>  {

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
    //calling the method which makes the request to the API
    trackerApp.getCountries();

    trackerApp.getHolidays();
    // trackerApp.myFunction();
}


trackerApp.init();