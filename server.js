'use strict';

//Pour lancer le serveur
const express = require('express');
const socketIO = require('socket.io');

const port = process.env.PORT || 3000;
const index = '/pictionary.html';

const server = express()
	.use((req, res) => res.sendFile(index, {root: __dirname}))
	.listen(port, () => console.log('Listening on port ', port));



//Demander à socket IO d'écouter le serveur pour savoir ce qui se passe dessus
const io = socketIO(server);

//quand il y a une connection, exécuter une fonction
io.on('connection', (socket) => {
	console.log('A new client joined the server');
	onConnection(socket);
});

function onConnection(socket){
	socket.on('username', (username) => {
		console.log('Client name : ', username);
	});

	socket.on('line', (data) => {
		socket.broadcast.emit('line', data);
	});
}