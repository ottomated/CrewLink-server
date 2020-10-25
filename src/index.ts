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

	socket.on('join', () => {
		console.log("Join", socket.id);
		socket.broadcast.emit('join', socket.id);
	});

	socket.on('offer', ({ offer, to }: Offer) => {
		console.log("Offer", socket.id, "->", to);
		socket.to(to).emit('offer', {
			offer,
			from: socket.id
		});
	});
	socket.on('answer', ({ answer, to }: Answer) => {
		console.log("Answer", socket.id, "->", to);
		socket.to(to).emit('answer', {
			answer,
			from: socket.id
		});
	});
	socket.emit('peers', Array.from(peers));
})

server.listen(5679);