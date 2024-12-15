import { noise } from '@chainsafe/libp2p-noise';
import { tcp } from '@libp2p/tcp';
import { createLibp2p } from 'libp2p';

const createNode = async() => {
    const node = await createLibp2p({
        addresses: { listen: ['/ip4/0.0.0.0/tcp/0'] },
        transports: [tcp()],
        connectionEncrypters: [noise()],
    });

    // Protocol definition
    const protocol = '/my-protocol/1.0.0';

    // Handle incoming messages
    node.handle(protocol, async({ stream }) => {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        for await (const chunk of stream.source) {
            const message = decoder.decode(chunk);
            console.log('Received:', message);

            // Send a response
            await stream.sink([encoder.encode(`Message received: ${message}`)]);
        }
    });

    return node;
};

const main = async() => {
    const node = await createNode();

    console.log('Node has started');
    console.log('Listening on:');
    node.getMultiaddrs().forEach((ma) => console.log(ma.toString()));

    process.on('SIGINT', async() => {
        console.log('Shutting down node...');
        await node.stop();
        console.log('Node stopped');
        process.exit(0);
    });
};

main().catch((err) => {
    console.error('An error occurred:', err);
});