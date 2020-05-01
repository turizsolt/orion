import { inject, injectable } from 'inversify';
import * as shortid from 'shortid';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Change, Item } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public changeItem(data: any) {
        const storedItem = this.persistence.getOne<Item>('item', data.id);
        const item: any = storedItem || { id: data.id, fields: {} };

        const conflictedChanges = [];
        const acceptedChanges = [];
        let conflictedMessage = null;
        let acceptedMessage = null;
        const changes: Change[] = data.changes;
        for (const change of changes) {
            if (
                !item.fields[change.field] ||
                item.fields[change.field] === change.oldValue
            ) {
                acceptedChanges.push(change);
                item.fields[change.field] = change.newValue;
            } else {
                conflictedChanges.push({
                    ...change,
                    serverValue: item.fields[change.field],
                });
            }
        }

        if (acceptedChanges.length > 0) {
            this.persistence.update('item', item.id, item);
            acceptedMessage = {
                id: item.id,
                changes: acceptedChanges,
            };
        }

        if (conflictedChanges.length > 0) {
            conflictedMessage = {
                id: item.id,
                changes: conflictedChanges,
            };
        }

        return { acceptedMessage, conflictedMessage };
    }

    public getAllItem() {
        const items = this.persistence.getAll<Item>('item');
        // tslint:disable-next-line: no-console
        return items.map(item => {
            const returnedItem = {
                id: item.id,
                changes: [],
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
