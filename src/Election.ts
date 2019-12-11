import { Option } from "./Option";
import { Vote } from "./Vote";

export class Election {
    readonly votes = [];
    constructor(readonly name: string, readonly options:Option[]) {}

    addVote(vote:Vote):boolean {
        let used = [];
        let matrix = [];
        for(let i in this.options) {
            used.push(0);
            let row = [];
            for(let j in this.options) {
                row.push(0);
            }
            matrix.push(row);
        }
        for(let preferenceLevel of vote.preferenceList) {
            if(typeof preferenceLevel === "object") {
                for(let idx of preferenceLevel) {
                    if(used[idx] === 1) return false;
                    used[idx] = 1;
                }
            } else {
                if(used[preferenceLevel] === 1) return false;
                used[preferenceLevel] = 1;
            }
            
            if(typeof preferenceLevel === "object") {
                for(let idx of preferenceLevel) {
                    for(let i in this.options) {
                        if(matrix[idx] === undefined) return false;
                        matrix[idx][i] = used[i] === 0 ? 1 : 0;
                    }
                }
            } else {
                for(let i in this.options) {
                    if(matrix[preferenceLevel] === undefined) return false;
                    matrix[preferenceLevel][i] = used[i] === 0 ? 1 : 0;
                }
            }
        }

        for(let i in this.options) {
            if(used[i] === 0) return false;
        }

        this.votes.push(matrix);
        return true;
    }

    getResult() {
        // sum the votes
        let d = [], p = [];
        for(let i in this.options) {
            let row = [];
            let prow = [];
            for(let j in this.options) {
                row.push(0);
                prow.push(0);
            }
            d.push(row);
            p.push(prow);
        }

        for(let vote of this.votes) {
            for(let i in this.options) {
                for(let j in this.options) {
                    d[i][j] += vote[i][j];
                }
            }
        }

        // todo Condorcet, Schultz

        for(let i in this.options) {
            for(let j in this.options) {
                if (i !== j) {
                    if (d[i][j] > d[j][i]) {
                        p[i][j] = d[i][j]
                    } else {
                        p[i][j] = 0;
                    }
                }
            }
        }

        for(let i in this.options) {
            for(let j in this.options) {
                if (i !== j) {
                    for(let k in this.options) {
                        if (i !== k && j !== k) {
                            p[j][k] = Math.max(p[j][k], Math.min(p[j][i], p[i][k]));
                        }
                    }
                }
            }
        }

        const o = [];
        for(let i in this.options) {
            o.push(parseInt(i, 10));
        }

        o.sort((a, b) => {
            if(p[a][b] < p[b][a]) return 1;
            if(p[a][b] > p[b][a]) return -1;
            return 0;            
        });

        const o2 = [];
        let eq = o[0];
        let eql = [o[0]];
        for(let i=1; i<o.length; i++) {
            if(p[o[i]][eq] === p[eq][o[i]]) {
                eql.push(o[i]);
            } else {
                o2.push(eql);
                eq = o[i];
                eql = [o[i]];
            }
        }
        o2.push(eql);
        const o3 = o2.map(el => {
            if(el.length === 1) {
                return el[0];
            } else {
                el.sort((a, b) => {return a-b;});
                return el;
            }
        });

        return {d, p, o: o3};
    }
}