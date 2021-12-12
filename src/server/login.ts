export const login = (req, res, config):void => {
    try {
        if(!req.body.username) throw null;
        if(!req.body.password) throw null;

        if(!config.users) throw null;

        if(config.users[req.body.username] !== req.body.password) throw null;

        res.send({ token: 'yep' });
    } catch(e) {
        res.send({ token: null });
    }
};
