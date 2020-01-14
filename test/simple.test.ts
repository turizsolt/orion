import { expect } from 'chai';
import * as fetch from 'node-fetch';

import * as http from 'http';
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/json' });
    res.write('{"hello":"world"}');
    res.end();
});

server.listen(8080);

setTimeout(() => {
    server.close();
}, 60 * 1000);

describe('Localhost', () => {
    it('connect', async () => {
        const res = await fetch('http://localhost:8080/');
        const json = await res.json();
        expect(json).deep.equal({ hello: 'world' });
    });
});
