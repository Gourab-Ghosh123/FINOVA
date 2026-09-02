const pool = require("../config/database");
const {lockAccountInOrder} = require("../repository/transfer.repository");
const accountRepository = require("../repository/account.repository");
const AppError = require("../errors/AppError");
const { createLedgerEntry } = require("../repository/ledger.repository");
const transactionRepository = require("../repository/transaction.repository");

const transferMoney = async(fromAccountId , toAccountId , amount) => {

    if(fromAccountId === toAccountId) {
        throw new AppError("source and destinaition account must be different!" , 400);
    }

    if(!Number.isFinite(amount) || amount <= 0) {
        throw new AppError("Amount must be greater than zero" , 400);
    }

    if(!Number.isInteger(amount * 100)) {
        throw new AppError("Amount can have at  most 2 decimal places" , 400);
    }

    const amountPaise = Math.round(amount * 100);

    const client =  await pool.connect();

    try {
        await client.query("BEGIN");

        const {firstAccount , secondAccount} = await lockAccountInOrder(
            client , fromAccountId , toAccountId
        );


        if(!firstAccount || !secondAccount) {
            throw new AppError("one or both accounts not found" , 404);
        }


        const fromAccount = fromAccountId === firstAccount.id ? firstAccount : secondAccount;
        const toAccount = toAccountId === firstAccount.id ? firstAccount : secondAccount;

        if(fromAccount.balance_paise < amountPaise) {
            throw new AppError("Insufficient Balance" , 400);
        }

        /*await client.query(
            `UPDATE accounts
            SET balance_paise = balance_paise - $1
            WHERE id = $2`,
            [amountPaise , fromAccount.id]
        );
        await client.query(
            `UPDATE accounts 
            SET balance_paise = balance_paise + $1
            WHERE id = $2`,
            [amountPaise , toAccount.id]
        );*/

        await accountRepository.updateBalance(client , fromAccount , -amountPaise);
        await accountRepository.updateBalance(client , toAccount , amountPaise);

        const reference = `TXN_${Date.now()}_${Math.random().toString(36).slice(2 , 8)}`;

      /*  const transactionResult = await client.query(
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
        ); */

        const transaction = await transactionRepository.createTransaction(client , reference , amountPaise);

        const transactionId = transaction.rows[0].id;

        /* await client.query(
            `
                INSERT INTO ledger_entries(
                    transaction_id,
                    account_id,
                    entry_type,
                    amount_paise
                )
                VALUES($1 , $2 , $3 , $4)
            `,
            [transactionId , fromAccount.id , "DEBIT" , amountPaise]
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
            [transactionId , toAccount.id , "CREDIT" , amountPaise]
        ); */

        await createLedgerEntry(client , transactionId , fromAccountId , "DEBIT" , amountPaise);
        await createLedgerEntry(client , transactionId , toAccountId , "CREDIT" , amountPaise);

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