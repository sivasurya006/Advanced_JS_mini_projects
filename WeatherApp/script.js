// setView call also returns the map object
// element id as a parameter 
// Change ICON display Method


const defaultLatLng = {
    lat : 8.902699984038293,
    lng : 77.33574313876575
}

const API_KEY = "58ad14bdd0724b84bce00c5661ccf730";   // For reverse Geocoding
const tileLayerURL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const weatherURL = "https://api.open-meteo.com/v1/forecast?";



const map = L.map('map').setView([defaultLatLng.lat,defaultLatLng.lng], 12);

L.tileLayer(tileLayerURL, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', onMapClick);


let marker = L.marker([defaultLatLng.lat,defaultLatLng.lng]).addTo(map);
// getPlaceName(defaultLatLng);
let popup = L.popup();




function onMapClick(e) {
        getPlaceName(e.latlng);
        map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
}

function getPlaceName(latlng){
    fetch(`https://api.opencagedata.com/geocode/v1/json?key=${API_KEY}&q=${latlng.lat}%2C+${latlng.lng}`)
        .then((res) =>  res.json())
        .then((data) => {
           showPopUp(latlng,data);
           updateCurrentDetails(latlng,data);
           fetchWeatherDetails(latlng,data.results[0].annotations.timezone.name);
        }).catch((err) => {
            console.log(err);
        });
}

function showPopUp(latlng,data){
    popup.setLatLng(latlng)
            .setContent(data.results[0].formatted ?? "Can't get place name")
            .openOn(map);
    marker.bindPopup(markerPopUp(data));
}


function markerPopUp(data){
    return `<b>${data.results[0].formatted ?? "Can't get place name"}</b>`;
}


function updateCurrentDetails(latlng,data){
    country.innerText = data.results[0].components.country;
    state.innerText = data.results[0].components.state;
    coordinates.innerText = latlng.lat.toFixed(2) + " / " + latlng.lng.toFixed(2);
    let entries = Object.entries(data.results[0].components);
    let areaData =  entries[entries.length - 1];
    area.innerText = getProperName(areaData[0])+ " : " ;
    areaName.innerText = areaData[1];
}



function getProperName(name){
    return name.split("_").map((data) => data.charAt(0).toUpperCase() + data.slice(1).toLowerCase()).join(" ")
}

function fetchWeatherDetails(latlng,timezone){
    console.log("TimeZone : "+timezone);
    fetch(weatherURL+`latitude=${latlng.lat}&longitude=${latlng.lng}&current_weather=true&hourly=temperature_2m,relative_humidity_2m&timezone=${timezone}&hourly=weathercode`)
        .then((res) => res.json())
        .then((data) => {
            loadWeatherDetails(data);
        }).catch((err) => {
            console.log(err);
        });
}

function loadWeatherDetails(data){
    showCurrentWeatherDetails(data.current_weather,data.current_weather_units);
    showUpComingWeatherDetails(data.hourly_units,data.hourly);
}

function showCurrentWeatherDetails(weather,units){
    currentWeatherIcon.src = iconURL[weather.weathercode] ?? "./images/Cloud.png";
    windSpeed.innerText = weather.windspeed+" "+units.windspeed;
    temp.innerText = weather.temperature+" "+units.temperature;
    day.innerText = DAYS[weather.is_day];
}

function showUpComingWeatherDetails(units,hourly){
    upComingWeatherBoxes.innerHTML = '';
    const tempUnit = units.temperature_2m;
    const humidityUnit = units.relative_humidity_2m;
    for(let i=0;i<hourly.time.length;i++){
        let temp = {
            val : hourly.temperature_2m[i],
            unit : tempUnit
        }
        humidity = {
            val : hourly.relative_humidity_2m[i],
            unit : humidityUnit
        }
        // console.log(createWeatherBox(temp,humidity,hourly.weathercode[i],hourly.time[i]));
        upComingWeatherBoxes.innerHTML += createWeatherBox(temp,humidity,hourly.weathercode[i],hourly.time[i]);
    }
}


function createWeatherBox(temp,humidity,weathercode,date){
    return ` <div class="upWeatherBox">
                <div class="weatherIconContainer">
                    <img src=${iconURL[weathercode] ?? "./images/Cloud.png"} />
                </div>
                <div>
                    <p>Temperature : <span>${temp.val+temp.unit}</span></p>
                    <p>Humidity : <span>${humidity.val+humidity.unit}</span></p>
                    <p>Date : <span>${date}</span></p>
                </div>
            </div> `;
}

const DAYS = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

const iconURL = {
    0 : "./images/Sun.png",
    1 : "./images/Sun.png",
    2 : "./images/Cloudy_Sky.png",
    3 : "./images/Cloudy_Sky.png",
    4 : "./images/Cloudy_Sky.png",

    61 : "./images/Rain.png",
    62 : "./images/Rain.png",
    63 : "./images/Rain.png",
    64 : "./images/Rain.png",

    71 : "./images/Snow.png",
    72 : "./images/Snow.png",
    73 : "./images/Snow.png",
    74 : "./images/Snow.png",
    75 : "./images/Snow.png",

    95 : "./images/Thunderstorm.png",
    96 : "./images/Thunderstorm.png",
    97 : "./images/Thunderstorm.png"  
}