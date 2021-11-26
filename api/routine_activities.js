// api/routine_activities.js
const express = require('express');
const router = express.Router();
const { updateRoutineActivity, getRoutineById, destroyRoutineActivity, getRoutineActivityById,  } = require('../db');
const { requireUser } = require('./utils');

router.patch('/:routineActivityId', requireUser, async (req, res, next) => {
    try {
        const { routineActivityId } = req.params;
        const routineActivityToParse = await getRoutineActivityById (routineActivityId);
        const { routineId } = routineActivityToParse
        const { count, duration } = req.body;
        const routine = await getRoutineById(routineId);
        const isOwner = req.user.id === routine.creatorId;
        if (isOwner) {
            const updatedRoutineActivity = await updateRoutineActivity ({ id: routineActivityId, count, duration });
            console.log(updatedRoutineActivity)
            res.send(updatedRoutineActivity);
        } else {
            res.status(401);
            next({
                name: 'IncorrectOwnerError',
                message: 'You must be the creator of this routine to delete it'
            });
        };
    } catch (error) {
        next (error);
    };
});

router.delete('/:routineActivityId', requireUser, async (req, res, next) => {
    try {
        const { routineActivityId } = req.params;
        const routineActivity = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineActivity.routineId);
        if (routine) {            
            const isOwner = req.user.id === routine.creatorId;
            if (isOwner) {
                const deletedRoutineActivity = await destroyRoutineActivity(routineActivityId);
                res.send(deletedRoutineActivity);
            } else {
                res.status(401);
                next({
                    name: 'IncorrectOwnerError',
                    message: 'You must be the creator of this routine to delete it'
                });
            };
        };
    } catch (error) {
        next (error);
    };
});

router.use((req, res, next) => {
    console.log('A request is being made to /routine_activities');
    next();
});

module.exports = router;