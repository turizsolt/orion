import * as jwt from 'jsonwebtoken';

export const login = (req, res, config):void => {
    try {
        if(!req.body.username) throw 'missing props';
        if(!req.body.password) throw 'missing props';

        if(!config.users) throw 'config error';

        const username = req.body.username;
        if(config.users[username] !== req.body.password) throw 'authentication failed';

        var token = jwt.sign({ username }, config.jwtSecret, { expiresIn: '90 days' });

        res.send({ token });
    } catch(e) {
        res.send({ error: e });
    }
};
