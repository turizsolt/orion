import * as cors from 'cors';
import * as express from 'express';
import * as http from 'http';
import * as ioLib from 'socket.io';
import { serverContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { IdGenerator } from '../logic/idGenerator/IdGenerator';
import { TYPES } from '../types';

const app = express();
app.use(cors());
const server = http.createServer(app);
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

    socket.on('disconnect', reason => {
        // tslint:disable-next-line: no-console
        console.log('a user disconnected', reason);
    });
});

server.listen(8902, () => {
    // tslint:disable-next-line: no-console
    console.log('listening on *:8902');
});
