// Xaritani tinch va silliq rejimda ochish
const map = L.map('map', {
    zoomControl: false,
    attributionControl: false
}).setView([41.3111, 69.2797], 14);

L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19
}).addTo(map);

// Transport turlari (103, 101, YPX, Kortej)
const vehiclesData = [
    { name: "103 - Tez Yordam", code: "103", color: "#ff3333", route: GPSTracker.route103 },
    { name: "101 - O't O'chirish", code: "101", color: "#ff9900", route: GPSTracker.route101 },
    { name: "YPX - Patrul", code: "YPX", color: "#3366ff", route: GPSTracker.routeYPX },
    { name: "Kortej", code: "VIP", color: "#9933ff", route: GPSTracker.routeKortej }
];

let currentVehicleIdx = 0;
let activeVehicleObj = null;
let activeLine = null;
let isRedLight = true; // Probka qizil chiroq

const term = document.getElementById('terminalLog');
function addLog(text) {
    const time = new Date().toLocaleTimeString();
    term.innerHTML += `<br>[${time}] ${text}`;
    term.scrollTop = term.scrollHeight;
}

// Transportni trassaga chiqarish
function loadVehicle(index) {
    if (activeVehicleObj) {
        map.removeLayer(activeVehicleObj.marker);
        map.removeLayer(activeLine);
    }

    let v = vehiclesData[index];
    document.getElementById('active-vehicle').innerText = v.name;
    document.getElementById('active-vehicle').style.color = v.color;
    addLog(`Trassaga chiqdi: ${v.name}`);

    // Trassa bo'ylab chiziq
    activeLine = L.polyline(v.route, {
        color: v.color,
        weight: 6,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
    }).addTo(map);

    // Tinch va silliq marker
    let icon = L.divIcon({
        className: 'vehicle-marker',
        html: `<div style="background:${v.color}; width:100%; height:100%; border-radius:50%; display:flex; align-items:center; justify-content:center;">${v.code}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13]
    });

    let marker = L.marker(v.route[0], { icon: icon }).addTo(map);

    activeVehicleObj = {
        route: v.route,
        marker: marker,
        step: 0,
        progress: 0,
        waiting: false
    };
}

loadVehicle(0);

// Trassa bo'ylab harakatlanish va 5 sekundlik probka mantiqi
function animateSystem() {
    if (activeVehicleObj) {
        let v = activeVehicleObj;
        let route = v.route;

        if (v.step < route.length - 1) {
            let start = route[v.step];
            let end = route[v.step + 1];

            // Chorrahada (probka) 5 soniya qizil to'xtash
            if (v.step === 1 && isRedLight && !v.waiting) {
                v.waiting = true;
                document.getElementById('light-mode').innerText = "🔴 PROBKA: Qizil (5s)";
                document.getElementById('light-mode').style.color = "#ff3333";
                addLog(`⚠️ Trassada probka! Svetofor qizil, 5 soniya kutish...`);

                let countdown = 5;
                let timer = setInterval(() => {
                    countdown--;
                    document.getElementById('light-mode').innerText = `🔴 Qizil: ${countdown}s`;
                    if (countdown <= 0) {
                        clearInterval(timer);
                        isRedLight = false; // Green wave ochildi!
                        v.waiting = false;
                        document.getElementById('light-mode').innerText = "🟢 GREEN WAVE (Ochildi!)";
                        document.getElementById('light-mode').style.color = "#00ff80";
                        addLog(`🟢 Green Wave ochildi! Trassa bo'ylab tez harakat boshlandi.`);
                    }
                }, 1000);
            }

            if (!v.waiting) {
                // Yashil bo'lganda tezlik oshadi (manzilga tezroq borish uchun)
                let speedFactor = isRedLight ? 0.006 : 0.02; 
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
            addLog(`✅ Manzilga muvaffaqiyatli yetib borildi!`);
            isRedLight = true; // Qaytadan qizil holatga qaytarish
            currentVehicleIdx = (currentVehicleIdx + 1) % vehiclesData.length;
            setTimeout(() => {
                loadVehicle(currentVehicleIdx);
            }, 2000);
        }
    }

    requestAnimationFrame(animateSystem);
}

// Majburiy Green Wave tugmasi
document.getElementById('waveBtn').addEventListener('click', () => {
    isRedLight = false;
    document.getElementById('light-mode').innerText = "⚡ MAJBURIY OCHILDI";
    document.getElementById('light-mode').style.color = "#00ff80";
    addLog(`🚨 Dispetcher trassani majburiy ochdi!`);
});

// Ishga tushirish
setTimeout(animateSystem, 1000);