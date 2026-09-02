const createTransaction = async(client , reference , amountPaise) => {

    const query = `
        INSERT INTO transactions(
            reference,
            type,
            amount_paise,
            currency,
            status
        )
            VALUES($1 , $2 , $3 , $4 , $5)
    `;
    
    const result = await client.query(
        query , 
        [reference , "TRANSFER" , amountPaise , "INR" , "COMPLETED"]
    );

    return result.rows[0];
}

module.exports = {
    createTransaction
};