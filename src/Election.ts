import { Option } from "./Option";
import { Vote } from "./Vote";
import { Util } from "./Util";
import { Matrix } from "./Matrix";

export class Election {
    readonly votes = [];
    constructor(readonly name: string, readonly options:Option[]) {}

    addVote(vote:Vote):boolean {
        const matrix = Util.preferenceListToMatrix(vote.preferenceList, this.options);
        if(matrix) {
            this.votes.push(matrix);
        }
        return !!matrix;
    }

    getResult() {
        const pairwisePreferences = new Matrix(this.options.length);
        
        for(let vote of this.votes) {
            pairwisePreferences.add(vote);
        }

        const strongestPathes = pairwisePreferences.floydWarshall();
        
        // todo question is it possible to A < B and B = C, C = A ???
        const compare = (a, b) => strongestPathes.cells[b][a] - strongestPathes.cells[a][b];

        const order = Util.simplifyArray(
            Util.groupSame(
                Util.sort(
                    Util.createAscendingVector(this.options.length),
                    compare
                ),
                compare
            )
        );

        return {
            pairwisePreferences,
            strongestPathes,
            order
        };
    }
}