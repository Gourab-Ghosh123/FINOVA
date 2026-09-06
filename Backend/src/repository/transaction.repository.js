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
        [reference , "TRANSFER" , fromAccountId , toAccountId , amountPaise , "INR" , "COMPLETED"]
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
    return result.rows[0];
}


module.exports = {
    createTransaction,
    getTransactionById
};