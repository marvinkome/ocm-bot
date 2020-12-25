import { botParser, scorelineParser } from "../src/parser"

describe("Parser tests", () => {
    test("simple botParser", () => {
        const { command, args } = botParser("!scores me")

        expect(command).toBe("scores")
        expect(args).toBe("me")
    })

    test("scores botParser", () => {
        const { command } = botParser(`!scores Brentford 2 - 3 QPR`)

        expect(command).toBe("scores")
    })

    test("scoreline parser", () => {
        const scoreline = `
        Brentford 2 - 3 QPR

        Brentford
        Adam Smith ⚽️🅰️
        P.Fake ⚽️🅰️
        Player 🟨

        QPR
        Shodipo ⚽️⚽️⚽️
        P.Smyth 🅰️🅰️
        Osayi-Samuel 🟥

        MOTM Shodipo (10.0)
        @everyone
        `

        const matchFact = scorelineParser(scoreline)

        expect(matchFact).toMatchObject({
            scores: {
                home: {
                    team: "Brentford",
                    score: 2,
                },
                away: {
                    team: "QPR",
                    score: 3,
                },
            },
            stats: {
                "Adam Smith": { goals: 1, assists: 1, team: "Brentford" },
                "P.Fake": { goals: 1, assists: 1, team: "Brentford" },
                Player: { yellowCard: 1, team: "Brentford" },
                Shodipo: { goals: 3, team: "QPR", motm: true },
                "P.Smyth": { assists: 2, team: "QPR" },
                "Osayi-Samuel": { redCard: 1, team: "QPR" },
            },
        })
    })
})
