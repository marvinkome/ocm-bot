import { removeEmoji, verifyMatchFact } from "../src/helpers"

describe("Helpers", () => {
    test("removeEmoji", () => {
        expect(removeEmoji("🔴 championship")).toBe("championship")
        expect(removeEmoji("🅿 Premier League")).toBe("Premier League")
    })

    test("verifyMatchFact", () => {
        const data = {
            scores: {
                home: { team: "Chelsea", score: 4 },
                away: { team: "Wolves", score: 1 },
            },
            stats: {
                Chelsea: {
                    "Inaki Williams": { goals: 2 },
                    "Timo Werner": { goals: 1 },
                    "Hakim Ziyech": { goals: 1, assists: 1 },
                    "Christian Pulisic": { assists: 1 },
                },
                Wolves: { Podence: { goals: 1 }, Vinicius: { assists: 1 } },
            },
            motm: "Inaki Williams",
        }

        expect(verifyMatchFact(data, "premier league")).toBe(true)

        data.scores.away.team = "Wolverham"
        try {
            verifyMatchFact(data, "premier league")
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
