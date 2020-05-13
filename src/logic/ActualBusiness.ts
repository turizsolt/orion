import { inject, injectable } from 'inversify';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Change, Item } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public changeItem(data: any) {
        const storedItem = this.persistence.getOne<Item>('item', data.itemId);
        const item: any = storedItem || {
            id: data.itemId,
            fields: {},
            relations: [],
        };

        const change = data;
        if (
            !item.fields[change.field] ||
            item.fields[change.field] === change.oldValue
        ) {
            item.fields[change.field] = change.newValue;
            return { ...change, response: 'accepted' };
        } else {
            return {
                ...change,
                oldValue: item.fields[change.field],
                response: 'rejected',
            };
        }
    }

    public addRelation(data: any) {
        const item1 = this.persistence.getOne<Item>('item', data.oneSideId);
        const item2 = this.persistence.getOne<Item>('item', data.otherSideId);
        if (!item1.relations) {
            item1.relations = [];
        }
        if (!item2.relations) {
            item2.relations = [];
        }
        const index1 = item1.relations.findIndex(
            x => x.type === data.relation && x.otherSideId === data.otherSideId,
        );
        const index2 = item2.relations.findIndex(
            x =>
                x.type === opposite(data.relation) &&
                x.otherSideId === data.oneSideId,
        );
        if (index1 === -1 && index2 === -1) {
            item1.relations.push({
                type: data.relation,
                otherSideId: data.otherSideId,
            });
            item2.relations.push({
                type: opposite(data.relation),
                otherSideId: data.oneSideId,
            });

            this.persistence.update<Item>('item', item1.id, item1);
            this.persistence.update<Item>('item', item2.id, item2);
            return false;
        }

        if (index1 !== -1 && index2 !== -1) {
            return true;
        }

        // todo handle error somehow
    }

    public removeRelation(data: any) {
        const item1 = this.persistence.getOne<Item>('item', data.oneSideId);
        const item2 = this.persistence.getOne<Item>('item', data.otherSideId);

        const index1 = item1.relations.findIndex(
            x => x.type === data.relation && x.otherSideId === data.otherSideId,
        );
        const index2 = item2.relations.findIndex(
            x =>
                x.type === opposite(data.relation) &&
                x.otherSideId === data.oneSideId,
        );
        if (index1 === -1 && index2 === -1) {
            return false;
        }

        if (index1 !== -1 && index2 !== -1) {
            item1.relations = item1.relations.filter(
                x =>
                    x.type !== data.relation ||
                    x.otherSideId !== data.otherSideId,
            );
            item2.relations = item2.relations.filter(
                x =>
                    x.type !== opposite(data.relation) ||
                    x.otherSideId !== data.oneSideId,
            );

            this.persistence.update<Item>('item', item1.id, item1);
            this.persistence.update<Item>('item', item2.id, item2);

            return true;
        }

        // todo handle error somehow
    }

    public getAllItem() {
        const items = this.persistence.getAll<Item>('item');
        // tslint:disable-next-line: no-console
        return items.map(item => {
            const returnedItem = {
                id: item.id,
                changes: [],
                relations: item.relations,
            };
            for (const key of Object.keys(item.fields)) {
                returnedItem.changes.push({
                    field: key,
                    serverValue: item.fields[key],
                });
            }
            return returnedItem;
        });
    }
}

function arrify(arr: any[] | undefined): any[] {
    if (!arr) {
        return [];
    }
    return arr;
}

function opposite(x: string): string {
    if (x === 'child') {
        return 'parent';
    }
    return 'child';
}
