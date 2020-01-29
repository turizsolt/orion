import { inject, injectable } from 'inversify';
import * as shortid from 'shortid';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Item, ItemId } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public updateItem(data: any) {
        const item = this.persistence.getOne<Item>('item', data.itemId);
        item.fields[data.field] = data.newValue;
        this.persistence.save('item', item);
        return data;
    }

    public createRelation(data: any) {
        const itemParent = this.persistence.getOne<Item>('item', data.parentId);
        const itemChild = this.persistence.getOne<Item>('item', data.childId);
        itemParent.fields.children = [
            ...arrify(itemParent.fields.children),
            data.childId,
        ];
        itemChild.fields.parents = [
            ...arrify(itemParent.fields.parents),
            data.parentId,
        ];
        this.persistence.save('item', itemParent);
        this.persistence.save('item', itemChild);
        return data;
    }

    public getItem(id: ItemId) {
        return this.persistence.getOne('item', id);
    }

    public getAllItem() {
        return this.persistence.getAll('item');
    }

    public createItem(item: any) {
        this.persistence.save('item', item);
        return item;
    }
}

function arrify(arr: any[] | undefined): any[] {
    if (!arr) {
        return [];
    }
    return arr;
}
