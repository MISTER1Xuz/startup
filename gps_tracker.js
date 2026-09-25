// Toshkent shahar muhim obyektlari va maxsus trassalari
const GPSTracker = {
    incidents: [
        { name: "Amir Temur Chorrahasi", coords: [41.3111, 69.2797] },
        { name: "Bunyodkor Ko'chasi (Chilonzor)", coords: [41.2850, 69.2000] }
    ],
    routes: {
        // Amir Temur trassasi
        temur: [
            [41.3300, 69.2400],
            [41.3200, 69.2600],
            [41.3111, 69.2797], // Probka nuqtasi
            [41.2950, 69.2900]
        ],
        // Bunyodkor trassasi
        bunyodkor: [
            [41.3100, 69.2200],
            [41.2950, 69.2100],
            [41.2850, 69.2000], // Avariya nuqtasi
            [41.2700, 69.1800]
        ]
    }
};