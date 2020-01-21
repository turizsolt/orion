import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from '../src/logic/ActualBusiness';
import { Business } from '../src/logic/Business';
import { InMemoryPersistence } from '../src/persistence/InMemoryPersistence';
import { Persistence } from '../src/persistence/Persistence';
import { TYPES } from '../src/types';

export const testContainer = new Container();
testContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
testContainer.bind<Persistence>(TYPES.Persistence).to(InMemoryPersistence);
