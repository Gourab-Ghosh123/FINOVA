
const getKey = async(client , key) => {
    const query = `
        SELECT * FROM idempotency_keys
        WHERE key = $1
    `;

    const result = await client.query(
        query,
        [key]
    );
    return result.rows[0] || null;
}

const createKey = async(client , key , requestHash) => {
    const query =`
        INSERT INTO idempotency_keys(
            key,
            status,
            request_hash

        )
            VALUES($1 , 'PENDING' , $2)
            RETURNING *;
    `;

    const result = await client.query(
        query,
        [key , requestHash]
    );

    return result.rows[0] || null;
}

const markCompleted = async(client , key , response) => {
    
    const query = `
        UPDATE idempotency_keys
        SET status = 'COMPLETED',
        response = $2
        WHERE key = $1
        RETURNING *;
    `;

    const result = await client.query(query, [key , response]);

    return result.rows[0];
}

const markFailed = async(client , key , response) => {
    const query = `
        UPDATE idempotency_keys
        SET status = 'FAILED',
        response = $2
        WHERE key = $1
        RETURNING *;
    `;

    const result = await client.query(query , [key , response]);
    return result.rows[0];
}

module.exports = {
    getKey,
    createKey,
    markCompleted,
    markFailed
};