import * as fs from 'fs';

export let config = {
    adminKey: '',
    testServerAddress: 'http://127.0.0.1',
    testServerPort: 9865,
    port: 9865,
};
if (fs.existsSync(__dirname + '/config.json')) {
    const configText = fs.readFileSync(__dirname + '/config.json', 'utf8');
    config = JSON.parse(configText);
}
