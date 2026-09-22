const createAuditLog = async(client , {
    userId,
    action,
    entityType,
    entityId,
    metaData
}) => {
    const query = `
        INSERT INTO audit_logs(
            user_id,
            action,
            entity_type,
            entity_id,
            metadata
        )
            VALUES($1 , $2 ,$3 , $4 , $5)
            RETURNING *;
    `;

    const result = await client.query(
        query,
        [   userId,
            action,
            entityType,
            entityId,
            metaData
        ]
    );
    return result.rows[0];
}

module.exports = {
    createAuditLog
};