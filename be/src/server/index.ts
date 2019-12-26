import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as fs from 'fs';
import { Election } from '../logic/Election';
import { Option } from '../logic/Option';
import { Vote } from '../logic/Vote';
const app = express();
const port = 8901;

const pizzas = [
    'szalámi',
    'sonka',
    'kolbász',
    'császárszalonna',
    'tonhal',
    'csirkehús',
    'tojás',
    'paprika',
    'csipős paprika',
    'paradicsom',
    'vöröshagyma',
    'lilahagyma',
    'fokhagyma',
    'póréhagyma',
    'bab',
    'borsó',
    'fekete olajbogyó',
    'zöld olajbogyó',
    'articsóka',
    'kukorica',
    'gomba',
    'rukkola',
    'brokkoli',
    'spenót',
    'oregánó',
    'bazsalikom',
    'banán',
    'ananász',
    'trappista',
    'mozzarella',
    'kéksajt',
    'camembert',
];

const options = [];
for (const pizza of pizzas) {
    options.push(new Option(pizza));
}
const name = 'pizza';
const election = new Election(name, options);

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello world!');
});

app.get('/election/:id', (req, res) => {
    res.send({
        name: election.name,
        options: election.options.map(option => option.name),
    });
});

app.post('/election/:id/vote', (req, res) => {
    const vote = new Vote(req.body.preferenceList, req.body.name);
    election.addVote(vote);
    if (!fs.existsSync('votes')) {
        fs.mkdirSync('votes');
    }
    fs.writeFileSync(
        'votes/' +
            new Date().toISOString() +
            '.' +
            (Math.floor(Math.random() * 9000) + 1000) +
            '.txt',
        JSON.stringify(vote),
        'utf-8',
    );
    res.sendStatus(200);
});

app.get('/election/:id/result', (req, res) => {
    res.send(election.getResult());
});

app.listen(port, () => {
    // tslint:disable-next-line: no-console
    console.log(`Server started at http://localhost:${port}`);
});
