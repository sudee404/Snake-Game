"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, BarChart2 } from "lucide-react" // Import new icons
import type { GameStats, ThemePalette } from "@/lib/game-constants"

interface StatsPageProps {
  navigateToPage: (page: string) => void
  overallStats: GameStats
  highScore: number
  currentTheme: ThemePalette
}

export function StatsPage({ navigateToPage, overallStats, highScore, currentTheme }: StatsPageProps) {
  // Helper to format time from seconds to HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (num: number) => num.toString().padStart(2, "0")

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }

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
        <h1 className="text-xl font-bold">Statistics</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto">
        <Card
          className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm max-w-2xl mx-auto`}
        >
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <BarChart2 className="w-5 h-5 mr-2" />
            Overall Game Stats
          </h2>

          <div className="grid grid-cols-2 gap-6 text-center">
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight1}`}>{highScore}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>High Score (Current Session)</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight2}`}>{overallStats.totalScore}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Total Score (All Games)</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight3}`}>{overallStats.foodEaten}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Total Food Eaten</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight4}`}>{overallStats.maxLength}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Max Snake Length</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight1}`}>{overallStats.gamesPlayed}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Games Played</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight2}`}>{overallStats.levelsCleared}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Levels Cleared</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight3}`}>
                {formatTime(overallStats.totalPlayTime)}
              </div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Total Play Time</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight4}`}>{overallStats.totalDeaths}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Total Deaths</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight1}`}>{overallStats.shrinkPotionsEaten}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Shrink Potions Eaten</div>
            </div>
            <div>
              <div className={`text-3xl font-bold ${currentTheme.highlight2}`}>{overallStats.poisonCuredCount}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>Poison Cured</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
