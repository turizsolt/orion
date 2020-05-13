import * as cors from 'cors';
import * as express from 'express';
import * as ioLib from 'socket.io';

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import { serverContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { TYPES } from '../types';

const business = serverContainer.get<Business>(TYPES.Business);

const app = express();
app.use(cors());

const config: any = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

const secureData = {
    key: fs.readFileSync(config.key),
    cert: fs.readFileSync(config.cert),
};
const server = config.ssl
    ? https.createServer(secureData, app)
    : http.createServer(app);

const io = ioLib(server, { transport: ['websocket'], origins: '*' });

app.get('/', (_, res) => {
    res.send({ hello: 'world' });
});

io.origins((origin, callback) => {
    // if (origin !== 'http://orion.zsiri.eu') {
    //   return callback('origin not allowed', false);
    // }
    callback(null, true);
});

io.on('connection', socket => {
    // tslint:disable-next-line: no-console
    console.log('a user connected');
    // const allItem = business.getAllItem();
    // tslint:disable-next-line: no-console
    // console.log('allItem', allItem);
    // socket.emit('allItem', allItem);

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

        const forward = response
            .filter(x => x.response === 'accepted')
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

    socket.on('disconnect', reason => {
        // tslint:disable-next-line: no-console
        console.log('a user disconnected', reason);
    });
});

server.listen(8902, () => {
    // tslint:disable-next-line: no-console
    console.log('listening on *:8902');
});
