const findAccountByUserId = async(userId) => {
    const result = await pool.query(
        "SELECT * FROM accounts where id = $1",
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

const updateBalance = async(client , accountId , amountPaise) => {
    const query = `
        UPDATE accounts
        SET balance_paise = balance_paise + $1
        WHERE id = $2
    `;

    const result = await client.query(
        query,
        [accountId , amountPaise]
    );

    return result.rows[0] || null;
}

module.exports = {
    findAccountByUserId,
    findAccountById,
    updateBalance
};