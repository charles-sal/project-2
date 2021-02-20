

//create app object
const trackerApp = {};

//save relevant API information
trackerApp.apiUrl = "https://calendarific.com/api/v2/holidays";
trackerApp.apiKey = "cfcdc8d5af30432ed42334fb974070b9949133aa";


trackerApp.time = 
trackerApp.year = 2020;



trackerApp.country = "CA";

document.addEventListener("contextmenu", function(e) {

    e.preventDefault();

    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

    let x = document.getElementById("birthday").value;
    console.log(x);
    const dateX = x.split('-');

    let y = document.getElementById("birthday-1").value;
    console.log(y);
    const dateY = y.split('-');

    const firstDate = new Date(dateX);
    console.log(firstDate);
    
    const secondDate = new Date(dateY);
    console.log(secondDate);

    let diffDays = ((secondDate - firstDate) / oneDay) + 1;
    console.log(diffDays);

    let startDay = firstDate.getDay();
    let endDay = secondDate.getDay();


    if (startDay === 0) {
        startDay += 7;
    } 

    if (endDay === 0) {
        endDay += 7;
    }

    if (diffDays >= 7) {
    let extraDays = diffDays % 7;
    // Output from above: 1 to 6
    }
    else {
    let extraDays = 6 - diffDays;
    }
    console.log("Extra Days: ", extraDays);

    let weekEnd = Math.trunc(diffDays / 7) * 2;

    if (extraDays === Math.abs(6 - startDay)) {
        weekEnd++;
    }

    else if (extraDays === (7 - startDay)) {
        weekEnd += 2;
    }
    
    console.log("Number of Weekend Days: ", weekEnd);
    const weekDays = (diffDays) - weekEnd;
    console.log("Number of Work Days:", weekDays);

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