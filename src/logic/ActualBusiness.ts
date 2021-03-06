import { inject, injectable } from 'inversify';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Change, Item } from './Business';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public changeItem(change: any) {
        const storedItem = this.persistence.getOne<Item>('item', change.itemId);
        const item: any = storedItem || {
            id: change.itemId,
            fields: {},
            relations: [],
        };

        if (
            !item.fields[change.field] ||
            item.fields[change.field] === change.oldValue
        ) {
            item.fields[change.field] = change.newValue;
            this.persistence.update<Item>('item', item.id, item);
            return { ...change, response: 'accepted' };
        } else {
            return {
                ...change,
                oldValue: item.fields[change.field],
                response: 'rejected',
            };
        }
    }

    public addRelation(change: any) {
        const item1 = this.persistence.getOne<Item>('item', change.oneSideId);
        const item2 = this.persistence.getOne<Item>('item', change.otherSideId);
        if (!item1.relations) {
            item1.relations = [];
        }
        if (!item2.relations) {
            item2.relations = [];
        }
        const index1 = item1.relations.findIndex(
            x =>
                x.type === change.relation &&
                x.otherSideId === change.otherSideId,
        );
        const index2 = item2.relations.findIndex(
            x =>
                x.type === opposite(change.relation) &&
                x.otherSideId === change.oneSideId,
        );
        if (index1 === -1 && index2 === -1) {
            item1.relations.push({
                type: change.relation,
                otherSideId: change.otherSideId,
            });
            item2.relations.push({
                type: opposite(change.relation),
                otherSideId: change.oneSideId,
            });

            this.persistence.update<Item>('item', item1.id, item1);
            this.persistence.update<Item>('item', item2.id, item2);
            return { ...change, response: 'accepted' };
        }

        if (index1 !== -1 && index2 !== -1) {
            return { ...change, response: 'rejected' };
        }

        // todo handle error somehow
    }

    public removeRelation(change: any) {
        const item1 = this.persistence.getOne<Item>('item', change.oneSideId);
        const item2 = this.persistence.getOne<Item>('item', change.otherSideId);

        const index1 = item1.relations.findIndex(
            x =>
                x.type === change.relation &&
                x.otherSideId === change.otherSideId,
        );
        const index2 = item2.relations.findIndex(
            x =>
                x.type === opposite(change.relation) &&
                x.otherSideId === change.oneSideId,
        );
        if (index1 === -1 && index2 === -1) {
            return { ...change, response: 'rejected' };
        }

        if (index1 !== -1 && index2 !== -1) {
            item1.relations[index1].deleted = true;
            item2.relations[index2].deleted = true;

            this.persistence.update<Item>('item', item1.id, item1);
            this.persistence.update<Item>('item', item2.id, item2);

            return { ...change, response: 'accepted' };
        }

        // todo handle error somehow
    }

    public getAllItem() {
        const items = this.persistence.getAll<Item>('item');
        // tslint:disable-next-line: no-console
        const itemChanges = [];
        const relChanges = [];
        items.map(item => {
            for (const key of Object.keys(item.fields)) {
                itemChanges.push({
                    type: 'ItemChange',
                    itemId: item.id,
                    changeId: undefined,
                    field: key,
                    oldValue: item.fields[key],
                    newValue: item.fields[key],
                    response: 'serverUpdate',
                });
            }

            for (const relation of item.relations) {
                relChanges.push({
                    type: relation.deleted ? 'RemoveRelation' : 'AddRelation',
                    changeId: undefined,
                    oneSideId: item.id,
                    relation: relation.type,
                    otherSideId: relation.otherSideId,
                    response: 'serverUpdate',
                });
            }
        });
        return {
            transactionId: undefined,
            changes: itemChanges.concat(relChanges),
        };
    }
}

function opposite(x: string): string {
    switch (x) {
        case 'children':
            return 'parent';
        case 'parent':
            return 'children';
        case 'hash':
            return 'hashof';
        case 'hashof':
            return 'hash';
        case 'responsible':
            return 'responsibleof';
        case 'responsibleof':
            return 'responsible';
    }
}
