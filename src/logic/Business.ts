export interface Business {
    changeItem(data: any);
}

// todo not the real Item interface
export interface Item {
    children: ItemId[];
    fields: any;
}

export interface Change {
    field: string;
    oldValue: any;
    newValue: any;
}

export type ItemId = string;
