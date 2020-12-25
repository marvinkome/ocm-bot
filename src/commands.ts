import { verifyMatchFact } from "./helpers"
import { scorelineParser } from "./parser"

const SCORELINE_TIPS = `Invalid scoreline. Tips:
1: Use names as it appears in the sheet. This applies to player names and team names.
2: Use the specified format as shown here. [format image]
3: Make sure the player stats match the scores.
4: Don't forget to tag everyone ;)`

export function scorelineHandler(args: string, category: any) {
    try {
        const data = scorelineParser(args)
        verifyMatchFact(data, category)

        return ["Gg", true]

        // add values to google sheet
    } catch (err) {
        return [SCORELINE_TIPS, false]
    }
}
