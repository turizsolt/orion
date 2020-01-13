// tslint:disable: no-var-requires
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const httpErrors = require('http-errors');

const adapter = new FileSync('db.json');
const db = low(adapter);
db.defaults({ vote: [], election: [] }).write();

export class Persistence {
    public static save(collectionName: string, record: any) {
        db.get(collectionName)
            .push(record)
            .write();
    }

    public static getAll(collectionName: string) {
        return db.get(collectionName).value();
    }

    public static getOne(collectionName: string, id: string) {
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

    public static getFiltered(collectionName: string, filter: any) {
        return db
            .get(collectionName)
            .filter(filter)
            .value();
    }
}
