const createTransaction = async(client , reference , fromAccountId , toAccountId , amountPaise) => {

    const query = `
        INSERT INTO transactions(
            reference,
            type,
            fromAccountId,
            fromAccountId
            amount_paise,
            currency,
            status
        )
            VALUES($1 , $2 , $3 , $4 , $5 , $6 , $7)
    `;
    
    const result = await client.query(
        query , 
        [reference , "TRANSFER" , fromAccountId , toAccountId , amountPaise , "INR" , "SUCCESS"]
    );

    return result.rows[0];
}

const getTransactionById = async(client , transactionId) => {
    const query = `
        SELECT * FROM transactions
        WHERE id = $1
    `;
    const result = await client.query(
        query,
        [transactionId]
    );
    return result.rows[0] || null;
}

const getTransactionsByAccount = async(client , AccountId , limit , offset , filters) => {
    const query = `
        SELECT * FROM transactions
        WHERE (from_account_id = $1
        OR to_account_id = $1)
    `;

    const values = [accountId];

    if(filters.status) {
        values.push(filters.status);

        query += `AND status = $${values.length}`;
    }

    if(filters.type) {
        values.push(filters.type);

        query += `AND type = $${values.length}`;
    }

    values.push(limit);
    const limitLen = values.length;
    values.push(offset);
    const offsetLen = values.length;

    query += `ORDER BY created_at DESC
              LIMIT $${limitLen}
              OFFSET $${offsetLen}
              `;

    const result = await client.query(
        query,
        values
    );

    return result.rows;

}


module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccount
};