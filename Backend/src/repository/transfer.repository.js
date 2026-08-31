getAccountForUpdate = async(client , accountId) => {
    const result = await client.query(
        `SELECT * FROM accounts 
        WHERE id = $1
        FOR UPDATE
        `,
        [accountId]
    );
    return result.rows[0];
}

const lockAccountInOrder = async(client , fromAccountId , toAccountId) => {
    const firstAccountId = Math.min(fromAccountId , toAccountId);
    const secondAccountId = Math.max(fromAccountId , toAccountId);

    

    const firstAccount = await getAccountForUpdate(client , firstAccountId);
    const secondAccount = await getAccountForUpdate(client , secondAccountId);

    return {
        firstAccount , secondAccount
    }
}

module.exports = {
    lockAccountInOrder
};