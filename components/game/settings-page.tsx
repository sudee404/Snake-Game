"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Volume2, VolumeX, Grid3X3, Palette, Gamepad2 } from "lucide-react"
import type { GameSettings, ThemePalette } from "@/lib/game-constants"

interface SettingsPageProps {
  navigateToPage: (page: string) => void
  settings: GameSettings
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>
  currentTheme: ThemePalette
  unlockedThemes: string[] // New prop
}

export function SettingsPage({
  navigateToPage,
  settings,
  setSettings,
  currentTheme,
  unlockedThemes,
}: SettingsPageProps) {
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
        <h1 className="text-xl font-bold">Settings</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Game Settings */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Game
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`text-sm mb-2 block ${currentTheme.textMuted}`}>Difficulty</label>
                <Select
                  value={settings.difficulty}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger
                    className={`h-10 ${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder} ${currentTheme.textPrimary}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`${currentTheme.selectContentBg}`}>
                    <SelectItem
                      value="easy"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Easy - Slow & Forgiving
                    </SelectItem>
                    <SelectItem
                      value="normal"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Normal - Balanced
                    </SelectItem>
                    <SelectItem
                      value="hard"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Hard - Fast Paced
                    </SelectItem>
                    <SelectItem
                      value="insane"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Insane - Lightning Fast
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-2 block ${currentTheme.textMuted}`}>Controls</label>
                <Select
                  value={settings.controlScheme}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, controlScheme: value }))}
                >
                  <SelectTrigger
                    className={`h-10 ${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder} ${currentTheme.textPrimary}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`${currentTheme.selectContentBg}`}>
                    <SelectItem
                      value="wasd"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      WASD Keys
                    </SelectItem>
                    <SelectItem
                      value="arrows"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Arrow Keys
                    </SelectItem>
                    <SelectItem
                      value="both"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Both WASD & Arrows
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className={`text-sm mb-2 block ${currentTheme.textMuted}`}>Snake Theme</label>
                <Select
                  value={settings.snakeTheme}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, snakeTheme: value }))}
                >
                  <SelectTrigger
                    className={`h-10 ${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder} ${currentTheme.textPrimary}`}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={`${currentTheme.selectContentBg}`}>
                    <SelectItem
                      value="aurora"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Aurora - Blue/Cyan
                    </SelectItem>
                    <SelectItem
                      value="ocean"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Ocean - Deep Blue
                    </SelectItem>
                    <SelectItem
                      value="sunset"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Sunset - Orange/Red
                    </SelectItem>
                    <SelectItem
                      value="cosmic"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                    >
                      Cosmic - Purple/Pink
                    </SelectItem>
                    <SelectItem
                      value="neon"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                      disabled={!unlockedThemes.includes("neon")}
                    >
                      Neon - Electric Green/Pink {unlockedThemes.includes("neon") ? "" : "(Locked)"}
                    </SelectItem>
                    <SelectItem
                      value="forest"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                      disabled={!unlockedThemes.includes("forest")}
                    >
                      Forest - Earthy Green/Brown {unlockedThemes.includes("forest") ? "" : "(Locked)"}
                    </SelectItem>
                    <SelectItem
                      value="lava"
                      className={`${currentTheme.textPrimary} ${currentTheme.selectItemHoverBg}`}
                      disabled={!unlockedThemes.includes("lava")}
                    >
                      Lava - Fiery Red/Orange {unlockedThemes.includes("lava") ? "" : "(Locked)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Visual & Audio Settings */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Visual & Audio
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {settings.soundEnabled ? (
                    <Volume2 className={`w-4 h-4 mr-2 ${currentTheme.textPrimary}`} />
                  ) : (
                    <VolumeX className={`w-4 h-4 mr-2 ${currentTheme.textPrimary}`} />
                  )}
                  <span className={`text-sm ${currentTheme.textPrimary}`}>Sound Effects</span>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Grid3X3 className={`w-4 h-4 mr-2 ${currentTheme.textPrimary}`} />
                  <span className={`text-sm ${currentTheme.textPrimary}`}>Show Grid</span>
                </div>
                <Switch
                  checked={settings.showGrid}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showGrid: checked }))}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
