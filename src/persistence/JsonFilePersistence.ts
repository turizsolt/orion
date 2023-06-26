// tslint:disable: no-var-requires
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(__dirname + '/db.json');
const db = low(adapter);
import { injectable } from 'inversify';
import { Persistence } from './Persistence';

db.defaults({ item: [], transaction: [] }).write();

@injectable()
export class JsonFilePersistence implements Persistence {
    public update<Record>(
        collectionName: string,
        id: string,
        record: Record,
    ): void {
        const one = this.getOne<Record>(collectionName, id);
        if (one) {
            db.get(collectionName)
                .find({ id })
                .assign(record)
                .write();
        } else {
            this.save<Record>(collectionName, record);
        }
    }

    public save<Record>(collectionName: string, record: Record): void {
        db.get(collectionName)
            .push(record)
            .write();
    }

    public getAll<Record>(collectionName: string): Record[] {
        return db.get(collectionName).value();
    }

    public getOne<Record>(collectionName: string, id: string): Record {
        return db
            .get(collectionName)
            .find({ id })
            .value();
    }

    public getFiltered<Record>(collectionName: string, filter: any): Record[] {
        return db
            .get(collectionName)
            .filter(filter)
            .value();
    }

    public getNextId(collectionName: string): number {
        return db.get(collectionName).value().length;
    }
}
