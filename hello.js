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
            if (data.address.town === 'Hyères') {
                map.addLayer(marker);
                marker.bindPopup('<h6>Choose which forecast you want to display :</h6>' +
                    '<hr>' +
                    '<button id="precipitations" onclick="displayPrecipitations()" class="btn btn-primary btn-block m-2">precipitations</button>' +
                    '<button id="ph" onclick="displayPh()" class="btn btn-primary btn-block m-2">ph</button>' +
                    '<button id="precipitations" onclick="displayNitrate()" class="btn btn-primary btn-block m-2">nitrate</button>').openPopup();
            } else {
                map.addLayer(marker);
                marker.bindPopup('<p>No data available for now.</p>').openPopup();
            }
        }
    };
    request.send();
});


function displayPrecipitations() {
    const precipitations = [
        {
            "date": "2023-06-01",
            "forecast": "19.76095571786697",
            "lower_bound": 0,
            "upper_bound": "126.37085453403165"
        },
        {
            "date": "2023-07-01",
            "forecast": "5.024122977995916",
            "lower_bound": 0,
            "upper_bound": "111.63402179416062"
        },
        {
            "date": "2023-08-01",
            "forecast": "21.22044600654108",
            "lower_bound": 0,
            "upper_bound": "127.83034482270578"
        },
        {
            "date": "2023-09-01",
            "forecast": "38.986585182449865",
            "lower_bound": 0,
            "upper_bound": "145.59648399861456"
        },
        {
            "date": "2023-10-01",
            "forecast": "46.34306221711207",
            "lower_bound": 0,
            "upper_bound": "152.95296103327675"
        },
        {
            "date": "2023-11-01",
            "forecast": "76.74895210740928",
            "lower_bound": 0,
            "upper_bound": "183.35885092357395"
        },
        {
            "date": "2023-12-01",
            "forecast": "84.43729909974581",
            "lower_bound": 0,
            "upper_bound": "191.04719791591046"
        },
        {
            "date": "2024-01-01",
            "forecast": "16.222818467510365",
            "lower_bound": 0,
            "upper_bound": "122.83271728367501"
        }
    ]

    const precipitationsAmount = [];
    const precipitationsDate = [];
    const precipitationsUpperBound = [];
    const precipitationsLowerBound = [];


    precipitations.forEach((item) => {
        precipitationsAmount.push(item.forecast);
        precipitationsDate.push(item.date);
        precipitationsLowerBound.push(item.lower_bound);
        precipitationsUpperBound.push(item.upper_bound);
    })

    const ctx = document.getElementById('displayPrecipitations');


    new Chart(ctx, {
        type: 'line',
        data: {
            labels: precipitationsDate,
            datasets: [{
                label: 'Precipitations',
                data: precipitationsAmount,
                borderColor: 'green',
            },
                {
                    label: 'Lower bound',
                    data: precipitationsLowerBound,
                    borderColor: 'blue',
                },
                {
                    label: 'Upper bound',
                    data: precipitationsUpperBound,
                    borderColor: 'blue',
                }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        step: 6,
                        stepValue: 30,
                        color: (c) => {
                            if (c['tick']['value'] <= 30) {
                                return 'orange'
                            } else return 'black';
                        }
                    }
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
                borderColor: 'green',
            },
                {
                    label: 'Lower bound',
                    data: phLowerBound,
                    borderColor: 'blue',
                },
                {
                    label: 'Upper bound',
                    data: phUpperBound,
                    borderColor: 'blue',
                }]
        },
        options: {
            scales: {
                y: {
                    min: 6.5,
                    max: 8.8,
                    ticks: {
                        color: (c) => {
                            if (c['tick']['value'] >= 8.5) {
                                return 'red'
                            } else if (c['tick']['value'] == 6.5) {
                                return 'orange';
                            } else return 'green';
                        }

                    }
                }
            }
        }
    });
}

function displayNitrate() {
    const nitrate_data = [
        {
            "date": "2023-06-30",
            "nitrate_forecast": "5.899946379148364",
            "lower_bound": "4.4969779277475",
            "upper_bound": "7.302914830549228"
        },
        {
            "date": "2023-07-31",
            "nitrate_forecast": "5.791667060563707",
            "lower_bound": "4.244318797882057",
            "upper_bound": "7.339015323245357"
        },
        {
            "date": "2023-08-31",
            "nitrate_forecast": "5.6833877419790495",
            "lower_bound": "4.004026906297299",
            "upper_bound": "7.3627485776608"
        },
        {
            "date": "2023-09-30",
            "nitrate_forecast": "6.25081195768505",
            "lower_bound": "4.449085289508245",
            "upper_bound": "8.052538625861855"
        },
        {
            "date": "2023-10-31",
            "nitrate_forecast": "6.3395516952769055",
            "lower_bound": "4.42325705268739",
            "upper_bound": "8.255846337866421"
        },
        {
            "date": "2023-11-30",
            "nitrate_forecast": "6.428291432868761",
            "lower_bound": "4.40390230831413",
            "upper_bound": "8.452680557423392"
        },
        {
            "date": "2023-12-31",
            "nitrate_forecast": "6.364888784107304",
            "lower_bound": "4.237891487914183",
            "upper_bound": "8.491886080300425"
        },
        {
            "date": "2024-01-31",
            "nitrate_forecast": "6.312768147464085",
            "lower_bound": "4.066608061431871",
            "upper_bound": "8.5589282334963"
        }
    ]

    const nitrateAmount = [];
    const nitrateLowerBound = [];
    const nitrateUpperBound = [];
    const nitrateDate = [];

    nitrate_data.forEach((item) => {
        nitrateAmount.push(item.nitrate_forecast);
        nitrateDate.push(item.date);
        nitrateLowerBound.push(item.lower_bound);
        nitrateUpperBound.push(item.upper_bound);

    })

    const ctx = document.getElementById('displayNitrate');


    new Chart(ctx, {
        type: 'line',
        data: {
            labels: nitrateDate,
            datasets: [{
                label: 'Nitrate',
                data: nitrateAmount,
                borderColor: 'green',
            },
                {
                    label: 'Lower bound',
                    data: nitrateLowerBound,
                    borderColor: 'blue',
                },
                {
                    label: 'Upper bound',
                    data: nitrateUpperBound,
                    borderColor: 'blue',
                }]
        },
        options: {
            scales: {
                y: {
                    min: 3,
                    max: 9,
                    ticks: {
                        color: 'green'
                    }
                }
            }
        }
    });
}
