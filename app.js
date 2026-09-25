// Xaritani sun'iy yo'ldosh (Satellite) rejimida ishga tushirish
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([41.3111, 69.2797], 15);

// Esri World Imagery (Koinotdan/Satelitdan ko'rinish)
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// Marshrutni olish (gps_tracker.js'dan)
const routeCoords = GPSTracker.getRoute();

// Yashil to'lqin chizig'i (Neon)
const greenWaveLine = L.polyline(routeCoords, {
    color: '#00ff80',
    weight: 6,
    opacity: 0.9,
    dashArray: '10, 15',
    lineCap: 'round'
}).addTo(map);

// Tez yordam mashinasi markeri
const ambulanceIcon = L.divIcon({
    className: 'ambulance-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11]
});

let currentIndex = 0;
let progress = 0;
const ambulanceMarker = L.marker(routeCoords[0], { icon: ambulanceIcon }).addTo(map);

// Mashinani xarita bo'ylab silliq harakatlantirish animatsiyasi
function animateAmbulance() {
    if (currentIndex < routeCoords.length - 1) {
        let start = routeCoords[currentIndex];
        let end = routeCoords[currentIndex + 1];

        progress += 0.015; // Harakat tezligi

        let lat = start[0] + (end[0] - start[0]) * progress;
        let lng = start[1] + (end[1] - start[1]) * progress;

        ambulanceMarker.setLatLng([lat, lng]);
        
        // Satelit kamerasi mashina ortidan ergashadi
        map.panTo([lat, lng], { animate: true, duration: 0.1 });

        if (progress >= 1) {
            progress = 0;
            currentIndex++;
        }
    } else {
        currentIndex = 0; // Qaytadan boshlash
    }

    requestAnimationFrame(animateAmbulance);
}

// Tugma bosilganda yashil to'lqinni kuchaytirish
document.getElementById('emergencyBtn').addEventListener('click', () => {
    document.getElementById('sys-status').innerText = "GREEN WAVE FAOL!";
    document.getElementById('sys-status').style.color = "#00ff80";

    greenWaveLine.setStyle({ color: '#ffffff', weight: 9 });
    setTimeout(() => {
        greenWaveLine.setStyle({ color: '#00ff80', weight: 6 });
    }, 1000);
});

// Animatsiyani ishga tushirish
setTimeout(animateAmbulance, 1000);