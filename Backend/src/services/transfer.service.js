const pool = require("../config/database");
const {getAccountForUpdate} = require("../repository/transfer.repository");

const transferMoney = async(fromAccountId , toAccountId , amount) => {

    if(fromAccountId === toAccountId) {
        throw new Error("source and destinaition account must be different");
    }

    const amountPaise = Math.round(amount * 100);

    if(amountPaise <= 0) {
        throw new Error("Amount must be greater than zero");
    }
    const client =  await pool.connect();

    try {
        await client.query("BEGIN");

        const fromAccount = await getAccountForUpdate(client , fromAccountId);

        const toAccount = await getAccountForUpdate(client , toAccountId);


        if(!fromAccount) {
            throw new Error("source account not found");
        }
        if(!toAccount) {
            throw new Error("destination account not found");
        }

        if(fromAccount.balance_paise <= amountPaise) {
            throw new Error("Insufficient Balance");
        }

        await client.query(
            `UpDATE accounts
            SET balance_paise = balance_paise - $1
            WHERE id = $2`,
            [amountPaise , fromAccount]
        );
        await client.query(
            `UPDATE account 
            SET balance_paise = balance + $1
            WHERE id = $2`,
            [amountPaise , toAccount]
        );

        const reference = `TXN_${Date.now()}_${Math.random().toString(36).slice(2 , 8)}`;

        const transactionResult = await client.query(
            `
            INSERT INTO transactions (
                reference,
                type,
                amount_paise,
                currency,
                status
            )
            VALUES ($1 , $2 , $3 , $4 , $5)
            returning id
            `,
            [reference , "TRANSFER" , amountPaise , "INR" , "COMPLETED"]
        );

        const transactionId = transactionResult.rows[0].id;

        await client.query(
            `
                INSERT INTO ledger_entries(
                    tracsactionId,
                    accountId,
                    entry_type,
                    amount_paise
                )
                VALUES($1 , $2  $3 , $4)
            `,
            [transactionId , toAccountId , "CREDIT" , amountPaise]
        );
        await client.query(
            `
                INSERT INTO ledger_entries (
                    transaction_id,
                    account_id,
                    entry_type,
                    amount_paise
                )
                VALUES($1 , $2 , $3 , $4)
            `,
            [transactionId , toAccount , "CREDIT" , amountPaise]
        );

        await client.query("COMMIT");

        return {
            transactionId,
            reference,
            status : "COMPLETED"   
        };
    }
    catch(error) {
        await client.query("ROLLBACK");
        throw error;
    }
    finally {
        client.release();
    }
};

module.exports = {
    transferMoney
};