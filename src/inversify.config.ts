import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from '../src/logic/ActualBusiness';
import { Business } from '../src/logic/Business';
import { JsonFilePersistence } from '../src/persistence/JsonFilePersistence';
import { Persistence } from '../src/persistence/Persistence';
import { TYPES } from '../src/types';
import { ActualIdGenerator } from './logic/idGenerator/ActualIdGenerator';
import { IdGenerator } from './logic/idGenerator/IdGenerator';

export const serverContainer = new Container();
serverContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
serverContainer.bind<Persistence>(TYPES.Persistence).to(JsonFilePersistence);
serverContainer.bind<IdGenerator>(TYPES.IdGenerator).to(ActualIdGenerator);
