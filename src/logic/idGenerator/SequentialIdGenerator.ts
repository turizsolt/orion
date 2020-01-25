import { Id, IdGenerator } from './IdGenerator';

let counter = 0;

export class SequentialIdGenerator implements IdGenerator {
    public generate(): Id {
        counter++;
        return counter.toString(16);
    }
}
