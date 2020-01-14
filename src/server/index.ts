import { config } from '../../Config';
import { runContainer } from '../inversify.config';
import { TYPES } from '../types';
import { Server } from './Server';

const server = runContainer.get<Server>(TYPES.Server);
server.start(config.port);
