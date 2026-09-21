// Vaqtni yangilash
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

// Xaritani ishga tushirish (Toshkent markazi)
const map = L.map('map', { zoomControl: false }).setView([41.3111, 69.2797], 13);

// OpenStreetMap qatlami
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
}).addTo(map);

// Svetoforlar bazasi
const intersections = [
    { name: "Amir Temur / Alisher Navoiy", coords: [41.3115, 69.2797] },
    { name: "Bunyodkor / Muqimiy", coords: [41.2911, 69.2401] },
    { name: "Yunusobod 4-mavzel", coords: [41.3456, 69.2878] },
    { name: "Beruniy chorrahasi", coords: [41.3270, 69.2300] }
];

intersections.forEach(item => {
    const tlIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 14px; height: 14px; background: #10b981; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 12px #10b981; transition: all 0.3s;"></div>`,
        iconSize: [14, 14]
    });
    L.marker(item.coords, { icon: tlIcon }).addTo(map)
     .bindPopup(`<b style="color:#0f172a">${item.name}</b><br><span style="color:#059669">Svetofor: Avtomatik rejim</span>`);
});

let activeSosMarker = null;

function simulateEmergency(type, coords, code) {
    const card = document.getElementById('active-emergency-card');
    const badge = document.getElementById('status-badge');
    
    if (card) {
        card.classList.remove('hidden');
        document.getElementById('emer-type').innerText = `${type} Koridori`;
        document.getElementById('emer-location').innerText = `Koordinatalar: ${coords[0]}, ${coords[1]}`;
        
        // Boshida Qizil holatdan boshlanadi, 2 sekunddan keyin Yashilga o'tadi (Simulyatsiya)
        card.className = "emergency-active bg-red-950/40 border border-red-700 rounded-2xl p-4 space-y-2 shadow-xl transition-all duration-500";
        badge.innerText = "QIZIL (To'xtash)";
        badge.className = "px-2 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full uppercase tracking-wider animate-pulse";

        setTimeout(() => {
            card.className = "corridor-active bg-emerald-950/40 border border-emerald-700 rounded-2xl p-4 space-y-2 shadow-xl transition-all duration-500";
            badge.innerText = "YASHIL (Ochiq)";
            badge.className = "px-2 py-0.5 text-[10px] font-bold bg-emerald-500 text-white rounded-full uppercase tracking-wider";
        }, 2000);
    }

    map.flyTo(coords, 15, { duration: 1.5 });

    if (activeSosMarker) {
        map.removeLayer(activeSosMarker);
    }

    const sosIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width: 36px; height: 36px; background: #ef4444; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; box-shadow: 0 0 20px #ef4444; animation: pulseGlow 1.5s infinite;">SOS</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });

    activeSosMarker = L.marker(coords, { icon: sosIcon }).addTo(map)
        .bindPopup(`<b style="color:#dc2626">FAVQULODDA!</b><br>${type} uchun yashil yo'l ochildi!`).openPopup();

    updateActiveRoutesList(type);
}

function updateActiveRoutesList(type) {
    const listContainer = document.getElementById('active-routes-list');
    if (!listContainer) return;
    
    listContainer.innerHTML = `
        <div class="bg-gray-800/80 p-3.5 rounded-2xl border border-emerald-500/50 shadow-lg animate-pulse">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-400">
                        <i class="fas fa-route"></i>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white text-sm">${type} Koridori</h4>
                        <p class="text-xs text-emerald-400">Svetoforlar yashil rejimda</p>
                    </div>
                </div>
                <span class="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-700">FAOL</span>
            </div>
            <div class="mt-3 w-full bg-gray-700/80 rounded-full h-1.5 overflow-hidden">
                <div class="bg-emerald-400 h-full w-full animate-pulse"></div>
            </div>
        </div>
    `;
}

function clearEmergency() {
    const card = document.getElementById('active-emergency-card');
    if (card) {
        card.classList.add('hidden');
    }
    const listContainer = document.getElementById('active-routes-list');
    if (listContainer) {
        listContainer.innerHTML = `<div class="flex items-center justify-center h-24 text-gray-500 italic text-xs border border-dashed border-gray-800 rounded-2xl">Faol koridorlar yo'q...</div>`;
    }
    if (activeSosMarker) {
        map.removeLayer(activeSosMarker);
        activeSosMarker = null;
    }
    map.setView([41.3111, 69.2797], 13);
}