// GPS Tracker va marshrut ma'lumotlarini boshqarish moduli
const GPSTracker = {
    // Toshkent shahridagi sinov yo'nalishi koordinatalari
    route: [
        [41.3165, 69.2500],
        [41.3150, 69.2600],
        [41.3130, 69.2700],
        [41.3111, 69.2797], // Amir Temur xiyoboni
        [41.3050, 69.2880],
        [41.2980, 69.2950]
    ],
    
    getRoute() {
        return this.route;
    },

    getCurrentLocation(index) {
        return this.route[index % this.route.length];
    }
};