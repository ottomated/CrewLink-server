import express from 'express';
import { Server } from 'http';
import { Server as HttpsServer } from 'https';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import socketIO from 'socket.io';
import Tracer from 'tracer';
import morgan from 'morgan';
import publicIp from 'public-ip';

const httpsEnabled = !!process.env.HTTPS;

const port = parseInt(process.env.PORT || (httpsEnabled ? '443' : '9736'));

const sslCertificatePath = process.env.SSLPATH || process.cwd();
const supportedVersions = readdirSync(join(process.cwd(), 'offsets')).map(file => file.replace('.yml', ''));

const logger = Tracer.colorConsole({
	format: "{{timestamp}} <{{title}}> {{message}}"
});

const app = express();
let server: HttpsServer | Server;
if (httpsEnabled) {
	server = new HttpsServer({
		key: readFileSync(join(sslCertificatePath, 'privkey.pem')),
		cert: readFileSync(join(sslCertificatePath, 'fullchain.pem'))
	}, app);
} else {
	server = new Server(app);
}
const io = socketIO(server);

const playerIds = new Map<string, number>();
const roomHostIds = new Map<string, string>();
const lobbySettings = new Map<string, { [key: string]: any }>();

interface Signal {
	data: string;
	to: string;
}

app.set('view engine', 'pug')
app.use(morgan('combined'))
app.use(express.static('offsets'))
let connectionCount = 0;
let address = process.env.ADDRESS;

app.get('/', (_, res) => {
	res.render('index', { connectionCount, address });
});

app.get('/health', (req, res) => {
	res.json({
		uptime: process.uptime(),
		connectionCount,
		address,
		name: process.env.NAME,
		supportedVersions
	});
})


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
		if (lobbySettings.has(code))
			socket.emit('setSettings', lobbySettings.get(code));
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
		if (code) {
			socket.leave(code);
			playerIds.delete(socket.id);
			if (roomHostIds.get(code) === socket.id)
				roomHostIds.delete(code);
			if (!io.sockets.adapter.rooms[code] || io.sockets.adapter.rooms[code].length === 0)
				lobbySettings.delete(code);
		}
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
			logger.error(`Socket %s sent invalid host command, not in any room`, socket.id);
			return;
		}
		roomHostIds.set(code, socket.id);
	});

	socket.on('config', (settings: { [key: string]: any }) => {
		if (typeof settings !== 'object') {
			socket.disconnect();
			logger.error(`Socket %s sent invalid config command: $j`, socket.id, settings);
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
		lobbySettings.set(code, settings);
		io.sockets.in(code).emit('setSettings', lobbySettings.get(code));
	});

	socket.on('disconnect', () => {
		playerIds.delete(socket.id);
		if (roomHostIds.get(code) === socket.id)
			roomHostIds.delete(code);
		if (!io.sockets.adapter.rooms[code] || io.sockets.adapter.rooms[code].length === 0)
			lobbySettings.delete(code);
		connectionCount--;
		playerIds.delete(socket.id);
		logger.info("Total connected: %d", connectionCount);
	})

})

server.listen(port);
(async () => {
	if (!address)
		address = `http://${await publicIp.v4()}:${port}`;
	logger.info('CrewLink Server started: %s', address);
})();