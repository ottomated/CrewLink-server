import express from 'express';
import { Server } from 'http';
import socketIO from 'socket.io';
import { createReadStream } from 'fs';

const app = express();
const server = new Server(app);
const io = socketIO(server);

const playerIds = new Map<string, number>();

interface Signal {
	data: string;
	to: string;
}

app.use(express.static('offsets'))

io.on('connection', (socket: socketIO.Socket) => {
	let code: string | null = null;

	socket.on('join', (c: string, id: number) => {
		code = c;
		socket.join(code);
		socket.to(code).broadcast.emit('join', socket.id, id);

		let socketsInLobby = Object.keys(io.sockets.adapter.rooms[code].sockets);
		let ids: any = {};
		for (let socket of socketsInLobby) {
			ids[socket] = playerIds.get(socket);
		}
		socket.emit('setIds', ids);
	});

	socket.on('id', (id: number) => {
		playerIds.set(socket.id, id);
		socket.to(code).broadcast.emit('setId', socket.id, id);
	})


	socket.on('leave', () => {
		if (code) socket.leave(code);
	})

	socket.on('signal', ({ data, to }: Signal) => {
		io.to(to).emit('signal', {
			data,
			from: socket.id
		});
	});

})

server.listen(9736);