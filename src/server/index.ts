import * as fastify from 'fastify';
import * as fs from 'fs';
import { AddressInfo } from 'net';
import { runContainer } from '../inversify.config';
import { Business } from '../logic/Business';
import { TYPES } from '../types';

const business = runContainer.get<Business>(TYPES.Business);

const app = fastify({ logger: true });

app.get('/', async () => {
    return { hello: 'world' };
});

interface Config {
    adminKey: string;
}

const configText = fs.readFileSync(process.cwd() + '/config.json', 'utf8');
const config: Config = JSON.parse(configText);

const adminBarrier = (request: fastify.FastifyRequest) => {
    const { key } = request.query;
    if (key !== config.adminKey) {
        throw new Error('No permissions for the operation.');
    }
};

const postSchema = {
    body: {
        type: 'object',
        required: ['preferenceList', 'name'],
        properties: {
            preferenceList: {
                type: 'array',
                items: {
                    oneOf: [
                        { type: 'array', items: { type: 'integer' } },
                        { type: 'integer' },
                    ],
                },
            },
            name: { type: 'string' },
        },
    },
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
};

const postElectionSchema = {
    body: {
        type: 'object',
        required: ['options', 'name'],
        properties: {
            options: {
                type: 'array',
                items: { type: 'string' },
            },
            name: { type: 'string' },
        },
    },
};

const idSchema = {
    params: {
        type: 'object',
        required: ['id'],
        properties: {
            id: { type: 'string' },
        },
    },
};

app.get('/election/:id', { schema: idSchema }, async request => {
    const { id } = request.params;
    const election = business.getElection(id);
    return {
        ...election,
        options: election.options.map(x => x.name),
    };
});

app.get('/election/:id/result', { schema: idSchema }, async request => {
    const { id } = request.params;
    const election = business.getElection(id);
    if (election.open) {
        adminBarrier(request);
    }
    const electionResult = business.getElectionResult(id);
    return electionResult;
});

app.post('/election/:id/vote', { schema: postSchema }, async request => {
    const { preferenceList, name } = request.body;
    const id = request.params.id;
    business.addVoteToElection(id, { preferenceList, name });
    return true;
});

app.post('/election/:id/close', { schema: idSchema }, async request => {
    adminBarrier(request);

    const id = request.params.id;
    business.closeElection(id);
    return true;
});

app.post('/election', { schema: postElectionSchema }, async request => {
    adminBarrier(request);

    const { options, name } = request.body;
    business.createElection(name, options);
    return true;
});

const start = async () => {
    try {
        await app.listen(8901);
        const address = app.server.address() as AddressInfo;
        app.log.info(`server listening on ${address.port}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};
start();
