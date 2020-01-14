import * as fs from 'fs';

export let config = {
    adminKey: '',
    testServerAddress: 'http://127.0.0.1',
    testServerPort: 3000,
    port: 3000,
};
if (fs.existsSync(process.cwd() + '/config.json')) {
    const configText = fs.readFileSync(process.cwd() + '/config.json', 'utf8');
    config = JSON.parse(configText);
}
