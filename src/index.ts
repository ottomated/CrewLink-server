import express from 'express';
import { Server } from 'http';
import socketIO from 'socket.io';
import Tracer from 'tracer';
import morgan from 'morgan';
import { setRoomConfig, getRoomConfig, RoomConfig, validateRoomConfig, deleteRoomConfig } from './config';

const port = parseInt(process.env.PORT || '9736');

const logger = Tracer.colorConsole({
	format: "{{timestamp}} <{{title}}> {{message}}"
});

const app = express();
const server = new Server(app);
const io = socketIO(server);

const playerIds = new Map<string, number>();
const roomHostIds = new Map<string, string>();

interface Signal {
	data: string;
	to: string;
}

app.use(morgan('combined'))
app.use(express.static('offsets'))

let connectionCount = 0;

io.on('connection', (socket: socketIO.Socket) => {
	connectionCount++;
	logger.info("Total connected: %d", connectionCount);
	let code: string | null = null;

	socket.on('join', (c: string, id: number) => {
		if (typeof c !== 'string' || typeof id !== 'number') {
			socket.disconnect();
			logger.error(`Socket %s sent invalid join command: %s %d`, socket.id, c, id);
			return;
		}
		code = c;
		socket.join(code);
		socket.to(code).broadcast.emit('join', socket.id, id);

		let socketsInLobby = Object.keys(io.sockets.adapter.rooms[code].sockets);
		let ids: any = {};
		for (let s of socketsInLobby) {
			if (s !== socket.id)
				ids[s] = playerIds.get(s);
		}
		socket.emit('setIds', ids);
		socket.emit('setConfig', getRoomConfig(code));
	});

	socket.on('id', (id: number) => {
		if (typeof id !== 'number') {
			socket.disconnect();
			logger.error(`Socket %s sent invalid id command: %d`, socket.id, id);
			return;
		}
		playerIds.set(socket.id, id);
		socket.to(code).broadcast.emit('setId', socket.id, id);
	})


	socket.on('leave', () => {
		if (code) socket.leave(code);
	})

	socket.on('signal', (signal: Signal) => {
		if (typeof signal !== 'object' || !signal.data || !signal.to || typeof signal.to !== 'string') {
			socket.disconnect();
			logger.error(`Socket %s sent invalid signal command: %j`, socket.id, signal);
			return;
		}
		const { to, data } = signal;
		io.to(to).emit('signal', {
			data,
			from: socket.id
		});
	});

	socket.on('host', () => {
		if (!code) {
			socket.disconnect();
			logger.error(`Socket %s sent invalid config command, not in any room`, socket.id);
			return;
		}
		roomHostIds.set(code, socket.id);
	})

	socket.on('config', (config: RoomConfig) => {
		if (validateRoomConfig(config)) {
			socket.disconnect();
			logger.error(`Socket %s sent invalid config command: $j`, socket.id, config);
			return;
		}
		if (!code) {
			socket.disconnect();
			logger.error(`Socket %s sent invalid config command, not in any room`, socket.id);
			return;
		}
		if (roomHostIds.get(code) !== socket.id) {
			socket.disconnect();
			logger.error(`Socket %s sent invalid config command, is not the room host`, socket.id);
			return;
		}
		setRoomConfig(code, config);
		socket.to(code).broadcast.emit('setConfig', getRoomConfig(code));
	});

	socket.on('disconnect', () => {
		playerIds.delete(socket.id);
		if (roomHostIds.get(code) === socket.id)
			roomHostIds.delete(code);
		if (io.sockets.adapter.rooms[code].length === 0)
			deleteRoomConfig(code);
		connectionCount--;
		logger.info("Total connected: %d", connectionCount);
	})

})

server.listen(port);
logger.info('Server listening on port %d', port);