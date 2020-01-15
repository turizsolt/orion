import * as fastify from 'fastify';
import * as fastifyCors from 'fastify-cors';
import { inject, injectable } from 'inversify';
import { AddressInfo } from 'net';
import { config } from '../../Config';
import { Business } from '../logic/Business';
import { TYPES } from '../types';
import { Server } from './Server';

@injectable()
export class ActualServer implements Server {
    private app: fastify.FastifyInstance;
    @inject(TYPES.Business) private business: Business;

    constructor() {
        this.app = fastify({ logger: true });

        this.app.register(fastifyCors, {});

        this.app.get('/', async () => {
            return { hello: 'world' };
        });

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

        this.app.get('/election/:id', { schema: idSchema }, async request => {
            const { id } = request.params;
            const election = this.business.getElection(id);
            return {
                ...election,
                options: election.options.map(x => x.name),
            };
        });

        this.app.get(
            '/election/:id/result',
            { schema: idSchema },
            async request => {
                const { id } = request.params;
                const election = this.business.getElection(id);
                if (election.open) {
                    adminBarrier(request);
                }
                const electionResult = this.business.getElectionResult(id);
                return electionResult;
            },
        );

        this.app.post(
            '/election/:id/vote',
            { schema: postSchema },
            async request => {
                const { preferenceList, name } = request.body;
                const id = request.params.id;
                this.business.addVoteToElection(id, { preferenceList, name });
                return true;
            },
        );

        this.app.post(
            '/election/:id/close',
            { schema: idSchema },
            async request => {
                adminBarrier(request);

                const id = request.params.id;
                this.business.closeElection(id);
                return true;
            },
        );

        this.app.post(
            '/election',
            { schema: postElectionSchema },
            async request => {
                adminBarrier(request);

                const { options, name } = request.body;
                const election = this.business.createElection(name, options);
                return election;
            },
        );
    }

    public start = async (port: number) => {
        try {
            await this.app.listen(port);
            const address = this.app.server.address() as AddressInfo;
            this.app.log.info(`server listening on ${address.port}`);
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    };

    public stop = async () => {
        try {
            await this.app.server.close();
        } catch (err) {
            this.app.log.error(err);
            process.exit(1);
        }
    };
}
