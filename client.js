const socket = io();
let playerNumber = null; // Armazena o número do jogador (1 ou 2)
let playerCount = 0; // Contador de jogadores
let readyPlayers = {}; // Armazena quais jogadores estão prontos

// Função para atualizar a contagem de jogadores conectados
function updatePlayerCount() {
    document.getElementById('status').textContent = `Jogadores conectados: ${playerCount}/2`;
}

// Envia uma mensagem ao clicar no botão de enviar
document.getElementById('send').addEventListener('click', () => {
    const messageInput = document.getElementById('message');
    const message = messageInput.value;
    socket.emit('chat message', message);
    messageInput.value = ''; // Limpa o campo de entrada
});

// Recebe mensagens do servidor
socket.on('chat message', (msg) => {
    const chatMessages = document.querySelector('.chat-messages');
    const messageElement = document.createElement('div');
    messageElement.textContent = msg;
    chatMessages.appendChild(messageElement);
});

// Quando um jogador se conecta
socket.on('player connected', (number) => {
    playerNumber = number; // Atribui o número do jogador (1 ou 2)
    playerCount++;
    updatePlayerCount();
    document.getElementById('status').textContent = `Você é o Jogador ${playerNumber}`;
});

// Quando um jogador está pronto
socket.on('player ready', (playerId) => {
    readyPlayers[playerId] = true;

    // Verifica se ambos os jogadores estão prontos
    if (Object.keys(readyPlayers).length === 2) {
        document.getElementById('start-game').disabled = false; // Habilita o botão de iniciar
        document.getElementById('status').textContent = 'Ambos os jogadores estão prontos! Clique para iniciar.';
    }
});

// Quando um jogador clica no botão de iniciar
document.getElementById('start-game').addEventListener('click', () => {
    socket.emit('start game'); // Notifica o servidor que o jogo deve começar
});

// Quando o jogo deve começar
socket.on('game starting', () => {
    window.open('/emulador'); // Mudar para a rota do emulador
});

// Chama a função quando o jogador estiver pronto (você pode fazer isso em algum lugar apropriado, como em um botão)
function playerReady() {
    socket.emit('player ready', socket.id);
}

// Adiciona evento ao clicar no botão de "Pronto"
document.getElementById('ready').addEventListener('click', () => {
    playerReady();
    document.getElementById('ready').disabled = true; // Desabilita o botão após clicar
});

// Função para capturar os inputs do jogador local e enviar para o servidor
function handlePlayerInput(event) {
    const key = event.key;
    const allowedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'a', 's', 'd', 'f'];

    if (allowedKeys.includes(key)) {
        // Emite o input para o servidor, que vai repassar ao outro jogador
        socket.emit('player input', { key, type: event.type, player: playerNumber });

        // Simula a entrada no emulador localmente
        if (playerNumber === 1) {
            if (event.type === 'keydown') {
                EJS_inputPlayer1(key); // Jogador 1 pressiona uma tecla
            } else if (event.type === 'keyup') {
                EJS_stopPlayer1(key); // Jogador 1 solta uma tecla
            }
        } else if (playerNumber === 2) {
            if (event.type === 'keydown') {
                EJS_inputPlayer2(key); // Jogador 2 pressiona uma tecla
            } else if (event.type === 'keyup') {
                EJS_stopPlayer2(key); // Jogador 2 solta uma tecla
            }
        }
    }
}

// Listener para capturar os inputs de teclas pressionadas e soltas
window.addEventListener('keydown', handlePlayerInput);
window.addEventListener('keyup', handlePlayerInput);

// Recebe os inputs do outro jogador sincronizados pelo servidor
socket.on('sync input', (inputData) => {
    const key = inputData.key;

    // Simula a entrada do outro jogador no emulador
    if (inputData.player === 1) {
        if (inputData.type === 'keydown') {
            EJS_inputPlayer1(key); // Jogador 1 pressiona uma tecla
        } else if (inputData.type === 'keyup') {
            EJS_stopPlayer1(key); // Jogador 1 solta uma tecla
        }
    } else if (inputData.player === 2) {
        if (inputData.type === 'keydown') {
            EJS_inputPlayer2(key); // Jogador 2 pressiona uma tecla
        } else if (inputData.type === 'keyup') {
            EJS_stopPlayer2(key); // Jogador 2 solta uma tecla
        }
    }
});
