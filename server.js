const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statik fayllarni ulash (Frontend uchun)
app.use(express.static(__dirname));

// Bazadagi faol koridorlar ro'yxati
let activeCorridors = [];

// Socket.io orqali real vaqtda bog'lanish
io.on('connection', (socket) => {
    console.log('Dispetcher tarmoqqa ulandi: ', socket.id);

    // Yangi favqulodda chaqiruv kelganda
    socket.on('trigger_emergency', (data) => {
        console.log('Favqulodda chaqiruv qabul qilindi:', data);
        activeCorridors.push(data);
        
        // Barcha ulangan clientlarga (dispetcherlarga) tarqatish
        io.emit('update_corridors', activeCorridors);
    });

    // Chaqiruvni yopish
    socket.on('clear_emergency', (id) => {
        activeCorridors = activeCorridors.filter(c => c.id !== id);
        io.emit('update_corridors', activeCorridors);
    });

    socket.on('disconnect', () => {
        console.log('Dispetcher tarmoqdan uzildi:', socket.id);
    });
});

// Serverni 3000-portda ishga tushirish
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Yashil Yo'l serveri ishga tushdi: http://localhost:${PORT}`);
});