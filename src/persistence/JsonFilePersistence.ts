// tslint:disable: no-var-requires
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const httpErrors = require('http-errors');
const adapter = new FileSync('db.json');
const db = low(adapter);
import { injectable } from 'inversify';

db.defaults({ vote: [], election: [] }).write();

@injectable()
export class JsonFilePersistence {
    public save<Record>(collectionName: string, record: Record): void {
        db.get(collectionName)
            .push(record)
            .write();
    }

    public getAll<Record>(collectionName: string): Record[] {
        return db.get(collectionName).value();
    }

    public getOne<Record>(collectionName: string, id: string): Record {
        const one = db
            .get(collectionName)
            .find({ id })
            .value();

        if (one === undefined) {
            // todo this throw really should not depend on http
            throw new httpErrors.NotFound();
        }

        return one;
    }

    public getFiltered<Record>(collectionName: string, filter: any): Record[] {
        return db
            .get(collectionName)
            .filter(filter)
            .value();
    }
}
