package com.survivalrpg.core.system

data class HudVisibilityState(
    val isZenModeActive: Boolean = false,
    val showTopResourceBar: Boolean = true,
    val showQuestBanner: Boolean = true,
    val showMiniMap: Boolean = true,
    val showBottomDock: Boolean = true,
    val focusedNpcId: String? = null
)

class ZenHudController(
    private val timeEngine: TimeAndAtmosphereEngine,
    private val onStateUpdated: (HudVisibilityState) -> Unit
) {
    var state: HudVisibilityState = HudVisibilityState()
        private set

    fun toggleZenMode(followNpcId: String? = null) {
        val enableZen = !state.isZenModeActive
        if (enableZen && timeEngine.currentSpeed == GameSpeed.PAUSED) {
            timeEngine.setSpeed(GameSpeed.NORMAL)
        }
        state = HudVisibilityState(
            isZenModeActive = enableZen,
            showTopResourceBar = !enableZen,
            showQuestBanner = !enableZen,
            showMiniMap = !enableZen,
            showBottomDock = !enableZen,
            focusedNpcId = if (enableZen) followNpcId else null
        )
        onStateUpdated(state)
    }

    fun selectTimeSpeed(speed: GameSpeed) {
        timeEngine.setSpeed(speed)
        onStateUpdated(state)
    }
}
