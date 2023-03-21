require(["esri/config", "esri/Map", "esri/views/MapView", "esri/widgets/Search"], function (esriConfig, Map, MapView, Search) {
    esriConfig.apiKey = "AAPK12a4693efedd46988fd17f1554e3a2f6qMSRQWlXwpZeaM65bVaWvXiQfq-K9RInDk5O45FWN3224pU9Jo1sOYb-HMRHnhh3";

    const map = new Map({
        basemap: "arcgis-topographic" // Basemap layer service
    });

    const view = new MapView({
        map: map,
        center: [6.128639, 43.120541], // Longitude, latitude
        zoom: 10, // Zoom level
        container: "mapView" // Div element
    });
    const search = new Search({  //Add Search widget
        view: view,
    });

    view.on("click", function (event) {
        console.log('click: ', event);

        // Get the coordinates of the click on the view
        // around the decimals to 3 decimals
        const lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
        const lon = Math.round(event.mapPoint.longitude * 1000) / 1000;

        view.popup.open({
            location: event.mapPoint,  // location of the click on the view
            title: "You clicked here",  // title displayed in the popup
            content: "This is a point of interest"  // content displayed in the popup
        });
    });
    console.log(search)
    view.ui.add(search, "top-right"); //Add to the map
});