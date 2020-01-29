import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from '../src/logic/ActualBusiness';
import { Business } from '../src/logic/Business';
import { IdGenerator } from '../src/logic/idGenerator/IdGenerator';
import { SequentialIdGenerator } from '../src/logic/idGenerator/SequentialIdGenerator';
import { InMemoryPersistence } from '../src/persistence/InMemoryPersistence';
import { Persistence } from '../src/persistence/Persistence';
import { TYPES } from '../src/types';

export const testContainer = new Container();
testContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
testContainer.bind<Persistence>(TYPES.Persistence).to(InMemoryPersistence);
testContainer.bind<IdGenerator>(TYPES.IdGenerator).to(SequentialIdGenerator);
