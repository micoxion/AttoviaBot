import { Client, Message } from "discord.js";
import { Gobber } from "../Gobber/Gobber";

const youShouldOnboardmessage = "You don't have a gobber yet! Please use /mine to get onboarded and start mining!";

export async function sell(client: Client, message: Message, gobber: Gobber) {
    if (!gobber) {
        
    }
}