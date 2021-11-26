// api/users.js
const express = require('express');
const router = express.Router();

const { JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');
const bcrypt = require ('bcrypt');

const { getUserByUsername, createUser, getPublicRoutinesByUser, getUserById } = require('../db');

router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    try {
        const user = await getUserByUsername(username);
        const hashedPassword = user.password;
        const passwordsMatch = await bcrypt.compare(password, hashedPassword);

        if (!username || !password) {
            next ({
                name: 'MissingCredentialsError',
                message: 'Please supply both a username and password'
            });
        };

        if (user && passwordsMatch) {
            const token = jwt.sign(user, JWT_SECRET);
            res.send({ token });
        } else {
            next({
                name: 'IncorrectCredentialError',
                message: 'Username or password is incorrect'
            });
        };       
    } catch (error) {
        next(error);
    };
});

router.post('/register', async ( req, res, next) =>{
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(400);
            next ({
                name: 'MissingCredentialsError',
                message: 'Please supply both a username and password'
            });
        };
        if (password.length < 8) {
            res.status(400)
            throw new Error ({
                name: 'PasswordLengthError',
                message: 'Passwords must be at least 8 characters'
            });
        };

        const _user = await getUserByUsername(username);
        if (_user) {
            res.status(400)
            throw new Error ({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        };        

        const user = await createUser({ username, password });        
        if (!user) {
            next({
                name: 'UserRegistrationError', 
                message: 'This user cannot be registered'
            });
        } else {
            const token = jwt.sign({
                id: user.id, 
                username},
                JWT_SECRET,
                { expiresIn: '1w' }
            );

            res.send({
                user,
                token,
                message: 'Thank you for signing up'
            });
        };
    } catch ({ name, message }) {
        next({ name, message });
    };
});

router.get('/me', async (req, res, next) =>{
    const prefix = 'Bearer ';
    const auth = req.headers.authorization;
    try {
        if (!auth) {
            res.sendStatus(401);
        } else if (auth.startsWith(prefix)) {
            const token = auth.slice(prefix.length)
            const { id } = jwt.verify(token, JWT_SECRET);
            req.user = await getUserById(id);
            res.send(req.user)
        }
    } catch (error) {
        next (error);
    };    
}); 

router.get('/:username/routines', async (req, res, next) => {
    try {
        const { username } = req.params;
        const routines = await getPublicRoutinesByUser({ username });
        res.send(routines);
    } catch (error) {
        next (error);
    };
    
});

router.use((req, res, next) => {
    console.log('A request is being made to /users');
    next();
});

module.exports = router;