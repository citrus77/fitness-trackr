const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;
const { getUserById } = require('../db')

const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
    res.send({message: 'Hello'});
});

router.use(async (req, res, next) => {
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    if(!auth) {
        next();
    } else if (auth.startsWith(prefix)) {
        const token = auth.slice(prefix.length);

        try {
            const { id } = jwt.verify(token, JWT_SECRET)
            if (id) {
                req.user = await getUserById(id);
                next();
            }
        } catch ({ name, message}) {
            next ({ name, message });
        };
    } else {
        next ({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${prefix}`
        });
    };
});

const usersRouter = require('./users');
router.use('/users', usersRouter);

const activitiesRouter = require('./activities');
router.use('/activities', activitiesRouter);

const routinesRouter = require('./routines');
router.use('/routines', routinesRouter);

const routineActivitiesRouter = require('./routine_activities');
router.use('/routine_activities', routineActivitiesRouter);

router.use((error, req, res, next) => {
    console.error(error)
    res.send(error);
});

module.exports = router;