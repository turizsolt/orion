import { expect } from 'chai';
import { ActualBusiness } from '../../src/logic/ActualBusiness';
import { PreferenceListToMatrix } from '../../src/logic/PreferenceListToMatrix';

const business = new ActualBusiness();

describe('Election', () => {
    const optionList = ['cheese', 'tomato', 'oregano'];
    const options = optionList.map(op => ({
        name: op,
    }));

    it('creating an election with options', () => {
        const name = 'pizza';

        const election = business.createElection(name, optionList);

        expect(election.name).equals(name);
        expect(election.options).deep.equals(options);
        // tslint:disable-next-line: no-unused-expression
        expect(election.id).exist;

        const storedElection = business.getElection(election.id);

        expect(storedElection).equals(election);
    });

    it('adding a vote', () => {
        const preferenceList = [[0, 1], 2];
        const voteMatrix = [
            [0, 0, 1],
            [0, 0, 1],
            [0, 0, 0],
        ];

        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.getMatrix()).deep.equals(voteMatrix);
    });

    it('adding a different vote', () => {
        const preferenceList = [0, 1, 2];
        const voteMatrix = [
            [0, 1, 1],
            [0, 0, 1],
            [0, 0, 0],
        ];

        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.getMatrix()).deep.equals(voteMatrix);
    });

    it('adding a duoble vote', () => {
        const preferenceList = [0, [1, 0], 2];
        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.isValid()).equals(false);
    });

    it('adding a partial vote', () => {
        const preferenceList = [[0], [1]];
        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.isValid()).equals(false);
    });

    it('adding an invalid number vote', () => {
        const preferenceList = [[7]];
        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.isValid()).equals(false);
    });

    it('adding an invalid string vote', () => {
        const preferenceList = [JSON.parse('["b"]')];
        const converted = new PreferenceListToMatrix(preferenceList, options);
        expect(converted.isValid()).equals(false);
    });
});
