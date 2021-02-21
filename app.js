

//create app object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/holidays";
trackerApp.apiKey = "cfcdc8d5af30432ed42334fb974070b9949133aa";


// trackerApp.time = 
trackerApp.year = 2020;



trackerApp.country = "CA";

document.addEventListener("contextmenu", function(e) {

    // e.preventDefault();

    // hours*minutes*seconds*milliseconds
    const oneDay = 24 * 60 * 60 * 1000; 
    
    // Get the user input from date selector and store the value in order to convert it into an array to pass it on to the Date() constructor
    let startDateInput = document.getElementById("start").value;
    const startDateArray = startDateInput.split('-');
    const startDate = new Date(startDateArray);
    // console.log(startDateArray);
    

    let endDateInput = document.getElementById("end").value;
    const endDateArray = endDateInput.split('-');
    const endDate = new Date(endDateArray);
    // console.log(endDateArray);
    
    // Get the duration by subtracting the Date() constructors between start and end date. Because the date constructor value is represnted by the number of millisceonds we need to divide by the number of milliseconds per day to get back the number of days. We then add 1 in order to count the first day.
    let totalDays = ((endDate - startDate) / oneDay) + 1;
    // console.log('Total Days:', totalDays);
    
    
    // We use startDay and endDay to know the day of the week that we are on in order to pass this information to our algorithm for calculating the number of actual weekend days accurately.
    let startDay = startDate.getDay();
    // console.log('Start Day:', startDay);
    
    let endDay = endDate.getDay();
    

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

    // Calculates the number of weekEndDays in the project timeline (for every week we pass it should be multiplied by 2 cause we have Saturday and Sunday)
    let weekEndDays = Math.trunc(totalDays / 7) * 2;
    // console.log('Weekend before adding extra days:', weekEndDays);
    

    // Checks if startDay or endDay falls on a Saturday to add an extra weekend day
    if (extraDays === Math.abs(6 - startDay) || endDay === 6) {
        weekEndDays++;
    }

    // Checks if startDay or endDay falls on a Sunday to add an extra weekend day
    else if (extraDays === (7 - startDay) || endDay === 7) {
        weekEndDays += 2;
    }
    
    // console.log("Number of Weekend Days: ", weekEndDays);
    const workDays = (totalDays) - weekEndDays;
    // console.log("Number of Work Days:", workDays);

}); 



//create a method (AKA function on the app object) which requests information from the API
//logs it to the console
trackerApp.getHolidays = () => {

    //use the URL constructor to specify the parameters we wish to include in our API endpoint (AKA in the request we are making to the API)
    const url = new URL(trackerApp.apiUrl);
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

    //query the document and find the first ul
    // const ul = document.querySelector('ul');
    const holidayData = [];
    for (i=0; i < dataFromApi.response.holidays.length; i++) {

        if (dataFromApi.response.holidays[i].type[0] === "National holiday" && dataFromApi.response.holidays[i].locations === "All") {
        
            holidayData.push(dataFromApi.response.holidays[i]);

        }
    }
    console.log(holidayData);
    
    //take the data from the API and interate through it
    //for EACH object in API we will:
    
    // dataFromApi.forEach((datum) => {

    //     //create list elements 
    //     // const listElement = document.createElement('li');

    //     // //create image elements
    //     // const image = document.createElement('img');
    //     //add content for img alt and src attributes
    //     let i = datum.holidays;
    //     console.log(i);
        
    //     // image.alt = datum.alt_description;

    //     //append the image element to its parent li
    //     // listElement.appendChild(image);

    //     //append the li to the gallery ul
    //     // ul.appendChild(listElement);
    // })
}


//create an initialization method
trackerApp.init = () => {
    //calling the method which makes the request to the API
    trackerApp.getHolidays();
    // trackerApp.myFunction();
}

trackerApp.init();