export interface Business {
    createItem(item: any);
    createRelation(data: any);
    updateItem(data: any);
    getItem(id: ItemId);
    getAllItem();
}

export interface Item {
    children: ItemId[];
    fields: any;
}

export type ItemId = string;
