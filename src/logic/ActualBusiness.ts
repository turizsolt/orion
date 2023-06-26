import { inject, injectable } from 'inversify';
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
import { Business, Change, Item, ItemChange, ItemId, RelationChange, Transaction } from './Business';
import { IdGenerator } from './idGenerator/IdGenerator';

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;
    @inject(TYPES.IdGenerator) private idGen: IdGenerator;

    public changeItem(change: ItemChange) {
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

            change.orderedId = this.persistence.getNextId('change');
            this.persistence.save<Change>('change', change);

            return { ...change, response: 'accepted' };
        } else {
            return {
                ...change,
                oldValue: item.fields[change.field],
                response: 'rejected',
            };
        }
    }

    public addRelation(change: RelationChange) {
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
            
            change.orderedId = this.persistence.getNextId('change');
            this.persistence.save<Change>('change', change);
            return { ...change, response: 'accepted' };
        }

        if (index1 !== -1 && index2 !== -1) {
            return { ...change, response: 'rejected' };
        }

        // todo handle error somehow
    }

    public removeRelation(change: RelationChange) {
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

            change.orderedId = this.persistence.getNextId('change');
            this.persistence.save<Change>('change', change);

            return { ...change, response: 'accepted' };
        }

        // todo handle error somehow
    }

    public saveChange(change: Change): void {
        this.persistence.save<Change>('change', change);
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

    public getLastChanges(lastOrderedId: number): Change[] {
        return this.persistence
            .getFiltered('change', (change:Change) => change.orderedId >= lastOrderedId)
            .map((change:Change) => ({...change, response: 'accepted'}));
    }

    public getNextChangeOrderedId():number {
        return this.persistence.getNextId('change');
    }

    public runGenerators(day: number, weekday: number): Transaction {
        const changes = [];

        changes.push(...this.runSimpleGenerators(day, weekday));
        changes.push(...this.runComplexGenerators(day, weekday));

        return {
            id: this.idGen.generate(),
            changes,
        };
    }

    private runSimpleGenerators(day: number, weekday: number): Change[] {
        const items = this.persistence.getAll<Item>('item');
        const generatorItems: Item[] = items.filter(
            x => x.fields.simpleGenerator,
        );

        const changes = generatorItems
            .map(gItem => {
                try {
                    const json: any[] = JSON.parse(
                        gItem.fields.simpleGenerator,
                    );
                    if (json.length > 0) {
                        if (
                            json.some(condition => {
                                let result = false;

                                if (condition.weekday !== undefined) {
                                    if (condition.weekday === weekday) {
                                        result = true;
                                    } else {
                                        return false;
                                    }
                                }

                                if (condition.day !== undefined) {
                                    if (condition.day === day) {
                                        result = true;
                                    } else {
                                        return false;
                                    }
                                }

                                return result;
                            })
                        ) {
                            return this.applySimpleGenerator(gItem);
                        }
                    }
                } catch (e) {
                    return undefined as Change;
                }
            })
            .filter(x => x);

        if (changes.length > 0) {
            return changes;
        }
    }

    private runComplexGenerators(day: number, weekday: number): Change[] {
        const items = this.persistence.getAll<Item>('item');
        const generatorItems: Item[] = items.filter(x => x.fields.generator);

        const changes = generatorItems.map(gItem => {
            try {
                const json: any[] = JSON.parse(gItem.fields.generator);
                if (json.length > 0) {
                    if (
                        json.some(condition => {
                            let result = false;

                            if (condition.weekday !== undefined) {
                                if (condition.weekday === weekday) {
                                    result = true;
                                } else {
                                    return false;
                                }
                            }

                            if (condition.day !== undefined) {
                                if (condition.day === day) {
                                    result = true;
                                } else {
                                    return false;
                                }
                            }

                            return result;
                        })
                    ) {
                        return this.applyComplexGenerator(gItem);
                    }
                }
            } catch (e) {
                return [] as Change[];
            }
        });

        const xChanges = [].concat(...changes).filter(x => x);

        if (changes.length > 0) {
            return xChanges;
        }
    }

    private applySimpleGenerator(gItem: Item): Change {
        if (gItem.fields.state === 'done') {
            return this.changeItem({
                type: 'ItemChange',
                itemId: gItem.id,
                changeId: this.idGen.generate(),
                field: 'state',
                oldValue: gItem.fields.state,
                newValue: 'todo',
            });
        }

        return undefined;
    }

    private applyComplexGenerator(gItem: Item): Change[] {
        const templates = gItem.relations
            .filter(rel => rel.type === 'template')
            .map(tmp => tmp.otherSideId);
        return [].concat(...templates.map(id => this.copyItem(id, gItem.id)));
    }

    private copyItem(id: ItemId, generatorId: ItemId): Change[] {
        // todo copied from webclient should create a common method between the two versions
        const newId: ItemId = this.idGen.generate();
        const transaction: Change[] = [];

        const storedItem = this.persistence.getOne<Item>('item', id);

        if (storedItem.fields.deleted) {
            return [];
        }

        const change0 = this.changeItem({
            type: 'ItemChange',
            itemId: newId,
            changeId: this.idGen.generate(),
            field: 'title',
            oldValue: undefined,
            newValue: storedItem.fields.title,
        });
        transaction.push(change0);

        const change1 = this.changeItem({
            type: 'ItemChange',
            itemId: newId,
            changeId: this.idGen.generate(),
            field: 'generated',
            oldValue: false,
            newValue: true,
        });
        transaction.push(change1);

        const change1b = this.changeItem({
            type: 'ItemChange',
            itemId: newId,
            changeId: this.idGen.generate(),
            field: 'due',
            oldValue: undefined,
            newValue: new Date().toISOString(),
        });
        transaction.push(change1b);

        for (const fieldKey of Object.keys(storedItem.fields)) {
            if (fieldKey === 'template') {
                continue;
            }
            if (fieldKey === 'title') {
                continue;
            }

            const change = this.changeItem({
                type: 'ItemChange',
                itemId: newId,
                changeId: this.idGen.generate(),
                field: fieldKey,
                oldValue: undefined,
                newValue: storedItem.fields[fieldKey],
            });
            transaction.push(change);
        }

        for (const relation of storedItem.relations) {
            if (['hash', 'responsible', 'parent'].includes(relation.type)) {
                const change = this.addRelation({
                    type: 'AddRelation',
                    oneSideId: newId,
                    relation: relation.type,
                    otherSideId: relation.otherSideId,
                    changeId: this.idGen.generate(),
                });
                transaction.push(change);
            }
        }

        const change2 = this.addRelation({
            type: 'AddRelation',
            oneSideId: id,
            relation: 'copied',
            otherSideId: newId,
            changeId: this.idGen.generate(),
        });

        transaction.push(change2);

        const change3 = this.addRelation({
            type: 'AddRelation',
            oneSideId: generatorId,
            relation: 'generated',
            otherSideId: newId,
            changeId: this.idGen.generate(),
        });

        transaction.push(change3);

        return transaction;
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

        case 'template':
            return 'templateof';
        case 'templateof':
            return 'template';

        case 'generated':
            return 'generatedby';
        case 'generatedby':
            return 'generated';

        case 'copied':
            return 'copiedfrom';
        case 'copiedfrom':
            return 'copied';
    }
}
