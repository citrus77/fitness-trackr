const client = require('./client');
const { getRoutineActivitiesByRoutine } = require('./routine_activities');
const { getActivityById } = require('./activities');
const { getUserById, getUserByUsername } = require('./users');

const getRoutineById = async (id) => {
    try {
        const { rows: [routine] } = await client.query(`
            SELECT * FROM routines
            WHERE id = $1;
        `, [id]);

        return routine;
    } catch (error) {
        throw error;
    };
};

const createRoutine = async ({ creatorId, isPublic, name, goal }) => {
    try {
        if (!isPublic) {
            isPublic = false;
        };
        const { rows: [ routine ] } = await client.query (`
            INSERT INTO routines ("creatorId", "isPublic", name, goal)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [creatorId, isPublic, name, goal])

        return routine;
    } catch (error) {
        throw error;
    };
};

const getRoutinesWithoutActivities = async () => {
    try {
        const { rows } = await client.query(`
            SELECT * FROM routines
            WHERE id NOT IN (SELECT "routineId" FROM routine_activities);
        `);
        
        return rows;
    } catch (error) {
        throw error;
    };
};

const destroyRoutine = async (id) => {
    try {
        const { rows: [routine] } = await client.query(`
            DELETE FROM routines
            WHERE id = $1
            RETURNING *;
        `, [id]);

        await client.query(`
            DELETE FROM routine_activities
            WHERE "routineId" IN ($1)
            RETURNING *;
        `, [id]);

        return (routine);
    } catch (error) {
        throw error;
    };
};

const updateRoutine = async ({ id, isPublic, name, goal }) => {
    try {
        if (isPublic) {
            await client.query(`
                UPDATE routines
                SET "isPublic" = $1
                WHERE id = $2
                RETURNING *;
        `,[isPublic, id]);
        };

        if (name) {
            await client.query(`
                UPDATE routines
                SET name = $1
                WHERE id = $2
                RETURNING *;
        `,[name, id]);
        };

        if (goal) {
            await client.query(`
                UPDATE routines
                SET goal = $1
                WHERE id = $2
                RETURNING *;
        `,[goal, id]);
        };

        const { rows: [routine] } = await client.query(`
            SELECT * FROM routines
            WHERE id = $1;
        `,[id]);
        
        return routine;
    } catch (error) {
        throw error;
    };
};

const _joinActitiesToRoutines = async (id) =>{
    const routine = await getRoutineById(id);

    const routineActivitiesThrough = await getRoutineActivitiesByRoutine({id: routine.id});

    routine.activities = []
    await Promise.all(routineActivitiesThrough.map(async (routineActivity) =>{
        const activity = await getActivityById(routineActivity.activityId);
        activity.count = routineActivity.count;
        activity.duration = routineActivity.duration;

        const { id, name, description, count, duration } = activity;
        const orderedActivity = { count, description, duration, id, name };
        routine.activities.push(orderedActivity);

        return activity;
    }));
    
    const user = await getUserById(routine.creatorId);
    routine.creatorName = user.username;
    
    return routine;
};

const getAllRoutines = async () => {
    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines;
        `);
        
        const joinedRoutines = await Promise.all(routines.map(async (routine) => {
            const joinedRoutine = await _joinActitiesToRoutines(routine.id);
            return joinedRoutine;
        }));

        return joinedRoutines;
    } catch (error) {
        throw error;
    };
};

const getAllPublicRoutines = async () => {
    try {
        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE "isPublic" = true;
        `);
        
        const joinedRoutines = await Promise.all(routines.map(async (routine) => {
            const joinedRoutine = await _joinActitiesToRoutines(routine.id);
            return joinedRoutine;
        }));

        return joinedRoutines;
    } catch (error) {
        throw error;
    };
};

const getAllRoutinesByUser = async ({ username }) => {
    try {
        const { rows: [userId] } = await client.query(`
            SELECT id FROM users
            WHERE username = $1;
        `, [username]);

        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE "creatorId" = $1;            
        `, [userId.id]);
        
        const joinedRoutines = await Promise.all(routines.map(async (routine) => {
            const joinedRoutine = await _joinActitiesToRoutines(routine.id);
            return joinedRoutine;
        }));

        return joinedRoutines;
    } catch (error) {
        throw error;
    };
};

const getPublicRoutinesByUser = async ({ username }) => {
    try {
        const { rows: [userId] } = await client.query(`
            SELECT id FROM users
            WHERE username = $1;
        `, [username]);

        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE "creatorId" = $1
            AND "isPublic" = true;            
        `, [userId.id]);
        
        const joinedRoutines = await Promise.all(routines.map(async (routine) => {
            const joinedRoutine = await _joinActitiesToRoutines(routine.id);
            return joinedRoutine;
        }));

        return joinedRoutines;
    } catch (error) {
        throw error;
    };
};

const getPublicRoutinesByActivity = async ({ id }) => {
    try {
        const { rows: [routineByActivityId] } = await client.query(`
            SELECT "routineId" FROM routine_activities
            WHERE "activityId" = $1;
        `, [id]);

        const { rows: routines } = await client.query(`
            SELECT * FROM routines
            WHERE id = $1
            AND "isPublic" = true;
        `, [routineByActivityId.routineId]);

        const joinedRoutines = await Promise.all(routines.map(async (routine) => {
            const joinedRoutine = await _joinActitiesToRoutines(routine.id);
            return joinedRoutine;
        }));

        return joinedRoutines;
    } catch (error) {
        throw error;
    };
};

module.exports = {
    createRoutine,
    getRoutinesWithoutActivities,
    getRoutineById,
    destroyRoutine,
    updateRoutine,
    getAllRoutines,
    getAllPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity
};