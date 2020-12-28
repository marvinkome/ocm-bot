import Discord, { TextChannel } from "discord.js"
import config from "./config"
import { botParser } from "./parser"
import { removeEmoji } from "./helpers"
import { scorelineHandler } from "./commands"

const prefix = "!"
const client = new Discord.Client()

client.on("message", async (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    const { command, args } = botParser(message.content)

    if (command === "scores") {
        const channelName = (message.channel as TextChannel).parent?.name || ""
        const category: any = removeEmoji(channelName).toLowerCase()

        const [response, success] = await scorelineHandler(args, category)

        if (!success) {
            message.react("❌")
        }

        message.reply(response)
    }
})

client.on("ready", () => {
    console.log("Bot online!")
})

client.login(config.botToken)
