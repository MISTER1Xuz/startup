const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([41.3111, 69.2797], 13);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// Shahar muhim infratuzilma obyektlarini xaritaga chiqarish (Dispetcher uchun ma'lumot)
const infrastructure = [
    { name: "16-Shahar Kasalxonasi", type: "hospital", coords: [41.3250, 69.2500] },
    { name: "Yong'in Xavfsizligi 1-Qism", type: "fire", coords: [41.3000, 69.2900] },
    { name: "YPX Boshqarmasi", type: "police", coords: [41.2900, 69.2400] }
];

infrastructure.forEach(obj => {
    L.circleMarker(obj.coords, {
        radius: 7,
        color: '#38bdf8',
        fillColor: '#0284c7',
        fillOpacity: 0.8
    }).addTo(map).bindPopup(`<b>🏢 Infratuzilma:</b> ${obj.name}`);
});

// Transport turlari
const vehiclesData = [
    { name: "103 - Tez Yordam", code: "103", color: "#ff3333" },
    { name: "101 - O't O'chirish", code: "101", color: "#ff9900" },
    { name: "YPX - Patrul", code: "YPX", color: "#3366ff" },
    { name: "VIP Kortej", code: "VIP", color: "#a855f7" }
];

let selectedIncidentIdx = 0;
let selectedVehicleIdx = 0;

let activeVehicleObj = null;
let activeLine = null;
let isMoving = false;
let isRedLight = true;

// Aholi mashinalari (Probka)
let civilianMarkers = [];
GPSTracker.incidents.forEach(inc => {
    let civIcon = L.divIcon({ className: 'civilian-marker', html: `🚗`, iconSize: [20, 20], iconAnchor: [10, 10] });
    let m = L.marker(inc.coords, { icon: civIcon }).addTo(map).bindPopup(`<b>⚠️ Probka:</b> ${inc.name}`);
    civilianMarkers.push(m);
});

const term = document.getElementById('terminalLog');
function addLog(text) {
    const time = new Date().toLocaleTimeString();
    term.innerHTML += `<br>[${time}] ${text}`;
    term.scrollTop = term.scrollHeight;
}

// Dispetcher chaqiruvni tanlaydi
window.selectIncident = function(idx) {
    selectedIncidentIdx = idx;
    document.querySelectorAll('.sel-btn').forEach((btn, i) => {
        if (i === idx) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    addLog(`📍 Chaqiruv tanlandi: ${GPSTracker.incidents[idx].name}`);
};

// Dispetcher mashinani tanlaydi
window.selectVehicle = function(idx) {
    selectedVehicleIdx = idx;
    document.querySelectorAll('.veh-btn').forEach((btn, i) => {
        if (i === idx) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    addLog(`🚑 Ekipaj tanlandi: ${vehiclesData[idx].name}`);
};

// DISPETCHER "JO'NATISH" TUGMASINI BOSGANDA GINA HARAKATLANISH BOSHLANADI!
document.getElementById('dispatchBtn').addEventListener('click', () => {
    if (isMoving) {
        addLog(`⚠️ OGOHLANTIRISH: Ekipaj allaqachon trassada!`);
        return;
    }

    if (activeVehicleObj) {
        map.removeLayer(activeVehicleObj.marker);
        map.removeLayer(activeLine);
    }

    let v = vehiclesData[selectedVehicleIdx];
    let routeKey = selectedIncidentIdx === 0 ? 'temur' : 'bunyodkor';
    let route = GPSTracker.routes[routeKey];

    isRedLight = true;
    isMoving = true;
    document.getElementById('sys-status').innerText = `${v.name} YO'LDA`;
    document.getElementById('light-mode').innerText = "🔴 Probka (Qizil)";
    document.getElementById('light-mode').style.color = "#ff3333";
    addLog(`🚀 DISPETCHER BUYRUG'I: ${v.name} -> ${GPSTracker.incidents[selectedIncidentIdx].name} tomon yo'l oldi!`);

    activeLine = L.polyline(route, {
        color: v.color,
        weight: 6,
        opacity: 0.85,
        lineCap: 'round'
    }).addTo(map);

    let icon = L.divIcon({
        className: 'vehicle-marker',
        html: `<div style="background:${v.color}; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center;">${v.code}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
    });

    let marker = L.marker(route[0], { icon: icon }).addTo(map);

    activeVehicleObj = {
        route: route,
        marker: marker,
        step: 0,
        progress: 0,
        paused: false
    };
});

// Green Wave tugmasi (Dispetcher probkani ochadi)
document.getElementById('waveBtn').addEventListener('click', () => {
    if (!isMoving) {
        addLog(`ℹ️ Hozir harakatlanayotgan mashina yo'q.`);
        return;
    }
    if (isRedLight) {
        isRedLight = false;
        if (activeVehicleObj) activeVehicleObj.paused = false;
        document.getElementById('light-mode').innerText = "🟢 GREEN WAVE (Ochildi!)";
        document.getElementById('light-mode').style.color = "#00ff80";
        addLog(`⚡ GREEN WAVE YOQILDI: Svetofor yashilga o'tdi, aholi mashinalari to'xtatildi!`);
    }
});

// Harakat mantiqi (O'zidan-o'zi yurmaydi, faqat dispetcher boshqaradi)
function animateSystem() {
    if (activeVehicleObj && isMoving) {
        let v = activeVehicleObj;
        let route = v.route;

        if (v.step < route.length - 1) {
            let start = route[v.step];
            let end = route[v.step + 1];

            // Probka nuqtasiga kelganda to'xtash
            if (v.step === 1 && isRedLight && !v.paused) {
                v.paused = true;
                addLog(`⚠️ PROBKA: Mashina tirbandlikka yetib keldi. Dispetcher "Green Wave" ni kutmoqda...`);
            }

            if (!v.paused) {
                let speed = isRedLight ? 15 : 100;
                document.getElementById('speed-indicator').innerText = speed + " km/h";

                let speedFactor = isRedLight ? 0.002 : 0.022;
                v.progress += speedFactor;

                let lat = start[0] + (end[0] - start[0]) * v.progress;
                let lng = start[1] + (end[1] - start[1]) * v.progress;

                v.marker.setLatLng([lat, lng]);
                map.panTo([lat, lng], { animate: true, duration: 0.1 });

                if (v.progress >= 1) {
                    v.progress = 0;
                    v.step++;
                }
            }
        } else {
            document.getElementById('speed-indicator').innerText = "0 km/h";
            document.getElementById('sys-status').innerText = "MANZILGA YETDI";
            document.getElementById('light-mode').innerText = "🟢 YAKUNLANDI";
            addLog(`✅ XABAR: Ekipaj chaqiruv manziliga muvaffaqiyatli yetib keldi!`);
            isMoving = false;
        }
    }

    requestAnimationFrame(animateSystem);
}

requestAnimationFrame(animateSystem);