import { expect } from 'chai';
import { ActualBusiness } from '../../src/logic/ActualBusiness';
import { Election } from '../../src/logic/Business';

const business = new ActualBusiness();

describe('results', () => {
    let election: Election;
    const optionList = ['A', 'B', 'C', 'D', 'E'];
    const name = 'testElection';

    beforeEach(() => {
        election = business.createElection(name, optionList);
    });

    it('get results, general case', () => {
        // Data from here: https://en.wikipedia.org/wiki/Schulze_method#Example
        for (let i = 0; i < 5; i++) {
            business.addVoteToElection(election.id, {
                name: 'H' + i,
                preferenceList: [0, 2, 1, 4, 3],
            });
        }
        for (let i = 0; i < 5; i++) {
            business.addVoteToElection(election.id, {
                name: 'I' + i,
                preferenceList: [0, 3, 4, 2, 1],
            });
        }
        for (let i = 0; i < 8; i++) {
            business.addVoteToElection(election.id, {
                name: 'J' + i,
                preferenceList: [1, 4, 3, 0, 2],
            });
        }
        for (let i = 0; i < 3; i++) {
            business.addVoteToElection(election.id, {
                name: 'K' + i,
                preferenceList: [2, 0, 1, 4, 3],
            });
        }
        for (let i = 0; i < 7; i++) {
            business.addVoteToElection(election.id, {
                name: 'L' + i,
                preferenceList: [2, 0, 4, 1, 3],
            });
        }
        for (let i = 0; i < 2; i++) {
            business.addVoteToElection(election.id, {
                name: 'M' + i,
                preferenceList: [2, 1, 0, 3, 4],
            });
        }
        for (let i = 0; i < 7; i++) {
            business.addVoteToElection(election.id, {
                name: 'N' + i,
                preferenceList: [3, 2, 4, 1, 0],
            });
        }
        for (let i = 0; i < 8; i++) {
            business.addVoteToElection(election.id, {
                name: 'O' + i,
                preferenceList: [4, 1, 0, 3, 2],
            });
        }

        expect(business.getElectionVoteCount(election.id)).equals(45);

        const pairwise = [
            [0, 20, 26, 30, 22],
            [25, 0, 16, 33, 18],
            [19, 29, 0, 17, 24],
            [15, 12, 28, 0, 14],
            [23, 27, 21, 31, 0],
        ];
        const pathes = [
            [0, 28, 28, 30, 24],
            [25, 0, 28, 33, 24],
            [25, 29, 0, 29, 24],
            [25, 28, 28, 0, 24],
            [25, 28, 28, 31, 0],
        ];

        const order = [4, 0, 2, 1, 3];

        const result = business.getElectionResult(election.id);
        expect(result.pairwisePreferences.cells).deep.equals(pairwise);
        expect(result.strongestPathes.cells).deep.equals(pathes);
        expect(result.order).deep.equals(order);
    });

    it('get results, equal case', () => {
        business.addVoteToElection(election.id, {
            name: 'X',
            preferenceList: [0, 1, [2, 3], 4],
        });

        expect(business.getElectionVoteCount(election.id)).equals(1);

        const pairwise = [
            [0, 1, 1, 1, 1],
            [0, 0, 1, 1, 1],
            [0, 0, 0, 0, 1],
            [0, 0, 0, 0, 1],
            [0, 0, 0, 0, 0],
        ];

        const order = [0, 1, [2, 3], 4];

        const result = business.getElectionResult(election.id);
        expect(result.pairwisePreferences.cells).deep.equals(pairwise);
        expect(result.strongestPathes.cells).deep.equals(pairwise);
        expect(result.order).deep.equals(order);
    });
});
