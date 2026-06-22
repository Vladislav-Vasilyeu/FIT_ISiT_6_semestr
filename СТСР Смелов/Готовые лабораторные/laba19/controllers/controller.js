let users = [
    {id: 1, name: 'June'},
    {id: 2, name: 'John'},
    {id: 3, name: 'James'},
];

const controller = {
    getAll: (req, res) => {
        res.json({users});
    },

    getOne: (req, res) => {
        const id = parseInt(req.params.id);
        const user = users.find(u=>u.id === id);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        res.json({ user });
    },

    create: (req, res) => {
        const {name} = req.body;
        if (!name) {
            return res.status(400).json({error: 'Name is required'});
        }
        const newId = users.length ? Math.max(...users.map(u=>u.id)) + 1 : 1;
        const newUser = {id: newId, name};
        users.push(newUser);
        res.status(201).json({user: newUser});
    },

    update: (req, res) => {
        const id = parseInt(req.params.id);
        const {name} = req.body;
        const user = users.find(u=>u.id === id);
        if (!user) {
            return res.status(404).json({error: 'User not found'});
        }
        if (name) {user.name = name;}
        res.json({user});
    },

    delete: (req, res) => {
        const id = parseInt(req.params.id);
        const index = users.findIndex(u=>u.id === id);
        if (index === -1) {
            return res.status(404).json({error: 'User not found'});
        }
        users.splice(index, 1);
        res.status(204).send();
    }
};

module.exports = controller;