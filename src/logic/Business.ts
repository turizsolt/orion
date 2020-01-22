export interface Business {
    createItem(item: Item);
    updateItem(data: any);
    getItem(id: ItemId);
}

export interface Item {
    children: ItemId[];
    fields: any;
}

export type ItemId = string;
