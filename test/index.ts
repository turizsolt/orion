import { expect } from 'chai';
import { Election } from '../src/Election';
import { Option } from '../src/Option';
import { Vote } from '../src/Vote';

describe('Election', () => {
    let options:Option[];
    let name: string;
    let election:Election;

    beforeEach(() => {
        options = [];
        options.push(new Option('alma'));
        options.push(new Option('korte'));
        options.push(new Option('syilva'));
        name = 'first';
        election = new Election(name, options);
    });

    it('creating an election with options', () => {
        expect(election.name).equals(name);
        expect(election.options).deep.equals(options);
    });

    it('adding a vote', () => {
        const vote = new Vote(
            [
                [0, 1],
                2
            ]
        );
        const voteMatrix = [
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 0]
        ];

        const matrix = election.addVote(vote);

        expect(matrix).true;
        expect(election.votes[election.votes.length-1]).deep.equals(voteMatrix);
    });

    it('adding a different vote', () => {
        const vote = new Vote([0, 1, 2]);
        const voteMatrix = [
            [0, 1, 1],
            [0, 0, 1],
            [0, 0, 0]
        ];

        const matrix = election.addVote(vote);

        expect(matrix).true;
        expect(election.votes[election.votes.length-1]).deep.equals(voteMatrix);
    });

    it('adding a duoble vote', () => {
        const vote = new Vote(
            [
                0,
                [1, 0],
                2
            ]
        );
    
        const voteCount = election.votes.length;
        const matrix = election.addVote(vote);

        expect(matrix).equals(false);
        expect(election.votes.length).equals(voteCount);
    });

    it('adding a partial vote', () => {
        const vote = new Vote(
            [
                [0],
                [1]
            ]
        );
    

        const voteCount = election.votes.length;
        const matrix = election.addVote(vote);

        expect(matrix).equals(false);
        expect(election.votes.length).equals(voteCount);
    });

    it('adding an invalid number vote', () => {
        const vote = new Vote(
            [
                [7]
            ]
        );
    

        const voteCount = election.votes.length;
        const matrix = election.addVote(vote);

        expect(matrix).equals(false);
        expect(election.votes.length).equals(voteCount);
    });

    it('adding an invalid string vote', () => {
        const vote = new Vote(
            [
                JSON.parse('["b"]')
            ]
        );
    

        const voteCount = election.votes.length;
        const matrix = election.addVote(vote);

        expect(matrix).equals(false);
        expect(election.votes.length).equals(voteCount);
    });
});

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
        for(let i=0; i<5; i++) election.addVote(new Vote([0, 2, 1, 4, 3]));
        for(let i=0; i<5; i++) election.addVote(new Vote([0, 3, 4, 2, 1]));
        for(let i=0; i<8; i++) election.addVote(new Vote([1, 4, 3, 0, 2]));
        for(let i=0; i<3; i++) election.addVote(new Vote([2, 0, 1, 4, 3]));
        for(let i=0; i<7; i++) election.addVote(new Vote([2, 0, 4, 1, 3]));
        for(let i=0; i<2; i++) election.addVote(new Vote([2, 1, 0, 3, 4]));
        for(let i=0; i<7; i++) election.addVote(new Vote([3, 2, 4, 1, 0]));
        for(let i=0; i<8; i++) election.addVote(new Vote([4, 1, 0, 3, 2]));
        
        expect(election.votes.length).equals(45);

        const d = [
            [ 0, 20, 26, 30, 22 ],
            [ 25, 0, 16, 33, 18 ],
            [ 19, 29, 0, 17, 24 ],
            [ 15, 12, 28, 0, 14 ],
            [ 23, 27, 21, 31, 0 ]
        ];
        const p = [
            [ 0, 28, 28, 30, 24 ],
            [ 25, 0, 28, 33, 24 ],
            [ 25, 29, 0, 29, 24 ],
            [ 25, 28, 28, 0, 24 ],
            [ 25, 28, 28, 31, 0 ]
        ];

        const o = [4, 0, 2, 1, 3];

        const result = election.getResult();
        expect(result.d).deep.equals(d);
        expect(result.p).deep.equals(p);
        expect(result.o).deep.equals(o);
    });

    it('get results, equal case', () => {
        election.addVote(new Vote([0, 1, [2, 3], 4]));
        
        expect(election.votes.length).equals(1);

        const d = [
            [ 0, 1, 1, 1, 1 ],
            [ 0, 0, 1, 1, 1 ],
            [ 0, 0, 0, 0, 1 ],
            [ 0, 0, 0, 0, 1 ],
            [ 0, 0, 0, 0, 0 ]
        ];

        const o = [0, 1, [2, 3], 4];

        const result = election.getResult();
        expect(result.d).deep.equals(d);
        expect(result.p).deep.equals(d);
        expect(result.o).deep.equals(o);
    });
});
