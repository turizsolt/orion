import { Matrix } from './Matrix';
import { Option } from './Option';
import { PreferenceListToMatrix } from './PreferenceListToMatrix';
import { Util } from './Util';
import { Vote } from './Vote';

export class Election {
    public readonly votes = [];
    constructor(readonly name: string, readonly options: Option[]) {}

    public addVote(vote: Vote): boolean {
        const converter = new PreferenceListToMatrix(
            vote.preferenceList,
            this.options,
        );
        if (converter.isValid()) {
            this.votes.push(converter.getMatrix());
        }
        return converter.isValid();
    }

    public getResult() {
        const pairwisePreferences = new Matrix(this.options.length);

        for (const vote of this.votes) {
            pairwisePreferences.add(vote);
        }

        const strongestPathes = pairwisePreferences.floydWarshall();

        const total = [];
        for (let i = 0; i < strongestPathes.n; i++) {
            let c = 0;
            for (let j = 0; j < strongestPathes.n; j++) {
                c =
                    strongestPathes.cells[i][j] > strongestPathes.cells[j][i]
                        ? c + 1
                        : c;
            }
            total.push(c);
        }

        const compare = (a, b) => total[b] - total[a];

        const order = Util.simplifyArray(
            Util.groupSame(compare)(
                Util.sort(compare)(
                    Util.createAscendingVector(this.options.length),
                ),
            ),
        );

        return {
            pairwisePreferences,
            strongestPathes,
            order,
            total: order.map(x => {
                if (typeof x === 'object') {
                    return x.map(y => total[y]);
                } else {
                    return total[x];
                }
            }),
        };
    }
}
