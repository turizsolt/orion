import { expect } from 'chai';
import { Business } from '../../src/logic/Business';
import { IdGenerator } from '../../src/logic/idGenerator/IdGenerator';
import { TYPES } from '../../src/types';
import { testContainer } from '../inversify.config';

const business = testContainer.get<Business>(TYPES.Business);
const idGenerator = testContainer.get<IdGenerator>(TYPES.IdGenerator);

describe('Basic item operations', () => {
    it('Create an item', () => {
        const item = {
            id: idGenerator.generate(),
            fields: {
                title: 'Create an orion server persistance',
            },
        };

        const resultItem = business.createItem(item);

        expect(resultItem).deep.equals(item);
    });

    it('Create an item, get it back', () => {
        const item = {
            fields: {
                title: 'Create an orion server persistance',
            },
            children: [],
        };

        const { id } = business.createItem(item);
        const { id: _, ...resultItem } = business.getItem(id);

        expect(resultItem).deep.equals(item);
    });
});
