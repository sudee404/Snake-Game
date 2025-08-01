"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Lock, Play, Heart } from "lucide-react"
import type { ThemePalette } from "@/lib/game-constants"
import { LEVEL_DATA, MAX_LIVES } from "@/lib/game-constants"

interface LevelSelectPageProps {
  navigateToPage: (page: string) => void
  startGameSessionFromLevel: (levelIndex: number) => void
  lastBeatenLevel: number
  currentTheme: ThemePalette
  lives: number // New prop
}

export function LevelSelectPage({
  navigateToPage,
  startGameSessionFromLevel,
  lastBeatenLevel,
  currentTheme,
  lives, // Destructure lives
}: LevelSelectPageProps) {
  const canStartGame = lives > 0

  return (
    <div
      className={`h-screen flex flex-col bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6 ${currentTheme.textPrimary}`}
    >
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => navigateToPage("menu")}
          variant="ghost"
          className={`text-lg ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-xl font-bold">Select Level</h1>
        <div
          className={`px-4 py-2 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex items-center`}
        >
          <Heart className={`w-5 h-5 mr-2 ${currentTheme.highlight1}`} />
          <span className="font-bold text-lg">
            {lives} / {MAX_LIVES}
          </span>
        </div>
      </div>

      {!canStartGame && (
        <div className="text-center text-red-400 font-semibold mb-4">
          You are out of lives! Wait for regeneration or buy more from the Tools Store.
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {LEVEL_DATA.map((levelData, index) => {
            const isUnlocked = index <= lastBeatenLevel + 1 // Unlock current + next level
            const isCurrentLevel = index === lastBeatenLevel + 1 && index < LEVEL_DATA.length

            return (
              <Card
                key={index}
                className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex flex-col items-center justify-center text-center ${
                  !isUnlocked || !canStartGame ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <h2 className={`text-3xl font-bold mb-2 ${currentTheme.highlight1}`}>Level {index + 1}</h2>
                <p className={`text-sm ${currentTheme.textMuted} mb-4`}>Target Score: {levelData.targetScore}</p>
                {!isUnlocked ? (
                  <div className={`text-red-400 flex items-center font-semibold`}>
                    <Lock className="w-5 h-5 mr-2" />
                    Locked
                  </div>
                ) : (
                  <Button
                    onClick={() => startGameSessionFromLevel(index)}
                    className={`bg-gradient-to-r ${
                      canStartGame ? currentTheme.successGradient : "from-gray-500 to-gray-600 cursor-not-allowed"
                    } ${currentTheme.buttonPrimaryTextColor} font-semibold hover:scale-105 transition-all`}
                    disabled={!canStartGame}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    {isCurrentLevel ? "Start Next" : "Play"}
                  </Button>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
