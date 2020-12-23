import Discord from "discord.js"
import { botParser, scorelineParser } from "./parser"
import config from "../config.json"

const prefix = "!"
const client = new Discord.Client()

client.on("message", (message) => {
    if (message.author.bot) return
    if (!message.content.startsWith(prefix)) return

    const { command, args } = botParser(message.content)

    if (command === "scores") {
        const data = scorelineParser(args)
        console.log(JSON.stringify(data))

        const { scores } = data
        if (scores.home.score > scores.away.score) {
            message.reply(`Yay!!, ${scores.home.team} wins.`)
        } else {
            message.reply(`Yay!!, ${scores.away.team} wins.`)
        }
    }
})

client.on("ready", () => {
    console.log("Bot online!")
})

client.login(config.BOT_TOKEN)
