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

module.exports = {
    getKey,
    createKey
};