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
