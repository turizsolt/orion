import * as cors from 'cors';
import * as express from 'express';
import * as ioLib from 'socket.io';
import { serverContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { IdGenerator } from '../logic/idGenerator/IdGenerator';
import { TYPES } from '../types';

import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

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

const business = serverContainer.get<Business>(TYPES.Business);
const idGenerator = serverContainer.get<IdGenerator>(TYPES.IdGenerator);

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
    const allItem = business.getAllItem();
    // tslint:disable-next-line: no-console
    console.log('allItem', allItem);
    socket.emit('allItem', allItem);

    socket.on('changeItem', (data: any) => {
        // tslint:disable-next-line: no-console
        console.log('changeItem', data);
        const { acceptedMessage, conflictedMessage } = business.changeItem(
            data,
        );

        // tslint:disable-next-line: no-console
        console.log('accepted', acceptedMessage);
        // tslint:disable-next-line: no-console
        console.log('conflicted', conflictedMessage);

        if (acceptedMessage) {
            socket.emit('changeItemAccepted', acceptedMessage);
            socket.broadcast.emit('changeItemHappened', acceptedMessage);
        }

        if (conflictedMessage) {
            socket.emit('changeItemConflicted', conflictedMessage);
        }
    });

    socket.on('addRelation', data => {
        // tslint:disable-next-line: no-console
        console.log('addRelation', data);
        const exists = business.addRelation(data);

        if (exists === true) {
            socket.emit('addRelationAlreadyExists', data);
        }

        if (exists === false) {
            socket.emit('addRelationAccepted', data);
            socket.broadcast.emit('addRelationHappened', data);
        }
    });

    socket.on('removeRelation', data => {
        // tslint:disable-next-line: no-console
        console.log('removeRelation', data);
        const exists = business.removeRelation(data);

        if (exists === true) {
            socket.emit('removeRelationAccepted', data);
            socket.broadcast.emit('removeRelationHappened', data);
        }

        if (exists === false) {
            socket.emit('removeRelationAlreadyExists', data);
        }
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
