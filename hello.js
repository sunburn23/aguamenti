let map = L.map('map').setView([43.119900, 6.13], 14);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

const isMapClicked = false;
map.on('click', (e) => {
    console.log(e);
    marker = new L.Marker(e.latlng, {
        draggable: true
    });

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
            marker.bindPopup('<h6>Choose which forecast you want to display :</h6>' +
                '<hr>' +
                '<button id="precipitations" onclick="displayPrecipitations()" class="btn btn-primary btn-block m-2">precipitations</button>' +
                '<button id="ph" onclick="displayPh()" class="btn btn-primary btn-block m-2">ph</button>' +
                '<button id="precipitations" onclick="displayPrecipitations()" class="btn btn-primary btn-block m-2">nitrate</button>').openPopup();
        }
    };
    request.send();
});


function displayPrecipitations() {
    const precipitations = [
        {
            "date": "2023-06-01",
            "precipitations": 19.76095571786697
        },
        {
            "date": "2023-07-01",
            "precipitations": 5.024122977995916
        },
        {
            "date": "2023-08-01",
            "precipitations": 21.22044600654108
        },
        {
            "date": "2023-09-01",
            "precipitations": 38.986585182449865
        },
        {
            "date": "2023-10-01",
            "precipitations": 46.34306221711207
        },
        {
            "date": "2023-11-01",
            "precipitations": 76.74895210740928
        },
        {
            "date": "2023-12-01",
            "precipitations": 84.43729909974581
        },
        {
            "date": "2024-01-01",
            "precipitations": 16.222818467510365
        }
    ]

    const precipitationsAmount = [];
    const precipitationsDate = [];

    precipitations.forEach((item) => {
        precipitationsAmount.push(item.precipitations);
        precipitationsDate.push(item.date);

    })

    const ctx = document.getElementById('displayPrecipitations');


    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: precipitationsDate,
            datasets: [{
                label: 'precipitations',
                data: precipitationsAmount,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function displayPh() {
    const ph_data = [
        {
            "date": "2023-06-30",
            "ph": "8.221459924979158",
            "ph_lower_bound": "7.922589762524062",
            "ph_upper_bound": "8.520330087434253"
        },
        {
            "date": "2023-07-31",
            "ph": "8.195071566363637",
            "ph_lower_bound": "7.869039965814061",
            "ph_upper_bound": "8.521103166913214"
        },
        {
            "date": "2023-08-31",
            "ph": "8.168683207748117",
            "ph_lower_bound": "7.8175851657315",
            "ph_upper_bound": "8.519781249764735"
        },
        {
            "date": "2023-09-30",
            "ph": "8.05738399322473",
            "ph_lower_bound": "7.682893585258269",
            "ph_upper_bound": "8.431874401191191"
        },
        {
            "date": "2023-10-31",
            "ph": "8.069591478203694",
            "ph_lower_bound": "7.673086375828113",
            "ph_upper_bound": "8.466096580579276"
        },
        {
            "date": "2023-11-30",
            "ph": "8.081798963182658",
            "ph_lower_bound": "7.664438774902973",
            "ph_upper_bound": "8.499159151462344"
        },
        {
            "date": "2023-12-31",
            "ph": "8.094006448161622",
            "ph_lower_bound": "7.656784814076759",
            "ph_upper_bound": "8.531228082246484"
        },
        {
            "date": "2024-01-31",
            "ph": "8.1154068601434",
            "ph_lower_bound": "7.648179062260885",
            "ph_upper_bound": "8.582634658025915"
        }
    ]

    const phAmount = [];
    const phLowerBound = [];
    const phUpperBound = [];
    const phDate = [];

    ph_data.forEach((item) => {
        phAmount.push(item.ph);
        phDate.push(item.date);
        phLowerBound.push(item.ph_lower_bound);
        phUpperBound.push(item.ph_upper_bound);

    })

    const ctx = document.getElementById('displayPh');


    new Chart(ctx, {
        type: 'line',
        data: {
            labels: phDate,
            datasets: [{
                label: 'PH',
                data: phAmount,
                borderColor: 'blue',
            },
                {
                    label: 'Lower bound',
                    data: phLowerBound,
                    borderColor: 'green',
                },
                {
                    label: 'Upper bound',
                    data: phUpperBound,
                    borderColor: 'red',
                }]
        },
        options: {
            scales: {
                y: {
                    min: 7.5,
                    max: 9
                }
            }
        }
    });
}
