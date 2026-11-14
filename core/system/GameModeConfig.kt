package com.survivalrpg.core.system

enum class GameMode(val displayName: String, val description: String) {
    PEACEFUL_VALLEY(
        displayName = "Huzurlu Vadi",
        description = "Savaş ve vergi baskısı yoktur. Tarım, dekorasyon, aile ve ticarete odaklanın."
    ),
    COZY_FEUDAL(
        displayName = "Sakin Derebeylik",
        description = "Köyünüze baskın yapılmaz. Sadece siz istediğinizde haritadaki kampları keşfedebilirsiniz."
    ),
    CLASSIC_DYNASTY(
        displayName = "Klasik Hanedan",
        description = "Tam diplomasi, kraliyet vergileri ve savunma mekanikleri aktiftir."
    )
}

data class GameRules(
    val mode: GameMode,
    val allowRandomBanditRaids: Boolean,
    val allowOptInExpeditions: Boolean,
    val royalTaxEnabled: Boolean,
    val lethalStarvationAndCold: Boolean,
    val timedQuestsEnabled: Boolean,
    val winterWoodMultiplier: Float,
    val cropGrowthMultiplier: Float,
    val villagerHappinessDecayRate: Float
) {
    companion object {
        fun fromMode(mode: GameMode): GameRules = when (mode) {
            GameMode.PEACEFUL_VALLEY -> GameRules(
                mode = mode,
                allowRandomBanditRaids = false,
                allowOptInExpeditions = false,
                royalTaxEnabled = false,
                lethalStarvationAndCold = false,
                timedQuestsEnabled = false,
                winterWoodMultiplier = 1.5f,
                cropGrowthMultiplier = 1.25f,
                villagerHappinessDecayRate = 0.5f
            )
            GameMode.COZY_FEUDAL -> GameRules(
                mode = mode,
                allowRandomBanditRaids = false,
                allowOptInExpeditions = true,
                royalTaxEnabled = false,
                lethalStarvationAndCold = false,
                timedQuestsEnabled = false,
                winterWoodMultiplier = 2.0f,
                cropGrowthMultiplier = 1.0f,
                villagerHappinessDecayRate = 0.8f
            )
            GameMode.CLASSIC_DYNASTY -> GameRules(
                mode = mode,
                allowRandomBanditRaids = true,
                allowOptInExpeditions = true,
                royalTaxEnabled = true,
                lethalStarvationAndCold = true,
                timedQuestsEnabled = true,
                winterWoodMultiplier = 3.0f,
                cropGrowthMultiplier = 1.0f,
                villagerHappinessDecayRate = 1.0f
            )
        }
    }
}
