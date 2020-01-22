import * as express from 'express';
import * as http from 'http';
import * as ioLib from 'socket.io';
import { serverContainer } from '../inversify.config';
import { Business, Item } from '../logic/Business';
import { TYPES } from '../types';

const app = express();
const server = http.createServer(app);
const io = ioLib(server);

const business = serverContainer.get<Business>(TYPES.Business);

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
    // tslint:disable-next-line: no-console
    console.log('a user connected');

    socket.on('createItem', (data: Item) => {
        const item = business.createItem(data);
        socket.emit('createdItem', item);
    });

    socket.on('getItem', ({ id }) => {
        const item = business.getItem(id);
        socket.emit('gotItem', item);
    });
});

server.listen(3000, () => {
    // tslint:disable-next-line: no-console
    console.log('listening on *:3000');
});
