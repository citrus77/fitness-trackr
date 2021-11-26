// api/routines.js
const express = require('express');
const router = express.Router();
const { requireUser } = require('./utils');

const { 
    getAllPublicRoutines, 
    createRoutine, 
    getRoutineById, 
    updateRoutine, 
    destroyRoutine,
    addActivityToRoutine
} = require('../db');

const client = require('../db/client')

const _dupeCheck = async (routineId, activityId) => {
    try {
        const { rows: [routineActivity] } = await client.query(`
            SELECT * FROM routine_activities
            WHERE "routineId" = $1 AND "activityId" = $2;
        `, [routineId, activityId]);

        if (routineActivity) {
            return true;
        } else {
            return false;
        };          
    } catch (error) {
        throw error;
    };
};

router.post('/:routineId/activities', async (req, res, next) => {
    try {
        const { routineId } = req.params;
        const { activityId, count, duration } = req.body;
        const checkDupe = await _dupeCheck(routineId, activityId);
        if (!checkDupe) {
            const addedRoutineActivity = await addActivityToRoutine({ routineId, activityId, count, duration });
            if (addedRoutineActivity) {
                res.send(addedRoutineActivity);
            } else {
                res.sendStatus(401);
                next ({
                    name: 'FailedCreateError',
                    message: 'This routine activity was not sucessfully created'
                });
            };   
        } else {
            res.status(401);
            next ({
                name: 'DuplicateError',
                message: 'This routine activity already exists'
            });
        };                      
    } catch (error) {
        next (error);
    };
});

router.patch('/:routineId', requireUser, async (req, res, next) => {
    try {
        const routine = await getRoutineById(req.params.routineId);
        const isOwner = req.user.id === routine.creatorId;
        if (isOwner) {
            const id = routine.id;
            const { isPublic, name, goal } = req.body;
            const updatedRoutine = await updateRoutine({id, isPublic, name, goal} );

            res.send(updatedRoutine);
        } else {
            res.status(401);
            next({
                name: 'IncorrectOwnerError',
                message: 'You must be the creator of this routine to update it'
            });
        };
    } catch (error) {
        next (error)
    };
});

router.delete('/:routineId', requireUser, async (req, res, next) => {
    try {
        let routine = await getRoutineById(req.params.routineId);
        const isOwner = req.user.id === routine.creatorId;
        if (isOwner) {
            const deletedRoutine = await destroyRoutine(req.params.routineId);
            routine = await getRoutineById(req.params.routineId);
            if (!routine) {
                res.status(200).send(deletedRoutine)
            };
        } else {
            res.status(401);
            next({
                name: 'IncorrectOwnerError',
                message: 'You must be the creator of this routine to update it'
            });
        };
    } catch (error) {
        next (error);
    };
});


router.post('/', requireUser, async (req, res, next) => {
    try {
        if (req.user) {
            const creatorId = req.user.id;
            const { isPublic, name, goal } = req.body;
            const newRoutine = await createRoutine({creatorId, isPublic, name, goal});
            
            if (newRoutine) {
                res.send(newRoutine);
            } else {
                res.status(401);
                next ({
                    name: 'FailedCreate',
                    message: `Cannot create post with data isPublic: ${isPublic}, name: ${name}, goal: ${goal}`
                });
            };
        };   
    } catch (error) {
        next (error);
    };
});    

router.get('/', async (req, res, next) => {
    try {
        const routines = await getAllPublicRoutines();
        res.send(routines);
    } catch (error) {
        next (error);
    };
});


router.use((req, res, next) => {
    console.log('A request is being made to /routines');
    next();
})

module.exports = router;