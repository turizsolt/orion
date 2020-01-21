import { expect } from 'chai';
import { Business } from '../../src/logic/Business';
import { TYPES } from '../../src/types';
import { testContainer } from '../inversify.config';

const business = testContainer.get<Business>(TYPES.Business);

describe('Basic item operations', () => {
    it('Create an item', () => {
        const item = {
            title: 'Create an orion server persistance',
            children: [],
        };

        const { id, ...resultItem } = business.createItem(item);

        expect(id).not.equals(undefined);
        expect(resultItem).deep.equals(item);
    });

    it('Create two items, gets different id', () => {
        const item = {
            title: 'Create an orion server persistance',
            children: [],
        };

        const { id: id1 } = business.createItem(item);
        const { id: id2 } = business.createItem(item);

        expect(id1).not.equals(id2);
    });

    it('Create an item, get it back', () => {
        const item = {
            title: 'Create an orion server persistance',
            children: [],
        };

        const { id } = business.createItem(item);
        const { id: _, ...resultItem } = business.getItem(id);

        expect(resultItem).deep.equals(item);
    });
});
