import axios, { AxiosError } from 'axios';
import { expect } from 'chai';
import * as fs from 'fs';
import { step } from 'mocha-steps';

import { Server } from '../../src/server/Server';
import { TYPES } from '../../src/types';
import { isolatedContainer } from '../inversify.config';

const configText = fs.readFileSync(process.cwd() + '/config.json', 'utf8');
const config = JSON.parse(configText);
const uriPerfix = `${config.testServerAddress}:${config.testServerPort}`;
const adminKey = config.adminKey;

describe('Server API', () => {
    let id: string;
    let server: Server;

    before(async () => {
        server = isolatedContainer.get<Server>(TYPES.Server);
        server.start(8901);
    });

    step('get hello', async () => {
        const response = await axios.get(`${uriPerfix}/`);
        expect(response.data).deep.equals({ hello: 'world' });
    });

    step('create an election without key', async () => {
        try {
            await axios.post(`${uriPerfix}/election`, {
                name: 'test',
                options: ['a', 'b', 'c'],
            });
            expect.fail();
        } catch (e) {
            expect(e.response.status).equals(500);
            expect(e.response.data.message).equals(
                'No permissions for the operation.',
            );
        }
    });

    step('create an election with key', async () => {
        const response = await axios.post(
            `${uriPerfix}/election?key=${adminKey}`,
            {
                name: 'test',
                options: ['a', 'b', 'c'],
            },
        );
        id = response.data.id;
        expect(id).not.equals(undefined);
    });

    step('get that election', async () => {
        const response = await axios.get(`${uriPerfix}/election/${id}`);
        const election = response.data;
        expect(election.name).equals('test');
        expect(election.options).deep.equals(['a', 'b', 'c']);
        expect(election.open).equals(true);
        expect(new Date(election.createdAt)).lte(new Date());
    });

    step('cast a vote', async () => {
        const response = await axios.post(`${uriPerfix}/election/${id}/vote`, {
            name: 'tester',
            preferenceList: [2, 1, 0],
        });
        expect(response.data).equals(true);
    });

    step('close an election without key', async () => {
        try {
            await axios.post(`${uriPerfix}/election/${id}/close`, {});
            expect.fail();
        } catch (e) {
            expect(e.response.status).equals(500);
            expect(e.response.data.message).equals(
                'No permissions for the operation.',
            );
        }
    });

    step('get election result without key', async () => {
        try {
            await axios.get(`${uriPerfix}/election/${id}/result`);
            expect.fail();
        } catch (e) {
            expect(e.response.status).equals(500);
            expect(e.response.data.message).equals(
                'No permissions for the operation.',
            );
        }
    });

    step('get election result with key', async () => {
        const response = await axios.get(
            `${uriPerfix}/election/${id}/result?key=${adminKey}`,
        );
        const electionResult = response.data;

        expect(electionResult.order).deep.equals([2, 1, 0]);
    });

    step('close an election', async () => {
        const response = await axios.post(
            `${uriPerfix}/election/${id}/close?key=${adminKey}`,
            {},
        );
        expect(response.data).equals(true);
    });

    step('get election result after its closed', async () => {
        const response = await axios.get(`${uriPerfix}/election/${id}/result`);
        const electionResult = response.data;

        expect(electionResult.order).deep.equals([2, 1, 0]);
    });

    after(async () => {
        server.stop();
    });
});
