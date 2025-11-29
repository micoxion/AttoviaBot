import { Insertable, Updateable } from 'kysely';
import { DB, MyschemaGobbers, MyschemaPlayers } from 'kysely-codegen';
import { db } from '../db.js'
import { Gobber } from '../../Gobber/Gobber.js';

export async function insertGobber(gobber: Insertable<MyschemaGobbers>) {
    return await db
    .insertInto('myschema.gobbers')
    .values(gobber)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function getGobberById(discordid: string) {
    return await db
    .selectFrom('myschema.gobbers')
    .selectAll()
    .where('discordid', '=', discordid)
    .executeTakeFirst()
}

export async function updateGobber(discordid: string, gobber: Updateable<MyschemaGobbers>) {
    return await db
    .updateTable('myschema.gobbers')
    .set(gobber)
    .where('discordid', '=', discordid)
    .returningAll()
    .executeTakeFirstOrThrow()
}