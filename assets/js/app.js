'use strict';

import { listen, select } from './utility.js';

// Replace with your own Mapbox Access Token
mapboxgl.accessToken = 'pk.eyJ1IjoiZWhyZW4tc3RyaWZsaW5nIiwiYSI6ImNscTN3dmZoYjAxMG4ydm14ZnNjaWtqOW0ifQ.PtNGzOxZJvB9XIJGME7k3Q';


let userLatitude;
let userLongitude;
let map;
let userMarker;
let vehicleMarkers = [];

const NUMBER_OF_VEHICLES = 5;  // How many vehicles to show
const RADIUS_DEGREES = 0.005;  // Approx. range

// Utility to display a message on the page (instead of alert)
function showMessage(message) {
    const messageBox = select('.message-box');
    messageBox.textContent = message;
}

// Success callback for geolocation
function onSuccess(position) {
    userLatitude = position.coords.latitude;
    userLongitude = position.coords.longitude;

    // Initialize the map
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [userLongitude, userLatitude],
        zoom: 14
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    // Add a marker at the user's location
    userMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([userLongitude, userLatitude])
        .setPopup(new mapboxgl.Popup().setHTML("<h3>You are here</h3>"))
        .addTo(map);

    // Add event listeners for buttons
    const recenterBtn = select('.recenter-btn');
    listen(recenterBtn, 'click', recenterMap);

    const showVehiclesBtn = select('.show-vehicles-btn');
    listen(showVehiclesBtn, 'click', showNearbyVehicles);

    showMessage("Your location has been found. You may recenter the map or show nearby vehicles.");
}

// Error callback for geolocation
function onError(error) {
    console.error(`Geolocation Error: ${error.message}`);
    showMessage("Unable to retrieve your location. Please check browser's location permissions.");
}

// Request user location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
} else {
    console.error("Geolocation not supported by the browser.");
    showMessage("Geolocation is not supported by your browser.");
}

// Recenter the map on the user's current location
function recenterMap() {
    if (map && userLatitude && userLongitude) {
        map.flyTo({ center: [userLongitude, userLatitude], zoom: 14 });
        showMessage("Map has been recentered on your current location.");
    } else {
        console.warn("User location not found yet.");
        showMessage("User location not found yet.");
    }
}

// Generate random nearby vehicle coordinates
function generateNearbyVehicles(lat, lng, count) {
    const vehicles = [];
    for (let i = 0; i < count; i++) {
        // Generate a random offset for lat and lng
        const randomLat = lat + (Math.random() * 2 - 1) * RADIUS_DEGREES;
        const randomLng = lng + (Math.random() * 2 - 1) * RADIUS_DEGREES;

        vehicles.push({
            name: `Vehicle ${i + 1}`,
            coords: [randomLng, randomLat]
        });
    }
    return vehicles;
}

// Show rideshare vehicles on the map
function showNearbyVehicles() {
    if (!map) {
        console.warn("Map is not initialized yet.");
        showMessage("Map is not initialized yet.");
        return;
    }

    // If vehicles are already displayed, just return
    if (vehicleMarkers.length > 0) {
        console.info("Vehicles are already shown on the map.");
        showMessage("Vehicles are already shown on the map.");
        return;
    }

    // Generate fake nearby vehicles around the user location
    const rideshareVehicles = generateNearbyVehicles(userLatitude, userLongitude, NUMBER_OF_VEHICLES);

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