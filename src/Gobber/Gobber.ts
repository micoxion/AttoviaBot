import { Introspector, MyschemaGobbers } from "kysely-codegen";
import { GobberData, OreInfo, replacer, reviver } from "./GobberData.js";
import { insertGobber, updateGobber } from "../database/postgres/gobber.js";
import { CacheType, ChatInputCommandInteraction, Events, Interaction, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { Resource, ResourceType } from "./GobberTypes/Resources.js";
import { buildSuccessContainer } from "../commenContainers/Success.js";

const defaultData: GobberData = new GobberData()

async function modalHandler(interaction: Interaction<CacheType>, gobber: Gobber) {
    if (!interaction.isModalSubmit()) return;
    interaction.client.removeListener(Events.InteractionCreate, modalHandler)
    let gobberName: string = interaction.fields.getTextInputValue('gobberName');
    gobber.gobberData.gobberName = gobberName
    await gobber.insertGobber();
}

export class Gobber implements MyschemaGobbers {
    discordid: string;
    savedata: string | null;
    gobberData: GobberData;

    static fromExisting(player: MyschemaGobbers): Gobber {
        console.log(player.savedata)
        return new this(player.discordid, player.savedata, null);
    }

    constructor(discordid: string, savedata: string | null, savedataDecoded: GobberData | null) {
        if (savedata != null) {
            savedataDecoded = JSON.parse(savedata, reviver) as GobberData;
        }
        else {
            savedata = JSON.stringify(defaultData, replacer)
            savedataDecoded = defaultData;
        }
        this.discordid = discordid;
        this.savedata = savedata;
        this.gobberData = savedataDecoded;
    }

    async startMining(): Promise<Map<OreInfo, number> | null> {
        if (this.gobberData.isMining) {
            this.gobberData.isMining = false;
            await this.updateGobber()   
            return await this.collectMining();
        }
        this.gobberData.isMining = true;
        this.gobberData.mineStartTime = Date.now();
        await this.updateGobber();
        return null
    }

    getUnlockedOre() {
        let response: OreInfo[] = []
        let index = 0
        console.log(this.gobberData.ore)
        for (const [type, ore] of this.gobberData.ore) {
            if (ore.unlocked) {
                response[index] = ore;
                index++;
            }
        }
        return response;
    }

    private selectOre(oreSeekVal: number, unlockedOres: OreInfo[]): OreInfo {
        for (let i = unlockedOres.length - 1; i >= 0; i--) {
            if (oreSeekVal <= unlockedOres[i].rarityValue) {
                return unlockedOres[i]
            }
        }
        //failsafe always return copper
        return unlockedOres[0];
    }

    async collectMining(): Promise<Map<OreInfo, number>> {
        let startTime = this.gobberData.mineStartTime || Date.now();
        let currentTime = Date.now()
        let difference = currentTime - startTime
        let mineTime = difference
        if (difference > this.gobberData.maxAwayMineTime) {
            mineTime = this.gobberData.maxAwayMineTime;
        }
        let mineTicks = Math.floor(mineTime / (1000 * this.gobberData.mineRate))
        let oreSeekValue = Math.random()
        let unlockedOres: OreInfo[] = this.getUnlockedOre()
        let selectedOre = this.selectOre(oreSeekValue, unlockedOres)
        let selectedOreHealth = selectedOre.health
        let collected: Map<OreInfo, number> = new Map<OreInfo, number>()
        for (mineTicks; mineTicks > 0; mineTicks--) {
            selectedOreHealth -= this.gobberData.mineRate
            if (selectedOreHealth <= 0) {
                selectedOre.owned += selectedOre.quantity
                let originalAmount = collected.get(selectedOre) || 0
                collected.set(selectedOre, originalAmount + selectedOre.quantity)
                oreSeekValue = Math.random()
                selectedOre = this.selectOre(oreSeekValue, unlockedOres);
                selectedOreHealth = selectedOre.health
            }
        }
        await this.updateGobber();
        this.gobberData.isMining = false;
        return collected;
    }

    async insertGobber() {
        this.savedata = JSON.stringify(this.gobberData, replacer);
        await insertGobber(this);
    }

    async updateGobber() {
        this.savedata = JSON.stringify(this.gobberData, replacer)
        console.log("POST SAVE: \n" + this.savedata)
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
        interaction.client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isModalSubmit() || interaction.customId != "onboardGobber") return;
            await modalHandler(interaction, this);
            let container = buildSuccessContainer(`Welcome <@${interaction.user.id}> to the mines! Use /mine again to start mining. Your maximum mine duration starts at 10 minutes. If you need any help use the /gobber-help or !ab gobber help commands! (these are still not implemented)`)
            await interaction.reply({ components: [container], flags: MessageFlags.IsComponentsV2 , allowedMentions: {users: [interaction.user.id]}})
        })

        await interaction.showModal(modal);
    }
}