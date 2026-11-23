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
            SET gateway_order_id = $1,
                updated_at = NOW()
            WHERE order_id = $2
            RETURNING *
        ` , [gatewayOrderId , orderId]);

    return result.rows[0] || null;
};

const markPaymentOrderFailed = async(client , orderId , failureReason) => {
    const result = await client.query(`
            UPDATE payment_orders
            SET status = $1,
                failure_reason = $2,
                updated_at = NOW()
            WHERE order_id = $3
            RETURNING *
        ` , ["FAILED " , failureReason , orderId]);
    
        return result.rows[0] || null;
};

const findPaymentOrderByGatewayOrderIdAndUserId = async (
    client,
    gatewayOrderId,
    userId
) => {

    const result = await client.query(
        `
            SELECT *
            FROM payment_orders
            WHERE gateway_order_id = $1
            AND user_id = $2
        `,
        [gatewayOrderId, userId]
    );

    return result.rows[0] || null;
};

const createPaymentAttempt = async (
    client,
    {
        paymentOrderId,
        gatewayPaymentId,
        amountPaise,
        status,
        method
    }
) => {
    const result = await client.query(
        `
            INSERT INTO payment_attempts (
                payment_order_id,
                gateway_payment_id,
                amount_paise,
                status,
                method
            )
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `,
        [
            paymentOrderId,
            gatewayPaymentId,
            amountPaise,
            status,
            method
        ]
    );

    return result.rows[0];
};

const findPaymentAttemptByGatewayPaymentId = async (
    client,
    gatewayPaymentId
) => {
    const result = await client.query(
        `
            SELECT *
            FROM payment_attempts
            WHERE gateway_payment_id = $1
        `,
        [gatewayPaymentId]
    );

    return result.rows[0] || null;
};

const updatePaymentAttempt = async (
    client,
    gatewayPaymentId,
    {
        status,
        method,
        failureReason
    }
) => {
    const result = await client.query(
        `
            UPDATE payment_attempts
            SET status = $1,
                method = $2,
                failure_reason = $3,
                updated_at = NOW()
            WHERE gateway_payment_id = $4
            RETURNING *
        `,
        [
            status,
            method,
            failureReason,
            gatewayPaymentId
        ]
    );

    return result.rows[0] || null;
};

const markPaymentOrderSuccess = async (client, orderId, paymentId) => {
    const result = await client.query(
        `
            UPDATE payment_orders
            SET status = $1,
                gateway_payment_id = $2,
                updated_at = NOW()
            WHERE order_id = $3
            AND status = 'PENDING'
            RETURNING *
        `,
        ["SUCCESS", paymentId, orderId]
    );

    return result.rows[0] || null;
};


const findPaymentOrderForUpdate = async (
    client,
    gatewayOrderId,
    userId
) => {
    const result = await client.query(
        `
            SELECT *
            FROM payment_orders
            WHERE gateway_order_id = $1
            AND user_id = $2
            FOR UPDATE;
        `,
        [gatewayOrderId, userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    createPaymentOrder , 
    findPaymentOrderByGatewayOrderId,
    updatePaymentOrderGatewayDetails,
    markPaymentOrderSuccess,
    markPaymentOrderFailed,
    findPaymentOrderByGatewayOrderIdAndUserId,
    createPaymentAttempt,
    findPaymentAttemptByGatewayPaymentId,
    updatePaymentAttempt,
    findPaymentOrderForUpdate
};