import pool from '../database.js'
//import { getWriterByUserId } from './writers';

export async function getMessageByMessageId(messageId: string) {
    let sql = "SELECT * FROM MessagesCounted WHERE messageid = '" + messageId + "'";
    const client = await pool.connect()
    try {
        let res = await client.query(sql);
        return res.rows[0]
    } finally {
        client.release();
    }
}

export async function hasMessageBeenCounted(messageId: string): Promise<boolean> {
    let message = await getMessageByMessageId(messageId);
    if (message) {
        return true;
    } else {
        return false;
    }
}

// export async function recordMessageTracked(messageId: string, userId: string, username: string) {
//     let writer = await getWriterByUserId(userId, username);
//     let sql = "INSERT INTO public.\"MessagesCounted\" (messageid, writerid) VALUES ($1, $2)"
//     let values = [messageId, writer?.userId]
//     const client = await pool.connect()
//     try {
//         let res = await client.query(sql, values);
//         client.release();
//     } finally {
//         client.release();
//     }
// }

export async function recordMessageTracked(messageId: string) {
    let sql = "INSERT INTO MessagesCounted (messageid) VALUES ('" + messageId + "')"
    console.log(sql)
    const client = await pool.connect()
    try {
        let res = await client.query(sql);
    } finally {
        client.release();
    }
}