export interface Business {
    changeItem(data: any);
    addRelation(data: any);
    removeRelation(data: any);
    getAllItem();
    saveTransaction(transaction: Transaction): void;
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

export interface Change {
    field: string;
    oldValue: any;
    newValue: any;
}

export interface Transaction {
    id: string;
    changes: Change[];
}

export type ItemId = string;
