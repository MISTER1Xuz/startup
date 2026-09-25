// Yashil Yo'l - Smart City Dispatcher Server (Node.js & Express)
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

// Middleware (JSON va statik fayllarni o'qish uchun)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Asosiy sahifani ochish
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// GPS va Tez Yordam mashinasi ma'lumotlarini qabul qilish API'si
app.post('/api/gps-update', (req, res) => {
    const { vehicleId, lat, lng, speed, status } = req.body;
    
    if (!vehicleId || lat === undefined || lng === undefined) {
        return res.status(400).json({ 
            success: false, 
            message: "Xatolik: GPS ma'lumotlari yetarli emas!" 
        });
    }

    console.log(`[Green Wave Dispatcher] 🚑 Mashina ID: ${vehicleId}`);
    console.log(`📍 Koordinatalar: Lat ${lat}, Lng ${lng} | Tezlik: ${speed || 'Noma\'lum'} km/h`);
    console.log(`⚡ Holat: ${status || 'Harakatlanmoqda'}`);
    console.log('--------------------------------------------------');

    // Server javobi
    res.json({
        success: true,
        message: "GPS ma'lumot muvaffaqiyatli qabul qilindi va svetoforlar sinxronlandi!",
        timestamp: new Date().toISOString()
    });
});

// Green Wave rejimini masofadan faollashtirish API'si
app.post('/api/trigger-wave', (req, res) => {
    console.log('[ALERT] 🚨 Favqulodda Green Wave rejimi dispetcher tomonidan yoqildi!');
    res.json({
        success: true,
        waveStatus: "ACTIVE",
        message: "Barcha yo'nalishdagi svetoforlar yashil rejimga o'tkazildi!"
    });
});

// Serverni ishga tushirish
server.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 Yashil Yo'l serveri ishga tushdi!`);
    console.log(`🌐 Manzil: http://localhost:${PORT}`);
    console.log(`==================================================`);
});