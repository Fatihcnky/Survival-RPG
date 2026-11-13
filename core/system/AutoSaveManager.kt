package com.survivalrpg.core.system

import java.io.File

data class SaveSlotMetadata(
    val slotId: String,
    val title: String,
    val summary: String,
    val timestampMillis: Long,
    val isAutoSave: Boolean
)

class AutoSaveManager(private val saveDirectory: File) {

    init {
        if (!saveDirectory.exists()) {
            saveDirectory.mkdirs()
        }
    }

    fun onAppPaused(timeEngine: TimeAndAtmosphereEngine, serializeGameStateJson: () -> String) {
        timeEngine.setSpeed(GameSpeed.PAUSED)
        val jsonPayload = serializeGameStateJson()
        writeAtomic(File(saveDirectory, "autosave_instant.json"), jsonPayload)
    }

    fun onSeasonMilestone(year: Int, season: Season, serializeGameStateJson: () -> String) {
        val jsonPayload = serializeGameStateJson()
        val fileName = "autosave_Y${year}_${season.name}.json"
        writeAtomic(File(saveDirectory, fileName), jsonPayload)
        pruneOldSeasonSaves(maxKeep = 3)
    }

    fun saveManualSlot(slotIndex: Int, serializeGameStateJson: () -> String) {
        require(slotIndex in 1..3) { "Manuel kayıt slotu 1-3 arasında olmalıdır." }
        val jsonPayload = serializeGameStateJson()
        writeAtomic(File(saveDirectory, "manual_slot_$slotIndex.json"), jsonPayload)
    }

    fun loadSaveFile(fileName: String): String? {
        val file = File(saveDirectory, fileName)
        return if (file.exists() && file.length() > 0L) file.readText(Charsets.UTF_8) else null
    }

    private fun writeAtomic(targetFile: File, content: String) {
        val tempFile = File(saveDirectory, "${targetFile.name}.tmp")
        tempFile.writeText(content, Charsets.UTF_8)
        if (targetFile.exists()) {
            targetFile.delete()
        }
        tempFile.renameTo(targetFile)
    }

    private fun pruneOldSeasonSaves(maxKeep: Int) {
        val seasonFiles = saveDirectory.listFiles { _, name ->
            name.startsWith("autosave_Y") && name.endsWith(".json")
        }?.sortedByDescending { it.lastModified() } ?: return

        if (seasonFiles.size > maxKeep) {
            seasonFiles.drop(maxKeep).forEach { it.delete() }
        }
    }
}
