const createPaymentOrder = async(client , {
    orderId,
    userId,
    accountId,
    amountPaise,
    gatewayOrderId
}) => {
    const result = await client.query(`
        INSERT INTO payment_orders (order_id , user_id , account_id , amount_paise , currency , status , gateway_order_id)
        VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7)
        RETURNING *
        `, [orderId , userId , accountId , amountPaise , "INR" , "PENDING" , gatewayOrderId]);

        return result.rows[0];
};


const findPaymentOrderByGatewayOrderId = async(client , gatewayOrderId) => {
    const result = await client.query(`
            SELECT * FROM payment_orders WHERE gateway_order_id = $1
        ` , [gatewayOrderId]);

    return result.rows[0] || null;
};

const updatePaymentOrderGatewayDetails = async(client , orderId , gatewayOrderId) => {
    const result = await client.query(`
            UPDATE payment_orders
            SET gateway_order_id = $1
                updated_at = NOW()
            WHERE order_id = $2
            RETURNING *
        ` , [gatewayOrderId , orderId]);

    return result.rows[0] || null;
};

const markPaymentOrderFailed = async(client , orderId , failureReason) => {
    const result = await client.query(`
            UPDATE payment_orders
            SET status = $1
                failure_reason = $2
                updated_at = NOW()
            WHERE order_id = $3
            RETURNING *
        ` , ["FAILED " , failureReason , orderId]);
    
        return result.rows[0] || null;
}

module.exports = {
    createPaymentOrder , 
    findPaymentOrderByGatewayOrderId,
    updatePaymentOrderGatewayDetails,
    markPaymentOrderFailed
};