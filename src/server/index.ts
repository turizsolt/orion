import * as express from "express";
import { Option } from "../logic/Option";
import { Election } from "../logic/Election";
import * as bodyParser from "body-parser";
import { Vote } from "../logic/Vote";
const app = express();
const port = 8080;

const options = [];
options.push(new Option('alma'));
options.push(new Option('korte'));
options.push(new Option('szilva'));
const name = 'first';
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
    election.addVote(new Vote(req.body));
    res.sendStatus(200);
});

app.get("/election/:id/result", (req, res) => {
    res.send(election.getResult());
});

app.listen(port, () => {
    console.log(`Server started at http://localhost:${ port }`);
});
