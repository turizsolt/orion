import { inject, injectable } from 'inversify';
import shortid = require('shortid');
import { Persistence } from '../persistence/Persistence';
import { TYPES } from '../types';
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

@injectable()
export class ActualBusiness implements Business {
    @inject(TYPES.Persistence) private persistence: Persistence;

    public getElectionVoteCount(id: string): number {
        const votes = this.persistence.getFiltered<VoteDTO>('vote', {
            electionId: id,
        });

        return votes.length;
    }

    public getElection(id: string): Election {
        const election = this.persistence.getOne<Election>('election', id);
        return election;
    }

    public createElection(name: string, options: string[]): Election {
        const election = {
            name,
            options: options.map(op => ({ name: op })),
            id: shortid.generate(),
        };

        this.persistence.save<Election>('election', election);

        return election;
    }

    public addVoteToElection(id: string, vote: VoteInput): boolean {
        const election = this.persistence.getOne<Election>('election', id);
        const converter = new PreferenceListToMatrix(
            vote.preferenceList,
            election.options,
        );

        if (converter.isValid()) {
            this.persistence.save<VoteDTO>('vote', {
                ...vote,
                electionId: id,
                id: shortid.generate(),
                createdAt: new Date(),
            });
        }
        return converter.isValid();
    }

    public getElectionResult(id: string): ElectionResult {
        const election = this.persistence.getOne<Election>('election', id);
        const pairwisePreferences = new Matrix(election.options.length);

        const votes = this.persistence.getFiltered<VoteDTO>('vote', {
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
