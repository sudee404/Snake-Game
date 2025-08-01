"use client"

import { Button } from "@/components/ui/button"
import { Play,CalendarDays } from "lucide-react" // Import Hammer icon
import type { Achievement, GameStats, ThemePalette, DailyChallenge } from "@/lib/game-constants"

interface ModePageProps {
  navigateToPage: (page: string) => void
  highScore: number
  overallStats: GameStats
  overallAchievements: Achievement[]
  currentTheme: ThemePalette
  currency: number // New prop
  equippedTool: string | null // New prop
  unlockedTools: Array<{ id: string; uses: number }> // New prop to show uses
  currentDailyChallenge: DailyChallenge | null // New prop
  isDailyChallengeCompleted: boolean // New prop
  startGameSession: (mode: "levels" | "endless" | "coop") => void // New prop
}

export function ModePage({
  navigateToPage,
  currentTheme,
  currentDailyChallenge, // Destructure daily challenge
  isDailyChallengeCompleted, // Destructure daily challenge status
  startGameSession, // Destructure startGameSession
}: ModePageProps) {

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center overflow-hidden ${currentTheme.primaryBgClasses} p-6`}
    >
            {currentDailyChallenge && (
        <div
          className={`mb-8 p-4 rounded-lg ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm text-center w-full max-w-md`}
        >
          <h2 className={`text-xl font-bold mb-2 flex items-center justify-center ${currentTheme.highlight4}`}>
            <CalendarDays className="w-5 h-5 mr-2" />
            Daily Challenge
          </h2>
          <p className={`text-lg ${currentTheme.textPrimary} mb-2`}>{currentDailyChallenge.name}</p>
          <p className={`text-sm ${currentTheme.textMuted}`}>{currentDailyChallenge.description}</p>
          <p
            className={`text-md font-semibold mt-2 ${isDailyChallengeCompleted ? currentTheme.successGradient : currentTheme.dangerGradient}`}
          >
            {isDailyChallengeCompleted ? "COMPLETED!" : "IN PROGRESS"}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
        <Button
          onClick={() => navigateToPage("levelSelect")} // Navigate to levelSelect page
          size="lg"
          className={`h-14 text-xl font-semibold bg-gradient-to-r ${currentTheme.successGradient} ${currentTheme.buttonPrimaryTextColor} hover:scale-105 transition-all shadow-lg`}
        >
          <Play className="w-7 h-7 mr-3" />
          Play Levels
        </Button>

        <Button
          onClick={() => startGameSession("endless")} // Start Endless Mode
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Play className="w-6 h-6 mr-3" />
          Endless Mode
        </Button>

        <Button
          onClick={() => startGameSession("coop")} // Start Bot Race Mode
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Play className="w-6 h-6 mr-3" />
          Bot Race
        </Button>
      </div>
    </div>
  )
}
