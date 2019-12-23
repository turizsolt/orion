import { expect } from 'chai';
import { Election } from '../../src/logic/Election';
import { Option } from '../../src/logic/Option';
import { Vote } from '../../src/logic/Vote';

describe('results', () => {
    let options:Option[];
    let name: string;
    let election:Election;

    beforeEach(() => {
        options = [];
        options.push(new Option('A'));
        options.push(new Option('B'));
        options.push(new Option('C'));
        options.push(new Option('D'));
        options.push(new Option('E'));
        name = 'second';
        election = new Election(name, options);
    });

    it('get results, general case', () => {
        // Data from here: https://en.wikipedia.org/wiki/Schulze_method#Example
        for(let i=0; i<5; i++) election.addVote(new Vote([0, 2, 1, 4, 3]));
        for(let i=0; i<5; i++) election.addVote(new Vote([0, 3, 4, 2, 1]));
        for(let i=0; i<8; i++) election.addVote(new Vote([1, 4, 3, 0, 2]));
        for(let i=0; i<3; i++) election.addVote(new Vote([2, 0, 1, 4, 3]));
        for(let i=0; i<7; i++) election.addVote(new Vote([2, 0, 4, 1, 3]));
        for(let i=0; i<2; i++) election.addVote(new Vote([2, 1, 0, 3, 4]));
        for(let i=0; i<7; i++) election.addVote(new Vote([3, 2, 4, 1, 0]));
        for(let i=0; i<8; i++) election.addVote(new Vote([4, 1, 0, 3, 2]));
        
        expect(election.votes.length).equals(45);

        const pairwise = [
            [ 0, 20, 26, 30, 22 ],
            [ 25, 0, 16, 33, 18 ],
            [ 19, 29, 0, 17, 24 ],
            [ 15, 12, 28, 0, 14 ],
            [ 23, 27, 21, 31, 0 ]
        ];
        const pathes = [
            [ 0, 28, 28, 30, 24 ],
            [ 25, 0, 28, 33, 24 ],
            [ 25, 29, 0, 29, 24 ],
            [ 25, 28, 28, 0, 24 ],
            [ 25, 28, 28, 31, 0 ]
        ];

        const order = [4, 0, 2, 1, 3];

        const result = election.getResult();
        expect(result.pairwisePreferences.cells).deep.equals(pairwise);
        expect(result.strongestPathes.cells).deep.equals(pathes);
        expect(result.order).deep.equals(order);
    });

    it('get results, equal case', () => {
        election.addVote(new Vote([0, 1, [2, 3], 4]));
        
        expect(election.votes.length).equals(1);

        const pairwise = [
            [ 0, 1, 1, 1, 1 ],
            [ 0, 0, 1, 1, 1 ],
            [ 0, 0, 0, 0, 1 ],
            [ 0, 0, 0, 0, 1 ],
            [ 0, 0, 0, 0, 0 ]
        ];

        const order = [0, 1, [2, 3], 4];

        const result = election.getResult();
        expect(result.pairwisePreferences.cells).deep.equals(pairwise);
        expect(result.strongestPathes.cells).deep.equals(pairwise);
        expect(result.order).deep.equals(order);
    });
});
