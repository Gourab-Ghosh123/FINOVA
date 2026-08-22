getAccountForUpdate = async(client , accountId) {
    const result = await client.query(
        `SELECT * FROM accounts 
        WHERE id = $1
        FOR UPDATE
        `,
        [accountId]
    );
    return result.rows[0];
}

module.exports = {
    getAccountForUpdate
};