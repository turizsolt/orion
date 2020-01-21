export interface Business {
    createItem(item: Item);
    getItem(id: ItemId);
}

export interface Item {
    title: string;
    children: ItemId[];
}

export type ItemId = string;
