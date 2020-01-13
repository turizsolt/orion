import shortid = require('shortid');
import { ActualPersistence } from '../persistence/ActualPersistence';
import { Persistence } from '../persistence/Persistence';
import {
    Business,
    Election,
    ElectionResult,
    VoteDTO,
    VoteInput,
} from './Business';
import { Matrix } from './Matrix';
import { PreferenceListToMatrix } from './PreferenceListToMatrix';
import { Util } from './Util';

const persistence: Persistence = new ActualPersistence();

export class ActualBusiness implements Business {
    public getElection(id: string): Election {
        const election = persistence.getOne<Election>('election', id);
        return election;
    }

    public addVoteToElection(id: string, vote: VoteInput): boolean {
        const election = persistence.getOne<Election>('election', id);
        const converter = new PreferenceListToMatrix(
            vote.preferenceList,
            election.options,
        );

        if (converter.isValid()) {
            persistence.save<VoteDTO>('vote', {
                ...vote,
                electionId: id,
                id: shortid.generate(),
            });
        }
        return converter.isValid();
    }

    public getElectionResult(id: string): ElectionResult {
        const election = persistence.getOne<Election>('election', id);
        const pairwisePreferences = new Matrix(election.options.length);

        const votes = persistence.getFiltered<VoteDTO>('vote', {
            electionId: id,
        });

        for (const vote of votes) {
            const converter = new PreferenceListToMatrix(
                vote.preferenceList,
                election.options,
            );

            pairwisePreferences.add(converter.getMatrix());
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
                    Util.createAscendingVector(election.options.length),
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
