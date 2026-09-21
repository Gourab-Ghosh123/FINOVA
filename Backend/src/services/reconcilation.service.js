const {findAccountById} = require("../repository/account.repository");

const {getBalanceFromLedger} = require("../repository/ledger.repository");

const pool = require("../config/database");

const AppError = require("../errors/AppError");

const reconcileAccount = async(accountId) => {

    const client = await pool.connect();

    try {
        const account = await findAccountById(client , accountId);

        if(!account) {
            throw new AppError("Account not Found" , 404);
        }

        const ledgerBalance = await getBalanceFromLedger(client , accountId);

        const storedBalance = Number(account.balance_paise);
        const calculatedBalance = Number(ledgerBalance.balance_paise);

        const difference = storedBalance - calculatedBalance;


        return {
            accountId,
            storedBalance,
            calculatedBalance,
            difference,
            reconcile : difference === 0
        };
    }

    finally {
        client.release();
    }
};

module.exports = {reconcileAccount};