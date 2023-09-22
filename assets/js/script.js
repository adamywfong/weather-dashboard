// API Key: 2725dd5b69d4117690f6ed292d63b0cb
// API call format: api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API key}
// Geocoder API Call format: http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
// Geocoder by zip code: http://api.openweathermap.org/geo/1.0/zip?zip={zip code},{country code}&appid={API key}
var userInput = $("#city-search");
var historyList = $('#history-container');
var currWeather = $('#weather-now');
var forecast5 = $('#forecast-container');
var history;
var lastCity;

// init opens saved history shows last searched weather
function init() {
    history = localStorage.getItem("history");
    if (history) {
        history = JSON.parse(history)
        populateHistory(history);
    } else {
        history = [];
    }
    lastCity = localStorage.getItem("lastCity");
    if (lastCity) {
        showWeather(lastCity);
    }
}

function populateHistory(array) {
    historyList.html('');
    for (var i=0; i < array.length; i++) {
        var historyEl = $('<button class="btn-history" data-index="' + i + '">')
        historyEl.text(array[i]);
        historyList.append(historyEl);
    }
}

userInput.on('submit', function(event) {
    event.preventDefault();
    queryCity = userInput.children('<input>').val().trim();
    if (queryCity) {
        history.push(queryCity);
        localStorage.setItem("history", JSON.stringify(history));
        showWeather(queryCity);
        populateHistory(history);
    }
});

historyList.on('click', '.btn-history', function(event) {
    event.preventDefault();
    indexClicked = event.target.closest('.btn-history').dataset.index;
    showWeather(history[indexClicked]);
})