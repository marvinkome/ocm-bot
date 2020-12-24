import { trim } from "lodash"
export const emojiRegexp = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/g

class LineParser {
    chars: string[]

    constructor(line: string) {
        this.chars = Array.from(line)
    }

    nextChar() {
        return this.chars[0]
    }

    eol() {
        return this.chars.length === 0
    }

    consumeChar() {
        const currentChar = this.chars.shift()
        return currentChar
    }

    consumeWhile(test: (char: string) => boolean) {
        let result = ""

        while (!this.eol() && test(this.nextChar())) {
            result = result + this.consumeChar()
        }

        return result
    }

    consumeWhiteSpace() {
        return this.consumeWhile((char) => char === " ")
    }

    static parseMatchScore(line: string) {
        const parser = new LineParser(line)

        const homeTeam = parser.consumeWhile((char) => isNaN(parseInt(char, 10))).trim()
        const homeTeamScore = parser.consumeWhile((char) => !isNaN(parseInt(char, 10)))

        parser.consumeWhile((char) => !/^[a-zA-Z0-9]+$/i.test(char))

        const awayTeamScore = parser.consumeWhile((char) => !isNaN(parseInt(char, 10)))
        const awayTeam = parser.consumeWhile((char) => isNaN(parseInt(char, 10))).trim()

        return {
            home: {
                team: trim(homeTeam, "*"),
                score: parseInt(homeTeamScore, 10),
            },
            away: {
                team: trim(awayTeam, "*"),
                score: parseInt(awayTeamScore, 10),
            },
        }
    }

    static parsePlayerStats(lines: string[]) {
        let currentTeam = ""
        const result: any = {}

        for (const line of lines) {
            if (!emojiRegexp.test(line)) {
                currentTeam = trim(line.trim(), "*")
            } else {
                const parser = new LineParser(line)

                const playerName = parser.consumeWhile((char) => !emojiRegexp.test(char)).trim()

                const stats = parser.chars.reduce((total: any, char) => {
                    if (char.codePointAt(0) === "⚽️".codePointAt(0)) {
                        total.goals = (total.goals || 0) + 1
                    }

                    if (char.codePointAt(0) === "🅰️".codePointAt(0)) {
                        total.assists = (total.assists || 0) + 1
                    }

                    if (char.codePointAt(0) === "🟥".codePointAt(0)) {
                        total.redCard = (total.redCard || 0) + 1
                    }

                    if (char.codePointAt(0) === "🟨".codePointAt(0)) {
                        total.yellowCard = (total.yellowCard || 0) + 1
                    }

                    return total
                }, {})

                result[currentTeam] = {
                    ...result[currentTeam],
                    [playerName]: stats,
                }
            }
        }

        return result
    }

    static parseMOTM(initLine: string) {
        const line = initLine.split("MOTM")[1].trim()

        const parser = new LineParser(line)
        const playerName = parser.consumeWhile((char) => /^[a-zA-Z-\s]+$/i.test(char)).trim()

        return playerName
    }
}

export function scorelineParser(scoreline: string) {
    const scorelineArray = scoreline
        .split("\n")
        .map((word) => word.trim())
        .filter((word) => word.length > 0)

    scorelineArray.pop() // remove the @everyone tag

    // get the match score
    const matchScores = LineParser.parseMatchScore(scorelineArray.shift()!)

    // get MOTM
    const motm = LineParser.parseMOTM(scorelineArray.pop()!)

    // get the player stats
    const playerStats = LineParser.parsePlayerStats(scorelineArray)

    return {
        scores: matchScores,
        stats: playerStats,
        motm,
    }
}

export function botParser(message: string) {
    const commandBody = message.trim().slice(1)
    const args = commandBody.split(" ")
    const command = args.shift()?.toLocaleLowerCase()

    return {
        command,
        args: args.join(" "),
    }
}
