const twilio = require('twilio')
const SimplePeer = require('simple-peer');
const wrtc = require('wrtc') // per ottenere questo devi runnare prima {{{  npm install -g node-pre-gyp  }}}

async function main() {
    const accountSid = "AC97e57a540764c656a6d1e1d814f9c183";
    const authToken = "428dc58d41522de9a859b20b3cba9cd7";
    const client = twilio(accountSid, authToken)
    const iceConfig = await client.tokens.create()

    console.log(iceConfig)

    const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        config: iceConfig,
        wrtc: wrtc
    });

    peer.on('signal', data => {
        console.log('Segnale ricevuto dal peer:', data);
    });

    peer.on('connect', () => {
        console.log('Connessione stabilita con il peer!');
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

}
main()