import teams from "../teams.json"

export type League = keyof typeof teams
export type MatchFact = {
    scores: {
        home: { team: string; score: number }
        away: { team: string; score: number }
    }
    stats: {
        [key: string]: {
            goals?: number
            assists?: number
            redCard?: number
            yellowCard?: number
            team: string
            cleanSheet?: boolean
            motm?: boolean
        }
    }
}
