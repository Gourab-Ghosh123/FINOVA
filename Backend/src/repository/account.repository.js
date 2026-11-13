const pool = require('../config/database');

const findAccountByUserId = async(userId) => {
    const result = await pool.query(
        `SELECT * FROM accounts WHERE user_id = $1`,
        [userId]
    );
    return result.rows[0];
}

const findAccountById = async(client , accountId) => {
    const result = await client.query(
        `SELECT * FROM accounts WHERE id = $1`,
        [accountId]
    );
    return result.rows[0];
}

const findAccountByIdAndUserId = async(client , accountID , userId) => {
    const result = await client.query(
        `
            SELECT * FROM accounts
            WHERE id = $1
            AND user_id = $2
        `,
        [accountId , userId]
    );

    return result.rows[0] || null;
}

const updateBalance = async(client , accountId , amountPaise) => {
    const query = `
        UPDATE accounts
        SET balance_paise = balance_paise + $1,
        updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `;

    const result = await client.query(
        query,
        [accountId , amountPaise]
    );

    return result.rows[0] || null;
}


const createAccountRepository = async(client , userId) => {
    const query = `
        INSERT INTO accounts (user_id , balance_paise)
        VALUES($1 , $2)
        RETURNING id , user_id , balance_paise , currency , status , created_at , updated_at;
    `;

    const result = await client.query(query , [userId , 0]);

    return result.rows[0] || null;
}

module.exports = {
    findAccountByUserId,
    findAccountById,
    updateBalance,
    createAccountRepository,
    findAccountByIdAndUserId
};