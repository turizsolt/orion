import { expect } from 'chai';
import * as fetch from 'node-fetch';

/*
import * as http from 'http';
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write('{"hello":"world"}');
    res.end();
});

server.listen(8080);
*/

// tslint:disable-next-line: no-var-requires
const fastify = require('fastify')({ logger: true });
fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});

const start = async () => {
    try {
        await fastify.listen(8080);
        fastify.log.info(
            `server listening on ${fastify.server.address().port}`,
        );
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
start();

setTimeout(() => {
    // server.close();
    fastify.close();
}, 60 * 1000);

describe('Localhost', () => {
    it('connect', async () => {
        const res = await fetch('http://localhost:8080/');
        const json = await res.json();
        expect(json).deep.equal({ hello: 'world' });
    });
});
