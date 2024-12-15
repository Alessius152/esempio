import { noise } from '@chainsafe/libp2p-noise';
import { tcp } from '@libp2p/tcp';
import { createLibp2p } from 'libp2p';

const createListenerNode = async() => {
    const protocol = '/my-protocol/1.0.0';

    const node = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/1234'] // Ascolta su porta 1234
        },
        transports: [tcp()],
        connectionEncrypters: [noise()],
    });

    // Gestione del protocollo
    node.handle(protocol, async({ stream }) => {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        for await (const chunk of stream.source) {
            const message = decoder.decode(chunk);
            console.log('Messaggio ricevuto:', message);

            // Risposta
            const response = `Risposta al messaggio: "${message}"`;
            await stream.sink([encoder.encode(response)]);
        }
    });

    console.log('Nodo listener avviato');
    console.log('Indirizzo di ascolto:', node.getMultiaddrs().map((ma) => ma.toString()));

    return node;
};

// Avvia il nodo listener
createListenerNode().catch(console.error);