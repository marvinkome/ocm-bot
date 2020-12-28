import { removeEmoji, verifyMatchFact } from "../src/helpers"

describe("Helpers", () => {
    test("removeEmoji", () => {
        expect(removeEmoji("🔴championship")).toBe("championship")
        expect(removeEmoji("🅿 Premier League")).toBe("Premier League")
    })

    test("verifyMatchFact", () => {
        const data = {
            scores: {
                home: {
                    team: "Brentford",
                    score: 2,
                },
                away: {
                    team: "Queens Park Rangers",
                    score: 3,
                },
            },
            stats: {
                "Adam Smith": { goals: 1, assists: 1, team: "Brentford" },
                "P.Fake": { goals: 1, assists: 1, team: "Brentford" },
                Player: { yellowCard: 1, team: "Brentford" },
                Shodipo: { goals: 3, team: "Queens Park Rangers" },
                "P.Smyth": { assists: 2, team: "Queens Park Rangers" },
                "Osayi-Samuel": { redCard: 1, team: "Queens Park Rangers", motm: true },
            },
        }

        expect(verifyMatchFact(data, "championship")).toBe(true)

        data.scores.away.team = "QPR"
        try {
            verifyMatchFact(data, "championship")
        } catch (err) {
            expect(err).toBeDefined()
        }

        data.scores.away.team = "Wolves"
        data.scores.away.score = 0
        try {
            verifyMatchFact(data, "premier league")
        } catch (err) {
            expect(err).toBeDefined()
        }

        data.scores.away.score = 2
        data.stats = {
            Chelsea: {
                "Inaki Williams": { goals: 2 },
                "Timo Werner": { goals: 1 },
                "Hakim Ziyech": { goals: 1, assists: 1 },
                "Christian Pulisic": { assists: 1 },
            },
        } as any

        try {
            verifyMatchFact(data, "premier league")
        } catch (err) {
            expect(err).toBeDefined()
        }
    })
})
