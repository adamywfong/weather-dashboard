// API Key: 2725dd5b69d4117690f6ed292d63b0cb
// API call format: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Geocoder API Call format: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// Geocoder by zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
var userInput = $("#city-search");
var historyList = $('#history-container');
var currWeather = $('#weather-now');
var forecast5 = $('#forecast-container');
var history;

// init opens saved history shows last searched weather
function init() {
    history = localStorage.getItem("history");
    if (history) {
        history = JSON.parse(history)
        populateHistory;
        showWeather(history[history.length-1].lat,history[history.length-1].lon);
    } else {
        history = [];
    }
}

// populates history with clickable buttons of previously searched cities
function populateHistory() {
    historyList.html('');
    for (var i=0; i < history.length; i++) {
        var historyEl = $('<button class="btn btn-secondary btn-history" type="button" data-index="' + i + '">')
        historyEl.text(history[i].name);
        historyList.append(historyEl);
    }
}

// Searches for a given city and gets name, latitude, and longitude to save to history and calls showWeather
function getGeoData(city) {
    fetch("http://api.openweathermap.org/geo/1.0/direct?appid=" + apiKey + "&q=" + city)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            if (data.length) {
                history.push({name: data[0].name, lat: data[0].lat, lon: data[0].lon});
                localStorage.setItem("history", JSON.stringify(history));
                showWeather(data[0].lat,data[0].lon);
            } else {
                showError();
            }
        })
}

// Finds weather forecast for given latitude, longitude coordinates and displays current day and 5 day forecast
function showWeather(lat,lon) {
    fetch("api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" + lat + "&lon=" +lon+ "&appid=" + apiKey)
    .then(function(response) {
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
    })
    .then(function(data){
        console.log(data);
        var date = data.list[0].dt;
        date = dayjs.unix(date).format('M/D/YYYY');
        var icon = data.list[0].weather.icon;
        var temp = data.list[0].main.temp;
        var wind = data.list[0].wind.speed;
        var humidity = data.list[0].main.humidity;
        currWeather.html(data + icon + temp + wind + humidity); //i'll figure this out later
        // add header that says "5 day forecast" to forecast5 
        for (var i=8; i<data.list.length; i+=8) {
            dayEl = $('<div class="card">');
            date = data.list[i].dt;
            date = dayjs.unix(date).format('M/D/YYYY');
            icon = data.list[i].weather.icon;
            temp = data.list[i].main.temp;
            wind = data.list[i].wind.speed;
            humidity = data.list[i].main.humidity;
            //give dayEl all the things
            forecast5.append(dayEl);
        }
    })
}

// TODO: add error message
function showError() {
    console.log("City not found");
}

// When city is submitted, searches for city's weather
userInput.on('submit', function(event) {
    event.preventDefault();
    queryCity = $('#text-input').val().trim();
    $('#text-input').val('');
    if (queryCity) {
        getGeoData(queryCity);
        populateHistory;
    }
});

// When previously searched city is clicked, searches for city's weather again
historyList.on('click', '.btn-history', function(event) {
    event.preventDefault();
    indexClicked = parseInt(event.target.closest('.btn-history').dataset.index);
    showWeather(history[indexClicked].lat,history[indexClicked].lon);
    history.push(history.splice(indexClicked,1)[0]);
    localStorage.setItem("history", JSON.stringify(history));
    populateHistory;
})

// init();