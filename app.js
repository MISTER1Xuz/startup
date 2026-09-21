// Joriy vaqtni ko'rsatish
function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('uz-UZ');
    const clockElement = document.getElementById('current-time');
    if (clockElement) {
        clockElement.textContent = timeString;
    }
}
setInterval(updateClock, 1000);
updateClock();

// Xaritani Toshkent markaziga o'rnatish
const map = L.map('map', { zoomControl: false }).setView([41.3111, 69.2797], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Toshkent hududi bo'ylab 100 ta tasodifiy real mashinalarni generatsiya qilish
const vehicleTypes = [
    { name: "Tez Yordam", icon: "fa-ambulance", color: "#10b981", prefix: "TY" },
    { name: "O't O'chiruvchi", icon: "fa-fire-extinguisher", color: "#ef4444", prefix: "OO" },
    { name: "YPX Patrul", icon: "fa-car-side", color: "#3b82f6", prefix: "YPX" },
    { name: "Maxsus Kortej", icon: "fa-shield-alt", color: "#a855f7", prefix: "MK" },
    { name: "Qutqaruv Xizmati", icon: "fa-truck-monster", color: "#f59e0b", prefix: "QX" }
];

let allVehicles = [];

// 100 ta mashina bazasini tuzish
for (let i = 1; i <= 100; i++) {
    // Toshkent shahri koordinatalari atrofi
    const lat = 41.25 + Math.random() * 0.12;
    const lng = 69.20 + Math.random() * 0.18;
    const typeObj = vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    
    allVehicles.push({
        id: i,
        code: `${typeObj.prefix}-${1000 + i}`,
        type: typeObj.name,
        icon: typeObj.icon,
        color: typeObj.color,
        coords: [lat, lng],
        status: Math.random() > 0.2 ? "Navbatda (Aktiv)" : "Favqulodda Harakatda"
    });
}

// Mashinalarni xaritaga chiqarish va ro'yxatni to'ldirish
const vehicleMarkersLayer = L.layerGroup().addTo(map);

function renderVehiclesOnMap(filter = 'ALL') {
    vehicleMarkersLayer.clearLayers();
    const container = document.getElementById('active-routes-list');
    if (!container) return;
    container.innerHTML = '';

    let count = 0;
    allVehicles.forEach(v => {
        if (filter !== 'ALL' && v.type !== filter) return;
        count++;

        // Marker yaratish
        const iconHtml = `<div style="width: 26px; height: 26px; background: ${v.color}; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; box-shadow: 0 0 10px ${v.color};"><i class="fas ${v.icon}"></i></div>`;
        
        const marker = L.marker(v.coords, {
            icon: L.divIcon({ className: 'custom-marker', html: iconHtml, iconSize: [26, 26] })
        }).bindPopup(`<b style="color:${v.color}">${v.type} (${v.code})</b><br>Holati: ${v.status}`);

        vehicleMarkersLayer.addLayer(marker);

        // Chap panelga ro'yxatni qo'shish (chiroyli dizayn bilan)
        if (count <= 30) { // UI qotib qolmasligi uchun birinchi 50 tasini panelga chiqaramiz
            container.innerHTML += `
                <div onclick="focusVehicle(${v.coords[0]}, ${v.coords[1]}, '${v.code}')" class="bg-gray-800/60 p-3 rounded-xl border border-gray-700/80 hover:border-emerald-500 cursor-pointer transition-all flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <div class="p-2 rounded-lg bg-gray-900 text-white" style="color: ${v.color}">
                            <i class="fas ${v.icon}"></i>
                        </div>
                        <div>
                            <h4 class="font-semibold text-white text-xs">${v.type} [${v.code}]</h4>
                            <p class="text-[10px] text-gray-400">Toshkent sh.</p>
                        </div>
                    </div>
                    <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background: ${v.color}22; color: ${v.color}; border: 1px solid ${v.color}55;">ON-LINE</span>
                </div>
            `;
        }
    });
}

function focusVehicle(lat, lng, code) {
    map.flyTo([lat, lng], 16, { duration: 1.5 });
}

// Dastlabki yuklash
renderVehiclesOnMap();

// Filtrlash funksiyasi
function filterVehicles(typeName) {
    renderVehiclesOnMap(typeName);
}

let activeSosMarker = null;

function simulateEmergency(type, coords) {
    const card = document.getElementById('active-emergency-card');
    const badge = document.getElementById('status-badge');
    
    if (card) {
        card.classList.remove('hidden');
        document.getElementById('emer-type').innerText = `${type} Koridori Ochildi`;
        document.getElementById('emer-location').innerText = `Koordinatalar: ${coords[0].toFixed(4)}, ${coords[1].toFixed(4)}`;
        
        card.className = "emergency-active bg-red-950/40 border border-red-700 rounded-2xl p-4 space-y-2 shadow-xl";
        badge.innerText = "QIZIL (To'xtash)";

        setTimeout(() => {
            card.className = "corridor-active bg-emerald-950/40 border border-emerald-700 rounded-2xl p-4 space-y-2 shadow-xl";
            badge.innerText = "YASHIL (Ochiq)";
        }, 1500);
    }

    map.flyTo(coords, 15, { duration: 1.5 });

    if (activeSosMarker) map.removeLayer(activeSosMarker);

    const sosIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 36px; height: 36px; background: #ef4444; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 0 20px #ef4444;">SOS</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    activeSosMarker = L.marker(coords, { icon: sosIcon }).addTo(map)
        .bindPopup(`<b style="color:#dc2626">FAVQULODDA!</b><br>${type} uchun yashil koridor faollashdi!`).openPopup();
}

function clearEmergency() {
    const card = document.getElementById('active-emergency-card');
    if (card) card.classList.add('hidden');
    if (activeSosMarker) {
        map.removeLayer(activeSosMarker);
        activeSosMarker = null;
    }
    map.setView([41.3111, 69.2797], 12);
}