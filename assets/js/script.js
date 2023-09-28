// API call format: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Geocoder API Call format: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// Geocoder by zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
// For testing: Add this url to start of fetch urls to fix cors issues||You may need to navigate to the site first and click a button
// https://cors-anywhere.herokuapp.com/

const userInput = $("#city-search");
const historyList = $('#history-container');
const currWeather = $('#weather-now');
const forecast5 = $('#forecast-container');
const apiKey = '2725dd5b69d4117690f6ed292d63b0cb';
var pastSearches;

// init opens saved history shows last searched weather
function init() {
    pastSearches = localStorage.getItem('history');
    console.log(pastSearches);
    if (pastSearches) {
        pastSearches = JSON.parse(pastSearches)
        populateHistory();
    } else {
        pastSearches = [];
    }
}

// populates history with clickable buttons of previously searched cities
function populateHistory() {
    historyList.html('');
    for (let i=0; i < pastSearches.length; i++) {
        const historyEl = $('<button class="btn btn-outline-primary btn-history col-12 m-1" type="button" data-index="' + i + '">')
        historyEl.text(pastSearches[i].name);
        historyList.append(historyEl);
    }
}

// Searches for a given city and gets name, latitude, and longitude to save to history and calls showWeather
function getGeoData(city) {
    fetch("https://api.openweathermap.org/geo/1.0/direct?appid=" + apiKey + "&q=" + city)
        .then(function(response) {
            if (!response.ok) {
                throw response.json();
            }
            return response.json();
        })
        .then(function(data) {
            if (data.length) {
                pastSearches.push({name: data[0].name, lat: data[0].lat, lon: data[0].lon});
                localStorage.setItem("history", JSON.stringify(pastSearches));
                showWeather(data[0].lat,data[0].lon);
                populateHistory();
            }
        })
}

// Finds weather forecast for given latitude, longitude coordinates and displays current day and 5 day forecast
function showWeather(lat,lon) {
    fetch("https://api.openweathermap.org/data/2.5/forecast?units=imperial&lat=" + lat + "&lon=" +lon+ "&appid=" + apiKey)
    .then(function(response) {
        if (!response.ok) {
            throw response.json();
        }
        return response.json();
    })
    .then(function(data){
        currWeather.empty();
        let date = data.list[0].dt;
        date = dayjs.unix(date).format('M/D/YYYY');
        const headEl = $('<h2>'+ data.city.name + " (" + date + ") <img src='https://openweathermap.org/img/wn/" + data.list[0].weather[0].icon + "@2x.png' alt="+ data.list[0].weather[0].main + "></h2>");
        const tempEl = $('<p>Temp: ' + data.list[0].main.temp + '&degF</p>');
        const windEl = $('<p>Wind: ' + data.list[0].wind.speed + ' MPH</p>');
        const humidityEl = $('<p>Humidity: ' + data.list[0].main.humidity + '&#37</p>');
        currWeather.append(headEl,tempEl,windEl,humidityEl);
        $('#forecast-title').text('5-Day Forecast:')
        forecast5.empty();
        for (let i=7; i<data.list.length; i+=8) {
            const dayEl = $('<div class="card bg-success text-light col mx-1">');
            let date = data.list[i].dt;
            date = dayjs.unix(date).format('M/D/YYYY');
            const dateEl = $('<h5 class="card-title">'+date+'</h5>');
            const iconEl = $("<img src='https://openweathermap.org/img/wn/" + data.list[i].weather[0].icon + "@2x.png' alt="+ data.list[i].weather[0].main + ">");
            const tempEl = $('<p class="card-text">Temp: ' + data.list[i].main.temp + '&degF</p>');
            const windEl = $('<p class="card-text">Wind: ' + data.list[i].wind.speed + ' MPH</p>');
            const humidityEl = $('<p class="card-text">Humidity: ' + data.list[i].main.humidity + '&#37</p>');
            dayEl.append(dateEl,iconEl,tempEl,windEl,humidityEl);
            forecast5.append(dayEl);
        }
    })
}

$(function() {
    init();
    // When city is submitted, searches for city's weather
    userInput.on('submit', function(event) {
        event.preventDefault();
        var queryCity = $('#text-input').val().trim();
        $('#text-input').val('');
        if (queryCity) {
            getGeoData(queryCity);
        }
    });
    // When previously searched city is clicked, searches for city's weather again
    historyList.on('click', '.btn-history', function(event) {
        event.preventDefault();
        indexClicked = parseInt(event.target.closest('.btn-history').dataset.index);
        showWeather(pastSearches[indexClicked].lat, pastSearches[indexClicked].lon);
        pastSearches.push(pastSearches.splice(indexClicked,1)[0]);
        localStorage.setItem("history", JSON.stringify(pastSearches));
        populateHistory();
    })
})