import { ChatInputCommandInteraction, Client, InteractionResponse } from "discord.js";

/**
 * Handles and automates easy cleanup of event emitters for action row components and the like.
 * 
 * @param emitter The event emitter to be deleted for cleanup
 * @param interaction The interaction the emitter originates from
 * @param idleTime How long to wait until the collector classifies the message as idle
 * @param response If the cleanup should include deleting the response message then pass it here
 */
export async function EventEmitterCleanup(emitter: Client<true>, interaction: ChatInputCommandInteraction, idleTime: number, response: InteractionResponse | null = null) {
    const collector = interaction.channel?.createMessageComponentCollector({
        filter: i => i.user.id === interaction.user.id,
        idle: idleTime
    });
    collector?.on('end', async (collected, reason) => {
        if (reason === 'idle') {
            emitter.destroy();
            if (response) {
                await response.delete();
            }
        }
    })
}