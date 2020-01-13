import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from '../src/logic/ActualBusiness';
import { Business } from '../src/logic/Business';
import { InMemoryPersistence } from '../src/persistence/InMemoryPersistence';
import { Persistence } from '../src/persistence/Persistence';
import { TYPES } from '../src/types';

export const isolatedContainer = new Container();
isolatedContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
isolatedContainer.bind<Persistence>(TYPES.Persistence).to(InMemoryPersistence);
