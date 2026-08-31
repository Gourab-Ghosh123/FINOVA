const createLedgerEntry = async(client , transactionId , accountId , entryType , amountPaise) => {
    const query = `INSERT INTO ledger_entries(
        client , transaction_id , account_id , entry_type , amount_paise)
        VALUES($1 , $2 , $3 , $4)
        RETURNING *;
    `;

    const values = [transactionId , accountId , entryType , amountPaise];

    const result = await client.query(query , values);
    return result.rows[0];
}

module.exports = {createLedgerEntry};