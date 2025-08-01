"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Play, RotateCcw } from "lucide-react"
import type { ThemePalette, LevelData } from "@/lib/game-constants"
import { LEVEL_DATA } from "@/lib/game-constants"

interface LevelStartPageProps {
  navigateToPage: (page: string) => void
  startGameSession: () => void // To start a brand new game from Level 1
  resumeGame: () => void // To resume a paused game
  currentTheme: ThemePalette
  level: number
  score: number // Keep score prop for logic, but not display
  gameState: "playing" | "paused"
  currentLevelTargetScore: number
}

export function LevelStartPage({
  navigateToPage,
  startGameSession,
  resumeGame,
  currentTheme,
  level,
  score,
  gameState,
  currentLevelTargetScore,
}: LevelStartPageProps) {
  const currentLevelData: LevelData = LEVEL_DATA[level] || LEVEL_DATA[LEVEL_DATA.length - 1] // Fallback to last level if out of bounds

  // Determine button text based on game state and level
  const isNewGameSession = level === 0 && score === 0 // True if starting a completely new game
  const isLevelUpTransition = level > 0 && gameState === "paused" // True if paused due to level up
  const isPausedMidLevel = gameState === "paused" && score > 0 && level === 0 // True if paused on level 0

  let primaryButtonText = "Start Level"
  let primaryButtonAction = resumeGame // Default action

  if (isNewGameSession) {
    primaryButtonText = "Start Game"
    primaryButtonAction = startGameSession
  } else if (isLevelUpTransition) {
    primaryButtonText = `Continue` // Changed to simply "Continue"
    primaryButtonAction = resumeGame
  } else if (isPausedMidLevel) {
    primaryButtonText = "Resume Game"
    primaryButtonAction = resumeGame
  }

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6 ${currentTheme.textPrimary}`}
    >
      <div className="text-center mb-8">
        <h1
          className={`text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient} mb-2`}
        >
          {isNewGameSession ? "Serpentine Odyssey" : `Level ${level + 1}`}
        </h1>
        <p className={`text-lg md:text-xl ${currentTheme.textMuted}`}>
          {isNewGameSession ? "A Journey of Skill and Reflexes" : "Prepare for the next challenge!"}
        </p>
      </div>

      <Card
        className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm mb-8 w-full max-w-md`}
      >
        <h2 className="text-xl font-bold mb-4 text-center">{isNewGameSession ? "Game Start" : "Level Up!"}</h2>
        <div className="grid grid-cols-1 gap-4 text-center">
          <div>
            <div className={`text-3xl font-bold ${currentTheme.highlight1}`}>
              {level + 1} / {LEVEL_DATA.length}
            </div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Current Level</div>
          </div>
          <div>
            <div className={`text-3xl font-bold ${currentTheme.highlight2}`}>{currentLevelTargetScore}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Target Score</div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs sm:max-w-md">
        <Button
          onClick={primaryButtonAction}
          size="lg"
          className={`h-14 text-xl bg-gradient-to-r ${currentTheme.successGradient} ${currentTheme.buttonPrimaryTextColor} font-semibold hover:scale-105 transition-all shadow-lg`}
        >
          <Play className="w-6 h-6 mr-3" />
          {primaryButtonText}
        </Button>
        <Button
          onClick={startGameSession} // Always resets to level 1
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <RotateCcw className="w-6 h-6 mr-3" />
          Restart Game
        </Button>
        {/* The "Back to Menu" button is now outside the grid-cols-2 for better centering */}
        <div className="col-span-2 flex justify-center">
          <Button
            onClick={() => navigateToPage("menu")}
            size="lg"
            variant="outline"
            className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md w-full sm:w-auto`}
          >
            <ArrowLeft className="w-6 h-6 mr-3" />
            Back to Menu
          </Button>
        </div>
      </div>
    </div>
  )
}
