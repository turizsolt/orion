import { inject, injectable } from 'inversify';
import * as shortid from 'shortid';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Item, ItemId } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public updateItem(data: any) {
        const item = this.persistence.getOne<Item>('item', data.id);
        for (const change of data.changes) {
            item.fields[change.field] = change.newValue;
        }
        this.persistence.save('item', item);
        return data;
    }

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
