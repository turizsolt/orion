export interface Business {
    changeItem(data: any);
    addRelation(data: any);
    removeRelation(data: any);
    getAllItem();
    getLastChanges(lastOrderedId: number): Change[];
    saveChange(change: Change): void;
    runGenerators(day: number, weekday: number): Transaction;
    getNextChangeOrderedId():number;
}

export interface Item {
    id: ItemId;
    fields: Record<string, any>;
    relations: Relation[];
}

export interface Relation {
    type: string;
    otherSideId: ItemId;
    deleted?: boolean;
}

export type Change = ItemChange | RelationChange;
export interface ItemChange {
    orderedId?: number;
    changeId: string;
    type: 'ItemChange';
    itemId: ItemId;
    field: string;
    oldValue: any;
    newValue: any;
}

export interface RelationChange {
    orderedId?: number;
    changeId: string;
    type: 'AddRelation' | 'RemoveRelation';
    relation: string;
    oneSideId: ItemId;
    otherSideId: ItemId;
}

export interface Transaction {
    id: string;
    changes: Change[];
}

export type ItemId = string;
