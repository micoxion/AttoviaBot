import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js"

export type CustomCommand = {
  data: SlashCommandBuilder,
  execute(interaction: ChatInputCommandInteraction): void
}