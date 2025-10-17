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