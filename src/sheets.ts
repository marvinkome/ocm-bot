import { GoogleSpreadsheet, WorksheetGridRange } from "google-spreadsheet"

const SHEETS_DATA = {
    ocmSheetsId: "1o2kr3218nRU0R1HwiUg_cjwrfnmItCgZN7SS4VW9vzA",
    fixturesTab: "859971328",
    playerStatsTab: "1774202157",
    cardsTab: "1546579554",
}

export class SheetsIntegration {
    doc: GoogleSpreadsheet

    constructor() {
        this.doc = new GoogleSpreadsheet(SHEETS_DATA.ocmSheetsId)

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

    async updateScoreline(scores: {
        home: { team: string; score: number }
        away: { team: string; score: number }
    }) {
        const sheet = this.doc.sheetsById[SHEETS_DATA.fixturesTab]

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

    async updatePlayerStats(stats: {
        [key: string]: {
            goals?: number
            assists?: number
            team: string
            motm?: boolean
        }
    }) {
        const sheet = this.doc.sheetsById[SHEETS_DATA.playerStatsTab]
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
}

// async function main() {
//     console.time("run-time")
//     const mysheets = await new SheetsIntegration()

//     // await mysheets.updateScoreline({
//     //     home: { team: "Brentford", score: 0 },
//     //     away: { team: "Huddersfield Town", score: 7 },
//     // })

//     await mysheets.updatePlayerStats({
//         Chan: { goals: 1, assists: 1, team: "Swansea City", motm: true },
//         Smyth: { goals: 1, team: "Queens Park Rangers" },
//         Kane: { goals: 1, assists: 1, team: "Queens Park Rangers" },
//     })
//     console.timeEnd("run-time")
// }

// try {
//     main()
// } catch (err) {
//     console.log(err)
// }
