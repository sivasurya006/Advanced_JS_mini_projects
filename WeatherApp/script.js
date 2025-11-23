// setView call also returns the map object
// element id as a parameter 
const map = L.map('map').setView([8.902699984038293, 77.33574313876575], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', onMapClick);


let marker = L.marker([8.902699984038293, 77.33574313876575]).addTo(map);
marker.bindPopup("<b>Pick Your Location</b>").openPopup();
let popup = L.popup();


function onMapClick(e) {
        getPlaceName(e.latlng);
        map.removeLayer(marker);
        marker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
}

function getPlaceName(latlng){
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`)
        .then((res) =>  res.json())
        .then((data) => {
           showPopUp(latlng,data);
        }).catch((err) => {
            console.log(err);
        });
}

function showPopUp(latlng,data){
    popup.setLatLng(latlng)
            .setContent(data.display_name ?? "Can't get place name")
            .openOn(map);
    marker.bindPopup(markerPopUp(data));
}


function markerPopUp(data){
    return `<b>${data.display_name ?? "Can't get place name"}</b>`;
}




    