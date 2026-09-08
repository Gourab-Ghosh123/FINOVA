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

const getTransactionsByAccount = async(client , AccountId) => {
    const query = `
        SELECT * FROM transactions
        WHERE from_account_id = $1
        OR to_account_id = $1
        ORDER BY created_at DESC
    `;

    const result = await client.query(
        query,
        [AccountId]
    );

    return result.rows;

}


module.exports = {
    createTransaction,
    getTransactionById,
    getTransactionsByAccount
};