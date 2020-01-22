import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from '../src/logic/ActualBusiness';
import { Business } from '../src/logic/Business';
import { InMemoryPersistence } from '../src/persistence/InMemoryPersistence';
import { Persistence } from '../src/persistence/Persistence';
import { TYPES } from '../src/types';

export const serverContainer = new Container();
serverContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
serverContainer.bind<Persistence>(TYPES.Persistence).to(InMemoryPersistence);
