const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const MPLEX = require('libp2p-mplex')
const SECIO = require('libp2p-secio')
const PeerId = require('peer-id')
const { multiaddr } = require('multiaddr')

async function createLibp2pNode() {
    // Crea una chiave privata e un PeerId
    const peerId = await PeerId.create()

    // Crea il nodo libp2p
    const node = await Libp2p.create({
        peerId,
        modules: {
            transport: [TCP],
            streamMuxer: [MPLEX],
            connEncryption: [SECIO],
        }
    })

    // Avvia il nodo
    await node.start()

    console.log('Node started with id:', node.peerId.toB58String())
    return node
}

async function connectToExternalPeer() {
    // Indirizzo IP pubblico del peer esterno (modifica con l'IP corretto)
    const peerAddr = '/ip4/93.150.198.107/tcp/4000'
    const multiAddr = multiaddr(peerAddr)

    // Crea il nodo
    const node = await createLibp2pNode()

    // Connetti al peer esterno
    try {
        await node.dial(multiAddr)
        console.log('Connected to peer:', multiAddr.toString())

        // Qui puoi aggiungere la logica per scaricare una risorsa
        // Ad esempio, una volta connesso puoi inviare un messaggio al peer per richiedere una risorsa
        const stream = await node.dialProtocol(multiAddr, '/my-custom-protocol')

        // Esempio di invio di una richiesta (richiesta di risorsa)
        const message = 'Scarica la risorsa'
        stream.write(Buffer.from(message))

        // Leggi i dati di risposta (la risorsa)
        stream.on('data', (data) => {
            console.log('Risorsa ricevuta:', data.toString())
                // Puoi salvare o processare la risorsa qui
        })

        // Chiudi il stream dopo aver ricevuto la risorsa
        stream.on('end', () => {
            console.log('Trasferimento completato')
        })

    } catch (error) {
        console.error('Errore durante la connessione al peer:', error)
    }
}

// Esegui la connessione al peer esterno
let i = 0
let itvl = setInterval(() => {
    console.log(++i)
    if (i === 6) {
        clearInterval(itvl)
    }
}, 1000)
setTimeout(connectToExternalPeer, 6000)