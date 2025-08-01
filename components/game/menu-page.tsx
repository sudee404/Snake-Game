"use client"

import { Button } from "@/components/ui/button"
import { Play, Settings, Award, BarChart2, HelpCircle, Hammer } from "lucide-react" // Import Hammer icon
import type { Achievement, GameStats, ThemePalette, DailyChallenge } from "@/lib/game-constants"
import { TOOLS_DATA } from "@/lib/game-constants"

interface MenuPageProps {
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

export function MenuPage({
  navigateToPage,
  currentTheme,
  currency, // Destructure currency
  equippedTool, // Destructure equippedTool
  unlockedTools, // Destructure startGameSession
}: MenuPageProps) {
  const equippedToolData = equippedTool ? TOOLS_DATA.find((t) => t.id === equippedTool) : null
  const equippedToolUses = equippedToolData ? unlockedTools.find((t) => t.id === equippedTool)?.uses : 0

  return (
    <div
      className={`h-screen flex flex-col items-center justify-center overflow-hidden ${currentTheme.primaryBgClasses} p-6`}
    >
      <div className="text-center mb-12">
        <h1
          className={`text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient} mb-2`}
        >
          SERPENTINE ODYSSEY
        </h1>
        <p className={`text-lg md:text-xl font-medium ${currentTheme.textMuted}`}>A Journey of Skill and Reflexes</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl px-4">
        <Button
          onClick={() => navigateToPage("mode")} // Navigate to modes page
          size="lg"
          className={`h-14 text-xl font-semibold bg-gradient-to-r ${currentTheme.successGradient} ${currentTheme.buttonPrimaryTextColor} hover:scale-105 transition-all shadow-lg`}
        >
          <Play className="w-7 h-7 mr-3" />
          Play Game
        </Button>

        <Button
          onClick={() => navigateToPage("tools")} // New button for Tools
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Hammer className="w-6 h-6 mr-3" />
          Tools ({currency} 🪙)
          {equippedToolData && (
            <span className="ml-2 text-xs text-emerald-400">
              ({equippedToolData.name} {equippedToolUses && equippedToolUses > 0 ? `(${equippedToolUses} uses)` : "(Used)"})
            </span>
          )}
        </Button>

        <Button
          onClick={() => navigateToPage("settings")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Settings className="w-6 h-6 mr-3" />
          Settings
        </Button>

        <Button
          onClick={() => navigateToPage("achievements")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <Award className="w-6 h-6 mr-3" />
          Achievements
        </Button>

        <Button
          onClick={() => navigateToPage("stats")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <BarChart2 className="w-6 h-6 mr-3" />
          Statistics
        </Button>

        <Button
          onClick={() => navigateToPage("help")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all shadow-md`}
        >
          <HelpCircle className="w-6 h-6 mr-3" />
          Help & How to Play
        </Button>
      </div>
    </div>
  )
}
