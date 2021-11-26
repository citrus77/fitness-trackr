const client = require('./client');

const addActivityToRoutine = async ({ routineId, activityId, count, duration }) => {
    try {
        const { rows: [routineActivity] } = await client.query(`
            INSERT INTO routine_activities ("routineId", "activityId", count, duration)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `, [routineId, activityId, count, duration]);

        return routineActivity;
    } catch (error) {
        throw error;
    };
};

const getRoutineActivitiesByRoutine = async ({id}) => {
    try {
        const { rows: routineActivities } = await client.query (`
            SELECT * FROM routine_activities
            WHERE "routineId" = $1;
        `, [id]);
        
        return routineActivities;
    } catch (error) {
        throw error;
    };
};

const updateRoutineActivity = async ({ id, count, duration }) => {
    try {
        if (count) {
            await client.query(`
                UPDATE routine_activities
                SET count = $1
                WHERE id = $2
                RETURNING *;
        `,[count, id]);
        };

        if (duration) {
            await client.query(`
                UPDATE routine_activities
                SET duration = $1
                WHERE id = $2
                RETURNING *;
        `,[duration, id]);
        };

        const { rows: [routineActivity] } = await client.query(`
            SELECT * FROM routine_activities
            WHERE id = $1;
        `, [id]);

        return routineActivity;
    } catch (error) {
        throw error;
    };
};

const destroyRoutineActivity = async (id) => {
    try {
        const {rows: [routineActivity]} = await client.query(`
            DELETE FROM routine_activities
            WHERE id = $1
            RETURNING *;
        `, [id]);

        return routineActivity;
    } catch (error) {
        throw error;
    };
};

const getRoutineActivityById = async (id) => {
    try {
        const { rows: [routineActivity] } = await client.query(`
            SELECT * FROM routine_activities
            WHERE id = $1;
        `, [id]);
        return routineActivity;
    } catch (error) {
        throw error;
    };
};

module.exports = {
    addActivityToRoutine,
    getRoutineActivitiesByRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    getRoutineActivityById
};