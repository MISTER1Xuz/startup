// Express server yordamida real vaqtda GPS ma'lumotlarini qabul qilish uchun asos
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

// GPS ma'lumotlarini qabul qilish API'si
app.post('/api/gps-update', (req, res) => {
    const { vehicleId, lat, lng, status } = req.body;
    console.log(`[GPS Server] Mashina: ${vehicleId}, Lat: ${lat}, Lng: ${lng}, Holat: ${status}`);
    res.json({ success: true, message: "GPS ma'lumot qabul qilindi va Green Wave yangilandi!" });
});

app.listen(PORT, () => {
    console.log(`Yashil Yo'l serveri http://localhost:${PORT} da ishga tushdi.`);
});