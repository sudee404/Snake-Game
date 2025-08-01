"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import type { Achievement, ThemePalette } from "@/lib/game-constants"

interface AchievementsPageProps {
  navigateToPage: (page: string) => void
  overallAchievements: Achievement[]
  currentTheme: ThemePalette
}

export function AchievementsPage({ navigateToPage, overallAchievements, currentTheme }: AchievementsPageProps) {
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
        <h1 className="text-xl font-bold">Achievements</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {overallAchievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex items-center gap-4`}
            >
              <div
                className={`p-3 rounded-full ${
                  achievement.unlocked ? currentTheme.badgeUnlockedBg : currentTheme.badgeLockedBg
                } ${achievement.unlocked ? currentTheme.buttonPrimaryTextColor : "text-white"} flex items-center justify-center`}
              >
                {achievement.icon}
              </div>
              <div>
                <h3
                  className={`text-lg font-bold ${achievement.unlocked ? currentTheme.highlight2 : currentTheme.textPrimary}`}
                >
                  {achievement.name}
                </h3>
                <p className={`text-sm ${currentTheme.textMuted}`}>{achievement.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
