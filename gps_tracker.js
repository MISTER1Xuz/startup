// GPS Tracker Module
class GPSTracker {
    constructor(vehicleId) {
        this.vehicleId = vehicleId;
        this.currentLocation = null;
    }

    // GPS koordinatalarini simulyatsiya qilish (Real qurilma bo'lmaganda)
    startSimulation(routeCoords, callback) {
        let index = 0;
        const interval = setInterval(() => {
            if (index < routeCoords.length) {
                this.currentLocation = routeCoords[index];
                if (typeof callback === 'function') {
                    callback(this.currentLocation, index);
                }
                index++;
            } else {
                clearInterval(interval);
            }
        }, 2000);
    }

    // Brauzerning o'z GPS (Geolocation API) ma'lumotini olish
    trackRealGPS(onUpdate) {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition((position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                this.currentLocation = [lat, lon];
                if (typeof onUpdate === 'function') {
                    onUpdate(this.currentLocation);
                }
            }, (error) => {
                console.error("GPS xatosi: ", error);
            }, { enableHighAccuracy: true });
        } else {
            console.error("Brauzer GPS ni qo'llab-quvvatlamaydi.");
        }
    }
}

// Eksport qilish uchun tayyor holat
window.GPSTracker = GPSTracker;