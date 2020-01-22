import { inject, injectable } from 'inversify';
import * as shortid from 'shortid';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Item, ItemId } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public getItem(id: ItemId) {
        return this.persistence.getOne('item', id);
    }

    public createItem(item: Item) {
        const itemWithId = {
            ...item,
            id: shortid.generate(),
        };

        this.persistence.save('item', itemWithId);
        return itemWithId;
    }
}
