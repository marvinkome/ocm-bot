import { verifyMatchFact } from "./helpers"
import { scorelineParser } from "./parser"
import { SheetsIntegration } from "./sheets"
import config from "./config"
import { League } from "./types"

const SCORELINE_TIPS = `Invalid scoreline. Tips:
1: Use names as it appears in the sheet. This applies to player names and team names.
2: Use the specified format as shown here. [format image]
3: Make sure the player stats match the scores.
4: Make sure you're posting in the right channel.
5: Don't forget to tag everyone ;)`

export async function scorelineHandler(args: string, category: League) {
    try {
        const data = scorelineParser(args)
        verifyMatchFact(data, category)

        console.log(data, category)

        // // add values to google sheet
        // const sheets = await new SheetsIntegration(config.sheets[category])

        // await sheets.updateScoreline(data.scores)
        // await sheets.updatePlayerStats(data.stats)
        // await sheets.updatePlayerCard(data.stats)

        return [
            `Added scores to sheets for ${data.scores.home.team} vs ${data.scores.away.team}`,
            true,
        ]
    } catch (err) {
        console.error(err)
        return [SCORELINE_TIPS, false]
    }
}
