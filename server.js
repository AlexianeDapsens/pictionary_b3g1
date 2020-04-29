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

//tableau pour stocker les users
let users = [];

let currentPlayer = null;
let timeout;

//créer un tableau avec les mots à dessiner
let words = ['apple', 'window', 'linux'];

function onConnection(socket){
	socket.on('username', (username) => {
		console.log('Client name : ', username);
		//stocker tous les nom d'utilisateurs dans le socket
		socket.username = username;

		if(users.length === 0){
			currentPlayer = socket;
			users.push(socket);
			switchPlayer();
		}else{
			users.push(socket);
		}

		sendUsers();
	});

	socket.on('line', (data) => {
		socket.broadcast.emit('line', data);
	});

	//qd 1 client se déconnecte
	socket.on('disconnect', () => {
		//parcourir tableau et supprimer celui qui vient de se déconnecter
		users = users.filter((user) => {
			return user !== socket;
		});
		sendUsers();
	});
}

function sendUsers(){
	io.emit('users', users.map((user) => {
		return {
			username : user.username,
			active: user === currentPlayer
		}
	}));
}

function switchPlayer(){
	//arrêt si plus de joueurs
	if(users.length === 0) return;

	//EXEMPLE
	//si user = [a,b,c]
	//currentPlayer = a => indexCurrentPlayer = 0
	//currentPlayer = user[1 % 3] => users[2] -> b
	const indexCurrentPlayer = users.indexOf(currentPlayer);
	//passer au joueur suivant
	currentPlayer = users[(indexCurrentPlayer + 1) % users.length];

	sendUsers();
	timeout = setTimeout(switchPlayer, 20000);

	currentPlayer.emit('word', words[Math.floor(words.length * Math.random())]);

	io.emit('clear');
}