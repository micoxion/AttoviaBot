import { Insertable, Updateable } from 'kysely';
import { DB, MyschemaPlayers } from 'kysely-codegen';
import { db } from '../db.js'
import { Player } from '../../Player/Player.js';

export async function insertPlayer(player: Insertable<MyschemaPlayers>) {
    return await db
    .insertInto('myschema.players')
    .values(player)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export async function getPlayerById(discordid: string) {
    return await db
    .selectFrom('myschema.players')
    .selectAll()
    .where('discordid', '=', discordid)
    .executeTakeFirst()
}

export async function getAllPlayers() {
    return await db
    .selectFrom('myschema.players')
    .selectAll()
    .execute()
}

export async function updatePlayer(discordid: string, player: Updateable<MyschemaPlayers>) {
    return await db
    .updateTable('myschema.players')
    .set(player)
    .where('discordid', '=', discordid)
    .returningAll()
    .executeTakeFirstOrThrow()
}