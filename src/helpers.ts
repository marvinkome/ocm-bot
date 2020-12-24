import teams from "../teams.json"
import { emojiRegexp } from "./parser"

type MatchFact = {
    scores: {
        home: { team: string; score: number }
        away: { team: string; score: number }
    }
    stats: any
    motm: string
}

type League = keyof typeof teams

export function verifyMatchFact({ scores, stats }: MatchFact, league: League) {
    // verify team names
    const leagueTeams = teams[league]

    if (!leagueTeams.includes(scores.home.team) || !leagueTeams.includes(scores.away.team)) {
        throw Error("")
    }

    // verify player stats for home team
    const { team: teamA, score: teamAScore } = scores.home
    const teamAStatsScore = Object.keys(stats[teamA]).reduce((goals, curr) => {
        const player = stats[teamA][curr]

        return goals + (player.goals || 0)
    }, 0)

    if (teamAStatsScore !== teamAScore) {
        throw Error("")
    }

    // verify player stats for away team
    const { team: teamB, score: teamBScore } = scores.away
    const teamBStatsScore = Object.keys(stats[teamB]).reduce((goals, curr) => {
        const player = stats[teamB][curr]

        return goals + (player.goals || 0)
    }, 0)

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
