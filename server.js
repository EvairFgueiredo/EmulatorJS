const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Para servir arquivos estáticos

const players = {}; // Armazena os IDs dos jogadores

io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    // Adiciona o jogador à lista de jogadores
    players[socket.id] = socket.id;

    // Notifica que um jogador se conectou
    io.emit('player connected');

    // Quando um jogador está pronto
    socket.on('player ready', (playerId) => {
        io.emit('player ready', playerId); // Notifica todos os jogadores que alguém está pronto
    });

    // Quando o jogo deve começar
    socket.on('start game', () => {
        io.emit('game starting'); // Notifica todos os jogadores que o jogo está começando
    });

    // Quando um usuário envia uma mensagem
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg); // Envia a mensagem para todos os usuários
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
        delete players[socket.id]; // Remove o jogador da lista
        io.emit('player disconnected', socket.id); // Notifica todos os jogadores sobre a desconexão
    });
});

// Rota para o emulador
app.get('/emulador', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/emulator.html'));
});

server.listen(3000, () => {
    console.log('Servidor ouvindo na porta 3000');
});
