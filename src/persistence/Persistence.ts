export interface Persistence {
    save<Record>(collectionName: string, record: Record): void;
    update<Record>(collectionName: string, id: string, record: Record): void;
    getOne<Record>(collectionName: string, id: string): Record;
    getAll<Record>(collectionName: string): Record[];
    getFiltered<Record>(collectionName: string, filter: any): Record[];
    getNextId(collectionName: string): number;
}
