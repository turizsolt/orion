import * as cors from 'cors';
import * as express from 'express';
import * as ioLib from 'socket.io';

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { serverContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { TYPES } from '../types';
import { login } from './login';
import * as socketioJwt from 'socketio-jwt';

const debugGenerator: boolean = false;

const business = serverContainer.get<Business>(TYPES.Business);

const app = express();
app.use(cors());

const config: any = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const secureData = config.ssl ? {
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
} : {};
const server = config.ssl
    ? https.createServer(secureData, app)
    : http.createServer(app);

const io = ioLib(server, { transport: ['websocket'], origins: '*' });

const timeStarted = (new Date()).toISOString();
let lastTicked: string = 'not yet';

app.get('/', (_, res) => {
    res.send({ hello: 'world', started: timeStarted, lastTicked });
});

app.post('/login', express.json(), (req, res) => login(req, res, config));

io.origins((origin, callback) => {
    // if (origin !== 'http://orion.zsiri.eu') {
    //   return callback('origin not allowed', false);
    // }
    callback(null, true);
});

// generators
let lastDate: Date = new Date();
let lastHours: number = lastDate.getHours();
setInterval(
    () => {
        const now = new Date();
        if (lastHours !== now.getHours() || debugGenerator) {
            lastHours = now.getHours();
            lastDate = now;

            if (lastHours === 6 || debugGenerator) {
                lastTicked = now.toISOString();
                // tslint:disable-next-line: no-console
                console.log('ticked', lastHours);

                const transaction = business.runGenerators(now.getDate(), now.getDay());

                if (transaction) {
                    if (transaction.changes.length > 0) {
                        transaction.changes.forEach(change => {
                            change.orderedId = business.getNextChangeOrderedId();
                            business.saveChange(change);
                        });
                        // tslint:disable-next-line: no-console
                        console.log('transaction', transaction);
                        io.emit('transaction', transaction);
                    }
                }
            }
        }
    },
    debugGenerator ? 5 * 1000 : 5 * 1000
);

io.on('connection', socketioJwt.authorize({
    secret: config.jwtSecret,
    timeout: 15000
}));

io.on('authenticated', (socket) => {
    // send all items to the client
    const allItem = business.getAllItem();
    socket.emit('allItem', allItem);    

    // tslint:disable-next-line: no-console
    console.log('a user connected:', socket.decoded_token.username);

    socket.on('getLastChanges', ({lastOrderedId}: {lastOrderedId:number}) => {
        socket.emit('lastChanges',business.getLastChanges(lastOrderedId));
    });

    socket.on('transaction', (data: any) => {
        // tslint:disable-next-line: no-console
        console.log('transactionReceived', data.transactionId);
        const response = [];
        for (const change of data.changes) {
            switch (change.type) {
                case 'ItemChange':
                    response.push(business.changeItem(change));
                    break;

                case 'AddRelation':
                    response.push(business.addRelation(change));
                    break;

                case 'RemoveRelation':
                    response.push(business.removeRelation(change));
                    break;
            }
        }

        const changes = response
            .filter(x => x.response === 'accepted');
        
        const forward = changes
            .map(x => ({ ...x, response: 'happened' }));

        socket.emit('transaction', {
            transactionId: data.transactionId,
            changes: response,
        });
        if (forward.length > 0) {
            socket.broadcast.emit('transaction', {
                transactionId: data.transactionId,
                changes: forward,
            });
        }

        // tslint:disable-next-line: no-console
        console.log('sending back', response);
        // tslint:disable-next-line: no-console
        console.log('sending forward', forward);
    });

    socket.on('stillalive', () => {
        socket.emit('stillalive', {time: (new Date()).getTime()});
    });

    socket.on('disconnect', reason => {
        // tslint:disable-next-line: no-console
        console.log('a user disconnected', reason);
    });
});

server.listen(8902, () => {
    // tslint:disable-next-line: no-console
    console.log('listening on *:8902');
});
