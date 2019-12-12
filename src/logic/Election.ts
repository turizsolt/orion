import { Option } from "./Option";
import { Vote } from "./Vote";
import { Util } from "./Util";
import { Matrix } from "./Matrix";
import { PreferenceListToMatrix } from "./PreferenceListToMatrix";

export class Election {
    readonly votes = [];
    constructor(readonly name: string, readonly options:Option[]) {}

    addVote(vote:Vote):boolean {
        const converter = new PreferenceListToMatrix(vote.preferenceList, this.options);
        if(converter.isValid()) {
            this.votes.push(converter.getMatrix());
        }
        return converter.isValid();
    }

    getResult() {
        const pairwisePreferences = new Matrix(this.options.length);
        
        for(let vote of this.votes) {
            pairwisePreferences.add(vote);
        }

        const strongestPathes = pairwisePreferences.floydWarshall();
        
        // todo question is it possible to A < B and B = C, C = A ???
        const compare = (a, b) => strongestPathes.cells[b][a] - strongestPathes.cells[a][b];

        const order =
            Util.simplifyArray(
            Util.groupSame(compare)(
            Util.sort(compare)(
            Util.createAscendingVector(this.options.length
            ))));

        return {
            pairwisePreferences,
            strongestPathes,
            order
        };
    }
}