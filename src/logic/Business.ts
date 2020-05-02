export interface Business {
    changeItem(data: any);
    addRelation(data: any);
    removeRelation(data: any);
    getAllItem();
}

export interface Item {
    id: ItemId;
    fields: Record<string, any>;
    relations: Relation[];
}

export interface Relation {
    type: string;
    otherSideId: ItemId;
}

export interface Change {
    field: string;
    oldValue: any;
    newValue: any;
}

export type ItemId = string;
