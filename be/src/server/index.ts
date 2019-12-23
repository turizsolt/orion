import * as express from "express";
import { Option } from "../logic/Option";
import { Election } from "../logic/Election";
import * as bodyParser from "body-parser";
import { Vote } from "../logic/Vote";
import * as fs from "fs";
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
for(let pizza of pizzas) {
    options.push(new Option(pizza));
}
const name = 'pizza';
const election = new Election(name, options);

app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Hello world!");
});

app.get("/election/:id", (req, res) => {
    res.send({
        name: election.name,
        options: election.options.map(option => option.name)
    });
});

app.post("/election/:id/vote", (req, res) => {
    const vote = new Vote(req.body.preferenceList, req.body.name);
    election.addVote(vote);
    console.log(req.body);
    if(!fs.existsSync('votes'))fs.mkdirSync('votes');
    fs.writeFileSync("votes/"+(new Date()).toISOString()+"."+(Math.random()*9000|0+1000)+".txt", JSON.stringify(vote), 'utf-8');
    res.sendStatus(200);
});

app.get("/election/:id/result", (req, res) => {
    res.send(election.getResult());
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${ port }`);
});
