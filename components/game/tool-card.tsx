"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, ShoppingCart, Hammer } from "lucide-react"
import type { ThemePalette, Tool } from "@/lib/game-constants"
import { MAX_LIVES } from "@/lib/game-constants"

interface ToolCardProps {
  tool: Tool
  currency: number
  isUnlocked: boolean
  isEquipped: boolean
  currentUses: number // New prop
  purchaseTool: (toolId: string) => boolean
  equipTool: (toolId: string | null) => void
  currentTheme: ThemePalette
  isLifePotion: boolean // New prop
  canBuyLifePotion: boolean // New prop
  lives: number // New prop
}

export function ToolCard({
  tool,
  currency,
  isUnlocked,
  isEquipped,
  currentUses, // Destructure currentUses
  purchaseTool,
  equipTool,
  currentTheme,
  isLifePotion, // Destructure isLifePotion
  canBuyLifePotion, // Destructure canBuyLifePotion
  lives, // Destructure lives
}: ToolCardProps) {
  const handlePurchase = () => {
    purchaseTool(tool.id)
  }

  const handleEquip = () => {
    if (isEquipped) {
      equipTool(null) // Unequip
    } else {
      equipTool(tool.id) // Equip
    }
  }

  const canAfford = currency >= tool.cost
  const buttonDisabled = !isUnlocked && !canAfford

  return (
    <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex flex-col`}>
      <div className="flex items-center gap-4 mb-4">
        <div className={`p-3 rounded-full ${currentTheme.badgeUnlockedBg} flex items-center justify-center text-3xl`}>
          {tool.icon}
        </div>
        <div>
          <h3 className={`text-xl font-bold ${currentTheme.highlight1}`}>{tool.name}</h3>
          <p className={`text-sm ${currentTheme.textMuted}`}>{tool.description}</p>
        </div>
      </div>

      <div className="mt-auto flex justify-between items-center pt-4 border-t border-dashed border-slate-700/50">
        {isLifePotion ? (
          <div className={`text-lg font-bold ${canBuyLifePotion ? currentTheme.highlight2 : currentTheme.textMuted}`}>
            {tool.cost} 🪙
          </div>
        ) : !isUnlocked || tool.stackable ? ( // Show cost if not unlocked or if stackable
          <div className={`text-lg font-bold ${canAfford ? currentTheme.highlight2 : currentTheme.textMuted}`}>
            {tool.cost} 🪙
          </div>
        ) : (
          <div className={`text-lg font-bold ${currentTheme.highlight3}`}>Unlocked</div>
        )}

        {isLifePotion ? (
          <Button
            onClick={handlePurchase}
            disabled={!canBuyLifePotion}
            className={`bg-gradient-to-r ${canBuyLifePotion ? currentTheme.successGradient : "from-gray-500 to-gray-600"} ${currentTheme.buttonPrimaryTextColor} font-semibold`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Buy Life ({lives}/{MAX_LIVES})
          </Button>
        ) : !isUnlocked || (isUnlocked && tool.stackable) ? ( // Show buy button if not unlocked or if stackable
          <Button
            onClick={handlePurchase}
            disabled={!canAfford}
            className={`bg-gradient-to-r ${canAfford ? currentTheme.successGradient : "from-gray-500 to-gray-600"} ${currentTheme.buttonPrimaryTextColor} font-semibold`}
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            {isUnlocked && tool.stackable ? "Add Uses" : "Buy"}
          </Button>
        ) : null}

        {isUnlocked &&
          !isLifePotion && ( // Show equip/equipped button only if unlocked and not a life potion
            <Button
              onClick={handleEquip}
              className={`font-semibold ${isEquipped ? `bg-gradient-to-r ${currentTheme.accentGradient} ${currentTheme.buttonPrimaryTextColor}` : `border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg}`}`}
              variant={isEquipped ? "default" : "outline"}
              disabled={currentUses === 0 && !isEquipped} // Disable equip if 0 uses and not currently equipped
            >
              {isEquipped ? <Check className="w-5 h-5 mr-2" /> : <Hammer className="w-5 h-5 mr-2" />}
              {isEquipped ? "Equipped" : "Equip"}
              {currentUses > 0 && !isEquipped && <span className="ml-2 text-xs">({currentUses} uses)</span>}
              {currentUses === 0 && !isEquipped && <span className="ml-2 text-xs">(No uses)</span>}
            </Button>
          )}
      </div>
    </Card>
  )
}
