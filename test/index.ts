import { expect } from 'chai';
import { Election } from '../src/Election';
import { Option } from '../src/Option';
import { Vote } from '../src/Vote';

describe('Election', () => {
    let options:Option[];
    let name: string;
    let election:Election;

    before(() => {
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
                ['alma', 'korte'],
                ['syilva']
            ]
        );
        const valid = election.addVote(vote);

        expect(valid).true;
    });
});
