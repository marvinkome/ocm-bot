import { GoogleSpreadsheet, WorksheetGridRange } from "google-spreadsheet"
import { MatchFact } from "./types"

type SheetsInfo = {
    sheetsId: string
    fixturesTab: string
    cardsTab: string
    playerStatsTab: string
}

export class SheetsIntegration {
    doc: GoogleSpreadsheet
    sheetsInfo: SheetsInfo

    constructor(data: SheetsInfo) {
        this.sheetsInfo = data
        this.doc = new GoogleSpreadsheet(data.sheetsId)

        // @ts-ignore
        return (async () => {
            await this.authorize()
            return this
        })()
    }

    async authorize() {
        await this.doc.useServiceAccountAuth(require("../service-key.json"))
        await this.doc.loadInfo()
    }

    async updateScoreline(scores: MatchFact["scores"]) {
        const sheet = this.doc.sheetsById[this.sheetsInfo.fixturesTab]

        const rows = await sheet.getRows()
        // @ts-ignore
        await sheet.loadCells()

        for (const row of rows) {
            // get teams in this cells
            const home = sheet.getCellByA1(`D${row.rowIndex}`).value
            const away = sheet.getCellByA1(`G${row.rowIndex}`).value

            if (scores.home.team !== home || scores.away.team !== away) {
                continue
            }

            // update
            const homeTeamScoreCell = sheet.getCellByA1(`E${row.rowIndex}`)
            const awayTeamScoreCell = sheet.getCellByA1(`F${row.rowIndex}`)

            homeTeamScoreCell.value = scores.home.score
            awayTeamScoreCell.value = scores.away.score

            await sheet.saveUpdatedCells()
            console.log("Updated scoreline")
        }
    }

    async updatePlayerStats(stats: MatchFact["stats"]) {
        const sheet = this.doc.sheetsById[this.sheetsInfo.playerStatsTab]
        const players = Object.keys(stats)

        const rows = await sheet.getRows()

        await sheet.loadCells({
            startRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 15,
            endRowIndex: 300,
        } as WorksheetGridRange)

        // find and update goals
        for (const row of rows) {
            // get players in a cell
            const rowGoalScorer = sheet.getCellByA1(`B${row.rowIndex}`).value as string
            const rowGoalScorerTeam = sheet.getCellByA1(`D${row.rowIndex}`).value as string

            const rowAssist = sheet.getCellByA1(`G${row.rowIndex}`).value as string
            const rowAssistTeam = sheet.getCellByA1(`I${row.rowIndex}`).value as string

            const rowMotm = sheet.getCellByA1(`L${row.rowIndex}`).value as string
            const rowMotmTeam = sheet.getCellByA1(`N${row.rowIndex}`).value as string

            // find and update goals
            const goalScorer = players.find(
                (player) => player === rowGoalScorer && (stats[player].goals || 0) > 0
            )
            if (goalScorer && stats[goalScorer].team === rowGoalScorerTeam) {
                const cell = sheet.getCellByA1(`C${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + stats[goalScorer].goals!
                stats[goalScorer].goals = 0
            }

            // find and update assist
            const assist = players.find(
                (player) => player === rowAssist && (stats[player].assists || 0) > 0
            )
            if (assist && stats[assist].team === rowAssistTeam) {
                const cell = sheet.getCellByA1(`H${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + stats[assist].assists!
                stats[assist].assists = 0
            }

            // find and update motm
            const motm = players.find((player) => player === rowMotm && stats[player].motm)
            if (motm && stats[motm].team === rowMotmTeam) {
                const cell = sheet.getCellByA1(`M${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + 1
                stats[motm].motm = false
            }

            // add new player if rows are empty
            const freeGoalPlayer = players.find((key) => stats[key].goals)
            if (!rowGoalScorer && freeGoalPlayer) {
                const nameCell = sheet.getCellByA1(`B${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`C${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`D${row.rowIndex}`)

                nameCell.value = freeGoalPlayer
                valueCell.value = stats[freeGoalPlayer].goals as number
                teamCell.value = stats[freeGoalPlayer].team

                stats[freeGoalPlayer].goals = 0
            }

            // add new player if rows are empty
            const freeAssistPlayer = players.find((key) => stats[key].assists)
            if (!rowAssist && freeAssistPlayer) {
                const nameCell = sheet.getCellByA1(`G${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`H${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`I${row.rowIndex}`)

                nameCell.value = freeAssistPlayer
                valueCell.value = stats[freeAssistPlayer].assists as number
                teamCell.value = stats[freeAssistPlayer].team

                stats[freeAssistPlayer].assists = 0
            }

            // add new player if rows are empty
            const freeMotmPlayer = players.find((key) => stats[key].motm)
            if (!rowMotm && freeMotmPlayer) {
                const nameCell = sheet.getCellByA1(`L${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`M${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`N${row.rowIndex}`)

                nameCell.value = freeMotmPlayer
                valueCell.value = ((valueCell.value as number) || 0) + 1
                teamCell.value = stats[freeMotmPlayer].team

                stats[freeMotmPlayer].motm = false
            }

            // if all rows are empty and no more free players then break
            if (
                !rowGoalScorer &&
                !rowAssist &&
                !rowMotm &&
                !freeGoalPlayer &&
                !freeAssistPlayer &&
                !freeMotmPlayer
            ) {
                break
            }
        }

        await sheet.saveUpdatedCells()
        console.log("Updated player stats")
    }

    async updatePlayerCard(stats: MatchFact["stats"]) {
        const sheet = this.doc.sheetsById[this.sheetsInfo.cardsTab]
        const players = Object.keys(stats)

        const rows = await sheet.getRows()

        await sheet.loadCells({
            startRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 15,
            endRowIndex: 70,
        } as WorksheetGridRange)

        // find and update stats
        for (const row of rows) {
            // get players in a cell
            const rowYellowCardPlayer = sheet.getCellByA1(`B${row.rowIndex}`).value as string
            const rowYellowCardPlayerTeam = sheet.getCellByA1(`D${row.rowIndex}`).value as string

            const rowReadCardPlayer = sheet.getCellByA1(`G${row.rowIndex}`).value as string
            const rowReadCardPlayerTeam = sheet.getCellByA1(`I${row.rowIndex}`).value as string

            const rowCleanSheetPlayer = sheet.getCellByA1(`L${row.rowIndex}`).value as string
            const rowCleanSheetPlayerTeam = sheet.getCellByA1(`N${row.rowIndex}`).value as string

            // find and update yellow card
            const yellowCardPlayer = players.find(
                (player) => player === rowYellowCardPlayer && (stats[player].yellowCard || 0) > 0
            )
            if (yellowCardPlayer && stats[yellowCardPlayer].team === rowYellowCardPlayerTeam) {
                const cell = sheet.getCellByA1(`C${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + stats[yellowCardPlayer].yellowCard!
                stats[yellowCardPlayer].yellowCard = 0
            }

            // find and update red card
            const redCardPlayer = players.find(
                (player) => player === rowReadCardPlayer && (stats[player].redCard || 0) > 0
            )
            if (redCardPlayer && stats[redCardPlayer].team === rowReadCardPlayerTeam) {
                const cell = sheet.getCellByA1(`H${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + stats[redCardPlayer].redCard!
                stats[redCardPlayer].redCard = 0
            }

            // find and update clean sheet
            const cleanSheetPlayer = players.find(
                (player) => player === rowCleanSheetPlayer && stats[player].cleanSheet
            )
            if (cleanSheetPlayer && stats[cleanSheetPlayer].team === rowCleanSheetPlayerTeam) {
                const cell = sheet.getCellByA1(`M${row.rowIndex}`)
                cell.value = ((cell.value as number) || 0) + 1
                stats[cleanSheetPlayer].cleanSheet = false
            }

            // add new player if rows are empty
            const freeYellowCardPlayer = players.find((key) => stats[key].yellowCard)
            if (!rowYellowCardPlayer && freeYellowCardPlayer) {
                const nameCell = sheet.getCellByA1(`B${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`C${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`D${row.rowIndex}`)

                nameCell.value = freeYellowCardPlayer
                valueCell.value = stats[freeYellowCardPlayer].yellowCard as number
                teamCell.value = stats[freeYellowCardPlayer].team

                stats[freeYellowCardPlayer].goals = 0
            }

            // add new player if rows are empty
            const freeRedCardPlayer = players.find((key) => stats[key].redCard)
            if (!rowReadCardPlayer && freeRedCardPlayer) {
                const nameCell = sheet.getCellByA1(`G${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`H${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`I${row.rowIndex}`)

                nameCell.value = freeRedCardPlayer
                valueCell.value = stats[freeRedCardPlayer].assists as number
                teamCell.value = stats[freeRedCardPlayer].team

                stats[freeRedCardPlayer].redCard = 0
            }

            // add new player if rows are empty
            const freeCleanSheetPlayer = players.find((key) => stats[key].cleanSheet)
            if (!rowCleanSheetPlayer && freeCleanSheetPlayer) {
                const nameCell = sheet.getCellByA1(`L${row.rowIndex}`)
                const valueCell = sheet.getCellByA1(`M${row.rowIndex}`)
                const teamCell = sheet.getCellByA1(`N${row.rowIndex}`)

                nameCell.value = freeCleanSheetPlayer
                valueCell.value = ((valueCell.value as number) || 0) + 1
                teamCell.value = stats[freeCleanSheetPlayer].team

                stats[freeCleanSheetPlayer].cleanSheet = false
            }

            // if all rows are empty and no more free players then break
            if (
                !rowYellowCardPlayer &&
                !rowReadCardPlayer &&
                !rowCleanSheetPlayer &&
                !freeYellowCardPlayer &&
                !freeRedCardPlayer &&
                !freeCleanSheetPlayer
            ) {
                break
            }
        }

        await sheet.saveUpdatedCells()
        console.log("Updated player cards")
    }
}
