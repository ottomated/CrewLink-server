import io from 'socket.io';

const server = io();

const peers = new Set();

interface Offer {
	offer: RTCSessionDescriptionInit;
	to: string;
}
interface Answer {
	answer: RTCSessionDescriptionInit;
	to: string;
}

server.on('connection', socket => {
	peers.add(socket.id);
	socket.on('disconnect', () => {
		peers.delete(socket.id);
		server.emit('peers', Array.from(peers));
	});

	let code : string | null = null;

	socket.on('join', (c) => {
		code = c;
		socket.join(code);
		socket.to(code).broadcast.emit('join', socket.id);
	});

	socket.on('leave', () => {
		if (code) socket.leave(code);
	})

	socket.on('offer', ({ offer, to }: Offer) => {
		console.log("Offer", socket.id, "->", to);
		server.to(to).emit('offer', {
			offer,
			from: socket.id
		});
	});
	socket.on('answer', ({ answer, to }: Answer) => {
		console.log("Answer", socket.id, "->", to);
		server.to(to).emit('answer', {
			answer,
			from: socket.id
		});
	});
	socket.emit('peers', Array.from(peers));
})

server.listen(5679);