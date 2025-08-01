"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCcw, Home } from "lucide-react"
import type { ThemePalette } from "@/lib/game-constants"
import { MAX_LIVES } from "@/lib/game-constants"

interface GameOverPageProps {
  score: number
  highScore: number
  snakeLength: number
  difficulty: string
  startGameSession: (mode: "levels" | "endless" | "coop", levelIndex?: number) => void // Updated prop
  navigateToPage: (page: string) => void
  currentTheme: ThemePalette
  lives: number // New prop
  gameMode: "levels" | "endless" | "coop" // New prop
  botScore?: number // New prop for bot score
}

export function GameOverPage({
  score,
  highScore,
  snakeLength,
  difficulty,
  startGameSession,
  navigateToPage,
  currentTheme,
  lives, // Destructure lives
  gameMode, // Destructure gameMode
  botScore, // Destructure botScore
}: GameOverPageProps) {
  const canPlayAgain = lives > 0

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6`}
    >
      <div className="text-center mb-8">
        <h1
          className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.dangerGradient} mb-4`}
        >
          Game Over
        </h1>
        <div className="text-4xl mb-4">🐍</div>
      </div>

      <Card
        className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm mb-8 w-full max-w-md`}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight1}`}>{score}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Your Score</div>
          </div>
          {gameMode === "coop" && botScore !== undefined && (
            <div>
              <div className={`text-2xl font-bold ${currentTheme.highlight2}`}>{botScore}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Bot Score</div>
            </div>
          )}
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight3}`}>{snakeLength}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Length</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight4}`}>{difficulty}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Difficulty</div>
          </div>
        </div>

        {score === highScore && score > 0 && (
          <div className={`text-center mt-4 ${currentTheme.highlight4} font-bold animate-pulse`}>
            🎉 New High Score! 🎉
          </div>
        )}

        <div className="text-center mt-4">
          <span className={`text-lg font-bold ${currentTheme.textPrimary}`}>Lives Remaining: </span>
          <span className={`text-xl font-bold ${lives > 0 ? currentTheme.highlight1 : currentTheme.dangerGradient}`}>
            {lives} / {MAX_LIVES} ❤️
          </span>
          {!canPlayAgain && (
            <p className={`text-sm ${currentTheme.textMuted} mt-2`}>
              Out of lives! Wait for regeneration or buy more from the Tools Store.
            </p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 w-full max-w-xs sm:max-w-md">
        {" "}
        {/* Adjusted max-w for better button layout */}
        <Button
          onClick={() => startGameSession(gameMode)} // Pass current game mode
          size="lg"
          className={`h-14 text-xl bg-gradient-to-r ${
            canPlayAgain ? currentTheme.successGradient : "from-gray-500 to-gray-600 cursor-not-allowed"
          } ${currentTheme.buttonPrimaryTextColor} font-semibold hover:scale-105 transition-all shadow-lg`}
          disabled={!canPlayAgain}
        >
          <RotateCcw className="w-6 h-6 mr-3" />
          Play Again
        </Button>
        <Button
          onClick={() => navigateToPage("menu")}
          variant="outline"
          size="lg"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Home className="w-6 h-6 mr-3" />
          Menu
        </Button>
      </div>
    </div>
  )
}
