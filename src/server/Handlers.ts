import * as ioLib from 'socket.io';
import { serverContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { TYPES } from '../types';

const business = serverContainer.get<Business>(TYPES.Business);

export const changeItem = (data: any) => {
    // tslint:disable-next-line: no-console
    console.log('changeItem', data);
    return business.changeItem(data);
};

export const addRelation = (socket: ioLib.Socket, data: any) => {
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
};

export const removeRelation = (socket: ioLib.Socket, data: any) => {
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
};
