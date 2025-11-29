import { MyschemaGobbers } from "kysely-codegen";
import { GobberData } from "./GobberData.js";
import { updateGobber } from "../database/postgres/gobber.js";
import { CacheType, ChatInputCommandInteraction, Events, Interaction, LabelBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";

const defaultData: GobberData = new GobberData()

function modalHandler(interaction: Interaction<CacheType>) {
    if (!interaction.isModalSubmit()) return;
    interaction.client.removeListener(Events.InteractionCreate, modalHandler)
    console.log(interaction)
}

export class Gobber implements MyschemaGobbers {
    discordid: string;
    savedata: string | null;
    savedataDecoded: GobberData;

    static fromExisting(player: MyschemaGobbers): Gobber {
        return new this(player.discordid, player.savedata, null);
    }

    constructor(discordid: string, savedata: string | null, savedataDecoded: GobberData | null) {
        if (savedata != null) {
            savedataDecoded = JSON.parse(savedata) as GobberData;
        }
        else {
            savedata = JSON.stringify(defaultData)
            savedataDecoded = defaultData;
        }
        this.discordid = discordid;
        this.savedata = savedata;
        this.savedataDecoded = savedataDecoded;
    }

    async startMining() {
        this.savedataDecoded.mineStartTime = Date.now();
        await this.updateGobber();
    }

    async collectMining() {
        let startTime = this.savedataDecoded.mineStartTime || Date.now();
        let currentTime = Date.now()
        let difference = currentTime - startTime
        let mineTime = difference
        if (difference > this.savedataDecoded.maxAwayMineTime) {
            mineTime = this.savedataDecoded.maxAwayMineTime;
        }
    }

    async updateGobber() {
        this.savedata = JSON.stringify(this.savedataDecoded)
        await updateGobber(this.discordid, this);
    }

    async onboardGobber(interaction: ChatInputCommandInteraction) {
        const modal = new ModalBuilder().setCustomId('onboardGobber').setTitle('New Gobber Mine Owner Onboarding');

        const nameInput = new TextInputBuilder()
            .setCustomId('gobberName')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Gobber')
            .setMaxLength(28)
            .setMinLength(1)
            .setValue('Gobber')
            .setRequired(false);

        const label = new LabelBuilder()
            .setLabel('Name your Gobber If you Wish!')
            .setDescription('Please avoid naming your Gobber anything that would otherwise break the discord rules thank you!')
            .setTextInputComponent(nameInput);
        
        modal.addLabelComponents(label)
        interaction.client.on(Events.InteractionCreate, modalHandler)

        await interaction.showModal(modal);
    }
}