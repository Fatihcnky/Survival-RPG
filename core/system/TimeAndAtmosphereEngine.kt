package com.survivalrpg.core.system

enum class GameSpeed(val multiplier: Float, val label: String) {
    PAUSED(0f, "||"),
    NORMAL(1f, "1x"),
    FAST(2f, "2x"),
    ULTRA(3f, "3x")
}

enum class Season(val displayName: String, val baseTempCelsius: Int) {
    SPRING("İlkbahar", 16),
    SUMMER("Yaz", 27),
    AUTUMN("Sonbahar", 13),
    WINTER("Kış", -3);

    fun next(): Season = entries[(ordinal + 1) % entries.size]
}

enum class WeatherType(val displayName: String, val tempOffset: Int, val workSpeedMultiplier: Float) {
    CLEAR("Açık", 2, 1.05f),
    CLOUDY("Parçalı Bulutlu", 0, 1.0f),
    RAIN("Yağmurlu", -3, 0.90f),
    SNOW("Karlı", -6, 0.80f),
    GOLDEN_BREEZE("Ilık Esinti", 1, 1.15f)
}

data class AtmosphereRenderState(
    val overlayColorArgb: Long,
    val warmWindowLightAlpha: Float,
    val fireflyAlpha: Float,
    val isNightTime: Boolean
)

class TimeAndAtmosphereEngine(
    val daysPerSeason: Int = 8,
    val realSecondsPerGameDay: Float = 180f,
    private val onDayChanged: (year: Int, season: Season, day: Int) -> Unit,
    private val onSeasonChanged: (year: Int, newSeason: Season) -> Unit
) {
    var currentSpeed: GameSpeed = GameSpeed.NORMAL
        private set

    var year: Int = 1
        private set
    var season: Season = Season.SPRING
        private set
    var dayInSeason: Int = 1
        private set
    var hourOfDay: Float = 8.0f
        private set

    var currentWeather: WeatherType = WeatherType.CLEAR
        private set

    val currentTemperature: Int
        get() {
            val diurnalCurve = when {
                hourOfDay in 12f..16f -> 3
                hourOfDay in 0f..5f -> -4
                else -> 0
            }
            return season.baseTempCelsius + currentWeather.tempOffset + diurnalCurve
        }

    fun setSpeed(speed: GameSpeed) {
        currentSpeed = speed
    }

    fun togglePause(): GameSpeed {
        currentSpeed = if (currentSpeed == GameSpeed.PAUSED) GameSpeed.NORMAL else GameSpeed.PAUSED
        return currentSpeed
    }

    fun update(deltaSeconds: Float) {
        if (currentSpeed == GameSpeed.PAUSED || deltaSeconds <= 0f) return

        val effectiveDelta = deltaSeconds * currentSpeed.multiplier
        val hoursPerRealSecond = 24f / realSecondsPerGameDay
        hourOfDay += effectiveDelta * hoursPerRealSecond

        if (hourOfDay >= 24f) {
            hourOfDay -= 24f
            advanceDay()
        }
    }

    private fun advanceDay() {
        dayInSeason++
        if (dayInSeason > daysPerSeason) {
            dayInSeason = 1
            val nextSeason = season.next()
            if (nextSeason == Season.SPRING) {
                year++
            }
            season = nextSeason
            rollWeatherForSeason()
            onSeasonChanged(year, season)
        } else {
            rollWeatherForSeason()
        }
        onDayChanged(year, season, dayInSeason)
    }

    private fun rollWeatherForSeason() {
        val roll = (0..100).random()
        currentWeather = when (season) {
            Season.SPRING -> when {
                roll < 45 -> WeatherType.CLEAR
                roll < 75 -> WeatherType.GOLDEN_BREEZE
                else -> WeatherType.RAIN
            }
            Season.SUMMER -> when {
                roll < 65 -> WeatherType.CLEAR
                roll < 90 -> WeatherType.GOLDEN_BREEZE
                else -> WeatherType.RAIN
            }
            Season.AUTUMN -> when {
                roll < 40 -> WeatherType.CLOUDY
                roll < 75 -> WeatherType.CLEAR
                else -> WeatherType.RAIN
            }
            Season.WINTER -> when {
                roll < 50 -> WeatherType.SNOW
                roll < 80 -> WeatherType.CLOUDY
                else -> WeatherType.CLEAR
            }
        }
    }

    fun getAtmosphereRenderState(): AtmosphereRenderState {
        return when {
            hourOfDay in 7.0f..17.5f -> AtmosphereRenderState(
                overlayColorArgb = 0x00000000L,
                warmWindowLightAlpha = 0f,
                fireflyAlpha = 0f,
                isNightTime = false
            )
            hourOfDay in 17.5f..20.0f -> {
                val t = (hourOfDay - 17.5f) / 2.5f
                val alpha = (t * 0x55).toInt()
                val color = (alpha.toLong() shl 24) or 0x002B192EL
                AtmosphereRenderState(
                    overlayColorArgb = color,
                    warmWindowLightAlpha = t,
                    fireflyAlpha = if (season == Season.SUMMER || season == Season.SPRING) t * 0.6f else 0f,
                    isNightTime = false
                )
            }
            hourOfDay >= 20.0f || hourOfDay < 5.0f -> AtmosphereRenderState(
                overlayColorArgb = 0x680E162BL,
                warmWindowLightAlpha = 1.0f,
                fireflyAlpha = if (season == Season.SUMMER || season == Season.SPRING) 0.9f else 0f,
                isNightTime = true
            )
            else -> {
                val t = 1f - ((hourOfDay - 5.0f) / 2.0f)
                val alpha = (t * 0x68).toInt()
                val color = (alpha.toLong() shl 24) or 0x000E162BL
                AtmosphereRenderState(
                    overlayColorArgb = color,
                    warmWindowLightAlpha = t,
                    fireflyAlpha = 0f,
                    isNightTime = false
                )
            }
        }
    }

    fun formatCalendarText(ageName: String, settlementTier: String): String {
        val hh = hourOfDay.toInt().toString().padStart(2, '0')
        val mm = (((hourOfDay % 1f) * 60).toInt() / 15 * 15).toString().padStart(2, '0')
        return "Yıl $year · ${season.displayName} · Gün $dayInSeason ($hh:$mm) · $ageName · $settlementTier"
    }

    fun restoreState(year: Int, season: Season, day: Int, hour: Float, weather: WeatherType) {
        this.year = year
        this.season = season
        this.dayInSeason = day
        this.hourOfDay = hour
        this.currentWeather = weather
    }
}
