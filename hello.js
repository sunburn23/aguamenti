let map = L.map('map').setView([43.119900, 6], 13);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

map.on('click', (e) => {
    marker = new L.Marker(e.latlng, {
        draggable: true
    });

    console.log(e);
    L.circle([e.latlng.lat, e.latlng.lng], {radius: 1500}).addTo(map);

    var request = new XMLHttpRequest();

    var method = 'GET';
    var url = 'https://nominatim.openstreetmap.org/reverse?lat=' + e.latlng.lat + '&lon=' + e.latlng.lng + '&format=json';
    var async = true;

    request.open(method, url, async);
    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            const data = JSON.parse(request.responseText);
            console.log(data);
            map.addLayer(marker);
            marker.bindPopup('<p>You are here: ' + data.address.town + '</p>').openPopup();
        }
    };
    request.send();
})