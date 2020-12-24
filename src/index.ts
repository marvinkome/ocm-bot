import Discord, { TextChannel } from "discord.js"
import config from "../config.json"
import { botParser } from "./parser"
import { removeEmoji } from "./helpers"
import { scorelineHandler } from "./commands"

const prefix = "!"
const client = new Discord.Client()

client.on("message", (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    const { command, args } = botParser(message.content)

    if (command === "scores") {
        let category: any = (message.channel as TextChannel).parent?.name || ""
        category = removeEmoji(category).toLowerCase()

        const [response, success] = scorelineHandler(args, category)

        if (!success) {
            message.react("❌")
        }

        message.reply(response)
    }
})

client.on("ready", () => {
    console.log("Bot online!")
})

client.login(config.BOT_TOKEN)
