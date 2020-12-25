import teams from "../teams.json"
import { emojiRegexp } from "./parser"

export type MatchFact = {
    scores: {
        home: { team: string; score: number }
        away: { team: string; score: number }
    }
    stats: {
        [key: string]: {
            goals?: number
            assists?: number
            team: string
            motm?: boolean
        }
    }
}

type League = keyof typeof teams

export function verifyMatchFact({ scores, stats }: MatchFact, league: League) {
    // verify team names
    const leagueTeams = teams[league]

    if (!leagueTeams.includes(scores.home.team) || !leagueTeams.includes(scores.away.team)) {
        throw Error("")
    }

    // verify player stats
    const { team: teamA, score: teamAScore } = scores.home
    const { team: teamB, score: teamBScore } = scores.away

    const [teamAStatsScore, teamBStatsScore] = Object.keys(stats).reduce(
        (goals, curr) => {
            const player = stats[curr]
            if (player.team === teamA) {
                goals[0] = goals[0] + (player.goals || 0)
            } else if (player.team === teamB) {
                goals[1] = goals[1] + (player.goals || 0)
            }

            return goals
        },
        [0, 0]
    )

    if (teamAStatsScore !== teamAScore) {
        throw Error("")
    }

    if (teamBStatsScore !== teamBScore) {
        throw Error("")
    }

    return true
}

export function removeEmoji(word: string) {
    return Array.from(word)
        .filter((char) => !emojiRegexp.test(char))
        .join("")
        .trim()
}
