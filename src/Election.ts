import { Option } from "./Option";
import { Vote } from "./Vote";

export class Election {
    constructor(readonly name: string, readonly options:Option[]) {}

    addVote(vote:Vote):boolean {
        return true;
    }
}