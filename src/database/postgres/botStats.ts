import { db } from "../db.js";

export async function getGoodBotCount() {
    return await db
    .selectFrom('myschema.botstats')
    .select('goodbotcount')
    .executeTakeFirst()
}

export async function addToGoodBotCount(amount: number) {
    return await db
    .updateTable('myschema.botstats')
    .set((eb) => ({
        goodbotcount: eb('goodbotcount', '+', amount)
    }))
    .returning('goodbotcount')
    .executeTakeFirst()
}

export async function getLastBotCheckin() {
    return await db
    .selectFrom('myschema.botstats')
    .select('lastonline')
    .executeTakeFirst()
}

export async function updateLastOnline() {
    return await db
    .updateTable('myschema.botstats')
    .set({
        lastonline: new Date()
    })
    .executeTakeFirst()
}