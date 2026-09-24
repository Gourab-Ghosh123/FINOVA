const createLedgerEntry = async(client , transactionId , accountId , entryType , amountPaise) => {
    const query = `INSERT INTO ledger_entries(
         transaction_id , account_id , entry_type , amount_paise)
        VALUES($1 , $2 , $3 , $4)
        RETURNING *;
    `;

    const values = [transactionId , accountId , entryType , amountPaise];

    const result = await client.query(query , values);
    return result.rows[0];
}

const getLedgerEntryByTransaction = async(client , transactionId) => {
    const query = `SELECT * FROM ledger_entries
    WHERE transaction_id = $1
    ORDER BY id ASC
    `;

    const result = await client.query(
        query,
        [transactionId]
    );
    return result.rows;
}

const getBalanceFromLedger = async(client , accountId) => {
    const query = `
        SELECT 
            COALESCE(
                SUM(
                    CASE
                        WHEN entry_type = 'CREDIT'
                        THEN amount_paise

                        WHEN entry_type = 'DEBIT'
                        THEN -amount_paise
                    END
                ),
                0
            ) AS balance_paise
             FROM ledger_entries
             WHERE account_id = $1
    `;

    const reuslt = await client.query(
        query,
        [accountId]
    );

    return reuslt.rows[0];
}

module.exports = {createLedgerEntry , getLedgerEntryByTransaction , getBalanceFromLedger};