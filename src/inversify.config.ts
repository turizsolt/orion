import { Container } from 'inversify';
import 'reflect-metadata';
import { ActualBusiness } from './logic/ActualBusiness';
import { Business } from './logic/Business';
import { ActualPersistence } from './persistence/ActualPersistence';
import { Persistence } from './persistence/Persistence';
import { TYPES } from './types';

export const runContainer = new Container();
runContainer.bind<Business>(TYPES.Business).to(ActualBusiness);
runContainer.bind<Persistence>(TYPES.Persistence).to(ActualPersistence);
