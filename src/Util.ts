import { Option } from "./Option";
import { Preference } from "./Vote";

export class Util {

    static createEmptyVector(n: number, empty:any=0) {
        const vector = [];
        for(let i=0;i<n;i++) {
            vector.push(empty);
        }
        return vector;
    }

    static createAscendingVector(n: number) {
        const vector = [];
        for(let i=0;i<n;i++) {
            vector.push(i);
        }
        return vector;
    }

    static createEmptyMatrix(n: number, m:number = n, empty:any=0) {
        let matrix = [];
        for(let i=0;i<n;i++) {
            matrix.push(Util.createEmptyVector(m, empty));
        }
        return matrix;
    }

    static doWith<T>(elementOrArray:(T | T[]), fn: ((element: T) => void)) {
        if(typeof elementOrArray === 'object') {
            for(let element of (elementOrArray as T[])) {
                fn(element);
            }
        } else {
            fn(elementOrArray);
        }
    }

    static groupSame = (compare:(a, b:any) => number) => (list:number[]) => {
        const result = [];
        let pivot = list[0];
        let current = [list[0]];
        for(let i=1; i<list.length; i++) {
            if(compare(pivot,list[i]) === 0) {
                current.push(list[i]);
            } else {
                result.push(current);
                pivot = list[i];
                current = [list[i]];
            }
        }
        result.push(current);
        return result;
    }

    static simplifyArray = (list:number[][]) => {
        return list.map(el => {
            if(el.length === 1) {
                return el[0];
            } else {
                el.sort((a, b) => a-b);
                return el;
            }
        });
    }

    static sort = (compare:(a, b:any) => number) => (list:number[]) => {
        list.sort(compare);
        return list;
    }
}
