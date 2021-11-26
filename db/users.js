const client = require ('./client');
const bcrypt = require ('bcrypt');


const getUserByUsername = async (username) => {
    try {
        const { rows: [user] } = await client.query(`
            SELECT * FROM users
            WHERE username = $1;
        `, [username]);

        return user;
    } catch (error) {
        throw error;
    };
};

const createUser = async ({ username, password }) => {
    try {
        const _user = await getUserByUsername(username);
        if (_user || password.length < 8 || !username || !password) {
            throw error;
        } else {
            const SALT_COUNT = 10;
            const hashedPassword = await bcrypt.hash(password, SALT_COUNT);

            const { rows: [user] } = await client.query(`
                INSERT INTO users (username, password)
                VALUES ($1, $2)
                ON CONFLICT (username) DO NOTHING
                RETURNING *;
            `, [username, hashedPassword]);

            delete user.password;
            return user;
        };       
    } catch (error) {
        throw error;
    };
};

const getUserById = async (id) => {
    try {
        const { rows: [user] } = await client.query(`
            SELECT * FROM users
            WHERE id = $1;
        `, [id]);

        delete user.password
        return user;
    } catch (error) {
        throw error;
    };
};

const getUser = async ({username, password}) => {
    try {
        const user = await getUserByUsername(username);
        const hashedPassword = user.password;
        const passwordsMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordsMatch) {
            delete user.password;
            return user;        
        };        
    } catch (error) {
        throw error; 
    };
};

module.exports = {
    createUser,
    getUser,
    getUserById,
    getUserByUsername
}