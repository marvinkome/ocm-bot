export default {
    botToken: process.env.BOT_TOKEN,
    serviceAccount: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: (process.env.GOOGLE_PRIVATE_KEY as string).replace(/\\n/g, "\n"),
    },
    sheets: {
        championship: {
            sheetsId: "1o2kr3218nRU0R1HwiUg_cjwrfnmItCgZN7SS4VW9vzA",
            fixturesTab: "859971328",
            cardsTab: "1546579554",
            playerStatsTab: "1774202157",
        },

        "premier league": {
            sheetsId: "1o2kr3218nRU0R1HwiUg_cjwrfnmItCgZN7SS4VW9vzA",
            fixturesTab: "859971328",
            cardsTab: "1546579554",
            playerStatsTab: "1774202157",
        },
    },
}
