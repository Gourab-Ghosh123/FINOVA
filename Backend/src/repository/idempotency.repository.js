const getKey = async(client , key) => {
    const query = `
        SELECT * FROM idempotency_keys
        WHERE id = $1
    `;

    const result = await client.query(
        query,
        [key]
    );
    return result.rows[0] || null;
}

const createKey = async(client , key) => {
    const query =`
        INSERT INTO idempotency_keys(
            key,
            status
        )
            VALUES($1 , "PENDING")
            RETURNING *;
    `;

    const result = await client.query(
        query,
        [key]
    );

    return result.rows[0] || null;
}

const markCompleted = async(client , key , response) => {
    
    const query = `
        UPDATE idempotency_keys
        SET status = "COMPLETED",
        response = $2
        WHERE id = $1
        RETURNING *;
    `;

    const result = await client.query(query, [key , response]);

    return result.rows[0];
}

const markFailed = async(client , key , response) => {
    const query = `
        UPDATE idempotency_keys
        SET status = "FAILED",
        response = $2
        WHERE id = $1
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