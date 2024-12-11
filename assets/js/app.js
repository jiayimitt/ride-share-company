'use strict';

import { listen, select } from './utility.js';

mapboxgl.accessToken = 'pk.eyJ1IjoiZWhyZW4tc3RyaWZsaW5nIiwiYSI6ImNscTN3dmZoYjAxMG4ydm14ZnNjaWtqOW0ifQ.PtNGzOxZJvB9XIJGME7k3Q';

let userLatitude;
let userLongitude;
let map;
let userMarker;
let vehicleMarkers = [];

const numberVehicle = 5;  
const radiusDegrees = 0.005;  //Approx. range (~0.005° lat/lng ~ 500m depending on your location)
const messageBox = select('.message-box');
const recenterBtn = select('.recenter-btn');
const showVehiclesBtn = select('.show-vehicles-btn');

function showMessage(message) {
    messageBox.innerText = message;
}

function onSuccess(position) {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;

    map = new mapboxgl.Map({
        container: 'map',
        center: [userLongitude, userLatitude],
        zoom: 14
    });

    map.addControl(new mapboxgl.NavigationControl());

    // Add a marker at the user's location
    userMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([userLongitude, userLatitude])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
        .addTo(map);

    listen(recenterBtn, 'click', recenterMap);

    listen(showVehiclesBtn, 'click', showNearbyVehicles);

    showMessage("Your location has been found. You may recenter the map or show nearby vehicles.");
}

function onError() {
    showMessage("Unable to retrieve your location. Please check browser's location permissions.");
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
} else {
    showMessage("Geolocation is not supported by your browser.");
}

function recenterMap() {
    if (map && userLatitude && userLongitude) {
        map.flyTo({ center: [userLongitude, userLatitude], zoom: 14 });
        showMessage("Map has been recentered on your current location.");
    } else {
        showMessage("User location not found yet.");
    }
}

function generateNearbyVehicles(lat, lng, count) {
    const vehicles = [];
    for (let i = 0; i < count; i++) {
        const randomLat = lat + (Math.random() * 2 - 1) * radiusDegrees;
        const randomLng = lng + (Math.random() * 2 - 1) * radiusDegrees;

        vehicles.push({
            name: `Vehicle ${i + 1}`,
            coords: [randomLng, randomLat]
        });
    }
    return vehicles;
}

function showNearbyVehicles() {
    if (!map) {
        showMessage("Map is not initialized yet.");
        return;
    }

    if (vehicleMarkers.length > 0) {
        showMessage("Vehicles are already shown on the map.");
        return;
    }

    const rideshareVehicles = generateNearbyVehicles(userLatitude, userLongitude, numberVehicle);

    // Add markers for each rideshare vehicle
    rideshareVehicles.forEach(vehicle => {
        const marker = new mapboxgl.Marker({ color: 'green' })
            .setLngLat(vehicle.coords)
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>${vehicle.name}</h3><p>Available for pickup</p>`))
            .addTo(map);
        vehicleMarkers.push(marker);
    });

    showMessage(`${rideshareVehicles.length} nearby vehicles displayed.`);
}