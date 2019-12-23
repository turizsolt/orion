import { Util } from "./Util";

export class Matrix {
    public cells = [];

    constructor(readonly n: number, readonly m:number = n) {
        this.cells = [];
        for(let i=0;i<n;i++) {
            this.cells.push(Util.createEmptyVector(m, 0));
        }
    }

    add(m: Matrix) {
        for(let i=0; i<this.n; i++) {
            for(let j=0; j<this.m; j++) {
                this.cells[i][j] += m[i][j];
            }
        }        
    }

    floydWarshall() {
        const p = new Matrix(this.n);

        for(let i=0; i<this.n; i++) {
            for(let j=0; j<this.n; j++) {
                if (i !== j) {
                    if (this.cells[i][j] > this.cells[j][i]) {
                        p.cells[i][j] = this.cells[i][j]
                    } else {
                        p.cells[i][j] = 0;
                    }
                }
            }
        }

        for(let i=0; i<this.n; i++) {
            for(let j=0; j<this.n; j++) {
                if (i !== j) {
                    for(let k=0; k<this.n; k++) {
                        if (i !== k && j !== k) {
                            p.cells[j][k] = Math.max(p.cells[j][k], Math.min(p.cells[j][i], p.cells[i][k]));
                        }
                    }
                }
            }
        }

        return p;
    }
}
