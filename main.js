const twilio = require('twilio');
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc');
const WebSocket = require('ws'); // WebSocket per il signaling

// WebSocket server per scambio segnali
const wss = new WebSocket.Server({ port: 8080 });

let connections = 0;
let peers = {}; // Per mantenere traccia dei peer connessi

async function main() {
    const accountSid = "AC97e57a540764c656a6d1e1d814f9c183";
    const authToken = "428dc58d41522de9a859b20b3cba9cd7";
    const client = twilio(accountSid, authToken);
    const iceConfig = await client.tokens.create();

    console.log(iceConfig);

    // Gestione dei messaggi di signaling da e verso WebSocket
    wss.on('connection', ws => {
        console.log("Nuovo peer connesso");

        ws.on('message', (message) => {
            console.log("Messaggio ricevuto: ", message);

            const data = JSON.parse(message);

            if (data.type === 'offer') {
                const peer = createPeer(ws, iceConfig); // Creazione del peer per il nuovo peer

                peer.signal(data.signal); // Rispondere al segnale
                peers[ws] = peer; // Mantenere traccia della connessione
            } else if (data.type === 'answer') {
                peers[ws].signal(data.signal); // Rispondere con l'answer del peer
            } else if (data.type === 'candidate') {
                peers[ws].signal(data.signal); // Gestire i nuovi candidati ICE
            }
        });

        ws.on('close', () => {
            console.log("Peer disconnesso");
            delete peers[ws];
        });
    });
}

function createPeer(ws, iceConfig) {
    const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        config: iceConfig,
        wrtc: wrtc
    });

    peer.on('signal', data => {
        console.log('Segnale ricevuto dal peer:', data.candidate);

        // Inviare il segnale al peer remoto via WebSocket
        ws.send(JSON.stringify({ type: 'offer', signal: data }));
    });

    peer.on('connect', () => {
        connections++;
        console.log(`Connessione stabilita. Numero di connessioni: ${connections}`);
    });

    peer.on('data', data => {
        console.log('Dati ricevuti dal peer:', data.toString());
    });

    peer.on('error', err => {
        console.error('Errore nella connessione peer:', err);
    });

    peer.on('close', () => {
        console.log('Connessione chiusa.');
    });

    return peer;
}

main();