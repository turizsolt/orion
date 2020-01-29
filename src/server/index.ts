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

    socket.on('createItem', (data: any) => {
        business.createItem(data.data.item);
        io.emit('createdItem', data);
    });

    socket.on('createRelation', (data: any) => {
        business.createRelation(data.data);
        io.emit('createdRelation', data);
    });

    socket.on('updateItem', (data: any) => {
        business.updateItem(data.data);
        setTimeout(() => io.emit('updatedItem', data), 1000);
    });

    socket.on('getItem', ({ id }) => {
        const item = business.getItem(id);
        socket.emit('gotItem', toChange(item));
    });

    socket.on('getAllItem', () => {
        const items = business.getAllItem();
        socket.emit('gotAllItem', items.map(toChange));
    });
});

function toChange(item) {
    return {
        type: 'GetItem',
        id: idGenerator.generate(),
        data: {
            item,
        },
    };
}

server.listen(8902, () => {
    // tslint:disable-next-line: no-console
    console.log('listening on *:8902');
});
