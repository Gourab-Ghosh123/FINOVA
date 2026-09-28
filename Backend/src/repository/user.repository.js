const pool = require("../config/database");


const findUserById = async(userId) => {
    const result = await pool.query(
        "SELECT  * FROM users WHERE id = $1",
        [userId]
    );

    return result.rows[0];
};

const createUserRepository = async(name , email , hashedPassword) => {
    const query = `INSERT INTO users(
        name,
        email,
        password_hash
    )
        VALUES($1 , $2 , $3)
        RETURNING id , name , email , created_at;
    `;
    const result = await pool.query(query, [name , email , hashedPassword]);

    return result.rows[0];
}

module.exports = {
    findUserById,
    createUserRepository
};
