import { injectable } from 'inversify';
import { Id, IdGenerator } from './IdGenerator';

let counter = 0;
const counterOverflow = 0x1000;

@injectable()
export class ActualIdGenerator implements IdGenerator {
    public generate(): Id {
        const millisec = new Date().getTime();
        const user = 0;
        const device = 0;

        counter += 0xb57;
        if (counter >= counterOverflow) {
            counter -= counterOverflow;
        }

        return (
            counter.toString(16).padStart(3, '0') +
            '' +
            rev(millisec.toString(16).padStart(11, '0')) +
            '' +
            device.toString(16) +
            '' +
            user.toString(16)
        );
    }
}

function rev(str: string): string {
    return str
        .split('')
        .reverse()
        .join('');
}
