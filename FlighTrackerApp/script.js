const AIR_KEY = `40055c2c-e905-4426-8cff-4b92667982fb`;
const BASE_URL = `https://airlabs.co/api/v9/schedules?api_key=${AIR_KEY}`;
const FLIGHT_URL = `https://airlabs.co/api/v9/flight?api_key=${AIR_KEY}`;


// Elements
const input = document.getElementById('input');
const searchBtn = document.getElementById('searchBtn');
const searchOptions = document.getElementsByName('iataCode');
// const message = document.getElementById('msg');
const nextPage = document.getElementById('nextPage');
const prevPage = document.getElementById('prevPage');
const popup = document.getElementById("popup");
const overlay = document.getElementById("overlay");
const popupContent = document.getElementById("popupContent");
const flightStatus = document.getElementById("status");
const arrival = document.getElementById("arr");
const departure = document.getElementById("dep");
const airLine = document.getElementById("airline");
const popupTitle = document.getElementById("popupTitle");

let page = 0;
let hasMore = false;
let currentURL = '';

searchBtn.addEventListener('click',searchHandler);
nextPage.addEventListener('click',loadNextPage);
prevPage.addEventListener('click',loadPrevPage);

document.addEventListener('click',(e) => {
    const card = e.target.closest('[data-action="flightCard"]');
    if (!card) return;
    console.log(card.dataset);
    const flightIata = card.dataset.flight_iata;
    if (flightIata) {
        console.log(flightIata);
        fetchFLightDetails(flightIata);
    }
});


function fetchFLightDetails(flight_iata){
    
    fetch(FLIGHT_URL+`&flight_iata=${flight_iata}`).then((res) => res.json()).then((obj) => {
        showFlightDetails(obj);
    }).catch((err) => {
       flightDataContainer.innerHTML = `<i class="fa-solid fa-plane logo"><p id="msg">${err}</p></i>`;
    })
}

function showFlightDetails(data){
    openPopup(data.response);
    console.log(data);
}


document.getElementById("closePopup").addEventListener("click", closePopup);
overlay.addEventListener("click", closePopup);

function openPopup(flight) {

    popupTitle.textContent = flight.flight_iata;

    airLine.textContent = `${flight.airline_name} (${flight.airline_iata})`;
 
    departure.innerHTML = `<strong>${flight.dep_city} (${flight.dep_iata})</strong><br>
                            ${flight.dep_name}<br>
                            Time: ${flight.dep_time}<br>
                            Gate: ${flight.dep_gate || "N/A"} - Terminal: ${flight.dep_terminal || "N/A"}`;
 
    arrival.innerHTML = `<strong>${flight.arr_city} (${flight.arr_iata})</strong><br>
                        ${flight.arr_name}<br>
                        Time: ${flight.arr_time}<br>
                        Gate: ${flight.arr_gate || "N/A"} | Terminal: ${flight.arr_terminal || "N/A"}`;
 

    flightStatus.innerHTML = `Status: <strong>${flight.status}</strong><br>
                              Delayed: ${flight.delayed ? "Yes" : "No"}<br>
                              Progress: ${flight.percent}%<br>`;

    popup.classList.remove("hidden");
    overlay.classList.remove("hidden");
}

function closePopup() {
    popup.classList.add("hidden");
    overlay.classList.add("hidden");
}


function loadNextPage(){
   if(hasMore){
    prevPage.disabled = false;
    flightDataContainer.innerHTML = '<i class="fa-solid fa-plane logo"><p id="msg">loading....</p></i>';
    if(currentURL.length == 0){
        console.log("currentURL");
        return;
    }
    searchParams = new URLSearchParams(currentURL.slice(currentURL.indexOf('&')));
    searchParams.set('offset',++page);
    currentURL = currentURL.substring(0,currentURL.indexOf('&')+1);
    currentURL = currentURL + searchParams.toString();

    fetchResults(currentURL);
    if(!hasMore){
        nextPage.disabled = true;
        console.log('finished');
    }
   }else{
        nextPage.disabled = true;
        console.log('finished');
   }
   if(page > 0){
       prevPage.disabled = false;
   }
}

function loadPrevPage(){
    if(page > 0){
        if(currentURL.length == 0){
            console.log("currentURL");
            return;
        }
        flightDataContainer.innerHTML = '<i class="fa-solid fa-plane logo"><p id="msg">loading....</p></i>';
        searchParams = new URLSearchParams(currentURL.slice(currentURL.indexOf('&')));
        searchParams.set('offset',--page);
        currentURL = currentURL.substring(0,currentURL.indexOf('&')+1);
        currentURL = currentURL + searchParams.toString();
        fetchResults(currentURL);
        if(page <= 0){
            prevPage.disabled = true;
            console.log('finished');
        }
       }else{
            prevPage.disabled = true;
            console.log('finished');
       }
      nextPage.disabled = false;
}

function searchHandler(){
    page = 0;
    flightDataContainer.innerHTML = '<i class="fa-solid fa-plane logo"><p id="msg">loading....</p></i>';
    const code = input.value.toUpperCase();
    if(isValidIata(code)){
        const queryKeys = getSearchOptionValue();
        let entrie = {
            offset : 0
        };
        for(q of queryKeys){
            entrie[q] = code;
        }

        const constructedURL = addQueryParameters(entrie);
        currentURL = constructedURL;
        fetchResults(constructedURL);
        navButtons.classList.remove('hidden');
    }else{
        flightDataContainer.innerHTML = '<i class="fa-solid fa-plane logo"><p id="msg">Enter valid IATA code</p></i>';
    }
}


function fetchResults(url){
    console.log(url);
    fetch(url).then((res) => res.json()).then((obj) => {
        hasMore = obj.request.has_more;
        showFlights(obj);
    }).catch((err) => {
       flightDataContainer.innerHTML = `<i class="fa-solid fa-plane logo"><p id="msg">${err}</p></i>`;
    })
}

function showFlights(flights){
    flightDataContainer.innerHTML = '';
    for(let data of flights.response){
        flightDataContainer.innerHTML += getFlightCard(data);
    }
}



function getFlightCard(response){
    return `
            <div data-action="flightCard" data-flight_iata=${response.flight_iata}>
            <div class="places">
                    <div>
                        <i class="fa-solid fa-plane-departure"></i>
                    </div>
                    <div>
                        <p>${response.flight_number}</p>
                        <p>${new Date(Number(response.dep_time_ts * 1000)).toDateString()}</p>
                    </div>
            </div>
                <div>
                    <p>${response.dep_iata}<span class="gate"> ,${response.dep_gate ?? "N/A"}</span></p>
                    <p>${new Date(response.dep_time_ts*1000).getHours().toString().padStart(2,"0")+" : "+new Date(response.dep_time_ts*1000).getMinutes().toString().padStart(2,"0")}</p>
                </div>
                <div class="durationSection">
                    <i class="fa-solid fa-plane"></i>
                    <div class="flightPath"></div>
                    <p>${getTimeString(response.duration)}</p>
                </div>
                <div class="places">
                    <div>
                        <i class="fa-solid fa-plane-arrival"></i>
                    </div>
                    <div>
                        <p>${response.arr_iata}<span class="gate"> ,${response.arr_gate ?? "N/A"}</span></p>
                        <p>${new Date(response.arr_time_ts*1000).getHours().toString().padStart(2,"0")+" : "+new Date(response.arr_time_ts*1000).getMinutes().toString().padStart(2,"0")}</p>
                    </div>
                </div>
                <div class="status">
                    <!-- status -->
                    <p>${response.status}</p>
                </div>
            </div>
    `
}

function getTimeString(minutes){
    let hours = Math.floor(minutes/60);
    minutes %= 60;
    return `${hours == 0 ? "" : hours + " Hours " } ${minutes == 0 ? "" : minutes+" Minutes "}`;
}

function addQueryParameters(entrie){
    let url = BASE_URL;
    for(let [key,value] of Object.entries(entrie)){
        url+=`&${key}=${value}`
    }
    return url;
}

function getSearchOptionValue(){
    let queryKeys = [];
    for(e of searchOptions){
        if(e.checked){
            queryKeys.push(e.value);
            break;
        }
    }
    return queryKeys;
}

function isValidIata(code){
    return /^[A-Z]{3}$/.test(code);
}