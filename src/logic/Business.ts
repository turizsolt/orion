export interface Business {
    changeItem(data: any);
    getAllItem();
}

// todo not the real Item interface
export interface Item {
    id: ItemId;
    fields: Record<string, any>;
}

export interface Change {
    field: string;
    oldValue: any;
    newValue: any;
}

export type ItemId = string;
