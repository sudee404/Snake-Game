"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Coins, Hammer } from "lucide-react"
import type { ThemePalette, Tool } from "@/lib/game-constants"
import { ToolCard } from "./tool-card" // Import the new ToolCard component
import { MAX_LIVES } from "@/lib/game-constants"

interface ToolsPageProps {
  navigateToPage: (page: string) => void
  currency: number
  unlockedTools: Array<{ id: string; uses: number }> // Updated type
  equippedTool: string | null
  toolsData: Tool[]
  purchaseTool: (toolId: string) => boolean
  equipTool: (toolId: string | null) => void
  currentTheme: ThemePalette
  lives: number // New prop
}

export function ToolsPage({
  navigateToPage,
  currency,
  unlockedTools,
  equippedTool,
  toolsData,
  purchaseTool,
  equipTool,
  currentTheme,
  lives, // Destructure lives
}: ToolsPageProps) {
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
        <h1 className="text-xl font-bold flex items-center">
          <Hammer className="w-6 h-6 mr-2" />
          Tools Store
        </h1>
        <div
          className={`px-4 py-2 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex items-center`}
        >
          <Coins className={`w-5 h-5 mr-2 ${currentTheme.highlight1}`} />
          <span className="font-bold text-lg">{currency}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <p className={`text-center text-sm ${currentTheme.textMuted} mb-6 max-w-2xl mx-auto`}>
          Spend your hard-earned coins on powerful tools to aid your journey! Tools have limited uses and are consumed
          when you start a new game session with them equipped. Some tools can also be earned through Achievements!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {toolsData.map((tool) => {
            const unlockedTool = unlockedTools.find((t) => t.id === tool.id)
            const currentUses = unlockedTool ? unlockedTool.uses : 0
            const isUnlocked = !!unlockedTool
            const isEquipped = equippedTool === tool.id

            // Special handling for Life Potion
            const isLifePotion = tool.id === "life-potion"
            const canBuyLifePotion = isLifePotion && currency >= tool.cost && lives < MAX_LIVES

            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                currency={currency}
                isUnlocked={isUnlocked}
                isEquipped={isEquipped}
                currentUses={currentUses} // Pass current uses
                purchaseTool={purchaseTool}
                equipTool={equipTool}
                currentTheme={currentTheme}
                isLifePotion={isLifePotion} // Pass if it's a life potion
                canBuyLifePotion={canBuyLifePotion} // Pass specific condition for life potion
                lives={lives} // Pass lives for display
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
