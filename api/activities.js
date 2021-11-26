// api/activities.js
const express = require('express');
const { getAllActivities, createActivity, getPublicRoutinesByActivity, getActivityById, updateActivity } = require('../db');
const { requireUser } = require('./utils');
const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const activities = await getAllActivities();
        
        res.send(activities);
    } catch (error) {
        next (error);
    };
});

router.post('/', async (req, res, next) =>{
    try {
        const activityToPost = await createActivity(req.body);
        res.send(activityToPost);
    } catch (error) {
        next (error);
    };
});

router.patch('/:activityId', requireUser, async (req, res, next) => {
    try {
        if (requireUser) {
            const { name, description } = req.body;
            const id = req.params.activityId;
            const updatedActivity = await updateActivity({ 
                id, 
                name, 
                description 
            });
            
            res.send(updatedActivity)
        } else {
            res.send({
                name: 'MissingUserError',
                message: 'You must be logged in to perform this action'
            });
        };
    } catch (error) {
        next (error);
    };
});

router.get('/:activityId/routines', async (req, res, next) => {
    try {
        const id = req.params.activityId;
        const routines = await getPublicRoutinesByActivity({ id });
        res.send(routines);        
    } catch (error) {
        next (error);
    };
});

router.use((req, res, next) => {
    console.log('A request is being made to /activities');
    next();
});

module.exports = router;