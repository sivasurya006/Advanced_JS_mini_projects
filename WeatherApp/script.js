// setView call also returns the map object
// element id as a parameter 
// Change ICON display Method


const defaultLatLng = {
    lat : 8.912169,
    lng : 77.332971
}

const API_KEY = "58ad14bdd0724b84bce00c5661ccf730";   // For Geocoding
const tileLayerURL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const weatherURL = "https://api.open-meteo.com/v1/forecast?";



const map = L.map('map').setView([defaultLatLng.lat,defaultLatLng.lng], 12);

L.tileLayer(tileLayerURL, {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

let geoCoding = L.control.maptilerGeocoding({ apiKey: "aZOjPiMhXhPDZYlLzV2D", placeholder : "search here..." }).addTo(map);


let marker = L.marker([defaultLatLng.lat,defaultLatLng.lng]).addTo(map);
getPlaceName(defaultLatLng);
let popup = L.popup();

console.dir(geoCoding);

geoCoding.on('response',function (e) {
    if(e.featureCollection.features.length == 1){
        console.log(e.featureCollection.features[0]);
        let latlng = e.featureCollection.features[0].center;
        getPlaceName({lat:latlng[1],lng:latlng[0]},false);
        map.removeLayer(marker);
        marker = L.marker([latlng[1], latlng[0]]).addTo(map);
    }
    
})

map.on('click', onMapClick);





function onMapClick(e) {
        getPlaceName(e.latlng);
        map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
}

function getPlaceName(latlng,pop = true){
    fetch(`https://api.opencagedata.com/geocode/v1/json?key=${API_KEY}&q=${latlng.lat}%2C+${latlng.lng}`)
        .then((res) =>  res.json())
        .then((data) => {
            if(pop){
                showPopUp(latlng,data);
            }
           updateCurrentDetails(latlng,data);
           fetchWeatherDetails(latlng,data.results[0].annotations.timezone.name);
        }).catch((err) => {
            mainSection.innerHTML = `<p class="error">Can't fetch weather details please try again</p>`;
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

searchBox.addEventListener('keydown',(e) => {
    if(e.key == "Enter" && searchBox.value.length > 0){
        placesSelect.classList.add('hide');
        placeMsg.innerText = '';
        forwardGeoCoding(searchBox.value);
    }
});



function forwardGeoCoding(placeName){
    fetch(`https://api.opencagedata.com/geocode/v1/json?q=${placeName}&key=${API_KEY}`)
    .then((res) => {
        return res.json();
    }).then((obj) => {
        showOptions(obj);
    }).catch((err) => {
        mainSection.innerHTML = `<p class="error">Can't fetch weather details please try again</p>`;
        console.log(err);
    });
}

function showOptions(data){
    placeMsg.innerText = '';
    if(data.total_results == 0){
        placeMsg.innerText = 'Place not Found!';
        return;
    }
    if(data.total_results == 1){
        let result = data.results[0];
        getPlaceName({lat :result.geometry.lat ,lng : result.geometry.lng});
        map.removeLayer(marker);
        marker = L.marker([result.geometry.lat, result.geometry.lng]).addTo(map);
        placesSelect.classList.add('hide');
        return;
    }
    placesSelect.classList.remove('hide');
    placesSelect.innerHTML = '<option value=-1>Select the correct place</option>';
    console.log(data);
    if(data.total_results > 0){
        for(let result of data.results){
            placesSelect.innerHTML += getOptionElement(result);
        }
    }else{
        placesSelect.innerHTML += `<option value=-1>Place not found!</option>`;
    }
}

placesSelect.addEventListener('change',(e) => {
    const select = e.target;                        
    const option = select.options[select.selectedIndex]; 

    const lati = Number(option.dataset.lat);
    const long = Number(option.dataset.lng);

    if(lati && long){
        let latlng = {lat : lati, lng : long};
        getPlaceName(latlng);
        map.removeLayer(marker);
        marker = L.marker([latlng.lat, latlng.lng]).addTo(map);
        placesSelect.classList.add('hide');
    }
});


function getOptionElement(result){
    return `<option data-lat=${result.geometry.lat} data-lng=${result.geometry.lng}>${result.formatted}</option>`
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
            mainSection.innerHTML = `<p class="error">Can't fetch weather details please try again</p>`;
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
    day.innerText = weather.is_day == 1 ? "Day time" : "Night";
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
        let wBox;
        let founded = false;
        if(!founded && i == new Date().getHours()){
            wBox = createWeatherBox(temp,humidity,hourly.weathercode[i],new Date(hourly.time[i]),"current");
            founded = true;
        }else{
            wBox = createWeatherBox(temp,humidity,hourly.weathercode[i],new Date(hourly.time[i]));
        }
        upComingWeatherBoxes.innerHTML += wBox;
    }
    current.scrollIntoView({
        inline: 'center'
    });
    console.log(currentBtn);
    currentBtn.classList.remove('hide');
}

currentBtn.addEventListener('click',() => {
    current.scrollIntoView({
        inline: 'center'
    });
});

function createWeatherBox(temp,humidity,weathercode,date,id){
    const options = {
        hour: "2-digit",
        minute: undefined,
        second: undefined,
        hour12: true
      };
      console.log(id == "current");
    return ` <div class="upWeatherBox" id=${id ?? ""}>
                <div class="time">${ id == "current" ? "Now" : date.toLocaleTimeString('en-in',options)}</div>
                <div class="weatherIconContainer">
                    <img src=${iconURL[weathercode] ?? "./images/Cloud.png"} />
                </div>
                <div>
                    <pre><strong>Temperature</strong> : <span>${temp.val+temp.unit}</span></pre>
                    <pre><strong>Humidity</strong>    : <span>${humidity.val+humidity.unit}</span></pre>
                    <pre><strong>Date</strong>        : <span>${date.toLocaleDateString("en-in")}</span></pre>
                </div>
            </div> `;
}


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