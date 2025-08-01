"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Gamepad2, Apple, CircleDot, Settings, Hammer, FlaskConical, Heart } from "lucide-react" // Import new icons
import type { ThemePalette } from "@/lib/game-constants"
import { DIFFICULTY_SETTINGS, TOOLS_DATA, MAX_LIVES } from "@/lib/game-constants"

interface HelpPageProps {
  navigateToPage: (page: string) => void
  currentTheme: ThemePalette
}

export function HelpPage({ navigateToPage, currentTheme }: HelpPageProps) {
  const foodTypes = [
    { type: "apple", emoji: "🍎", points: 10, effect: "Standard food, increases score and snake length." },
    { type: "cherry", emoji: "🍒", points: 20, effect: "More points than apples, increases snake length." },
    { type: "gem", emoji: "💎", points: 50, effect: "High value food, significantly increases snake length." },
    {
      type: "speed",
      emoji: "⚡",
      points: 15,
      effect:
        "Increases snake speed for a short duration. Side effect: Food disappears faster! Eating 'Slow' food cancels this effect.",
    },
    {
      type: "multiplier",
      emoji: "✨",
      points: 25,
      effect: "Doubles points earned from all food for a short duration. Side effect: Snake grows slightly longer!",
    },
    {
      type: "slow",
      emoji: "🐢",
      points: 5,
      effect:
        "Decreases snake speed for a short duration. Side effect: Food lasts longer! Eating 'Speed' food cancels this effect.",
    },
    {
      type: "shield",
      emoji: "🛡️",
      points: 30,
      effect:
        "Grants temporary invincibility to all collisions (self, walls, obstacles) & cures 'Poison' and 'Fragile Walls' debuffs. Side effect: Lose a small amount of score!",
    },
    {
      type: "growth",
      emoji: "🧪",
      points: 0,
      effect: "Instantly increases snake length by 3 segments. Side effect: Temporarily slows you down!",
    },
    {
      type: "teleport",
      emoji: "🌀",
      points: 0,
      effect:
        "Teleports snake to a random safe location on the grid. Side effect: Direction becomes random for a moment!",
    },
    {
      type: "shrink",
      emoji: "🤏",
      points: -10,
      effect: "Decreases snake length by 3 segments. Side effect: Gain a temporary speed boost!",
    },
    {
      type: "fragile-walls",
      emoji: "🧱",
      points: -5,
      effect:
        "Walls become lethal for a short duration. Eating 'Shield' food cancels this effect. Side effect: Gain currency!",
    },
    {
      type: "poison",
      emoji: "☠️",
      points: -20,
      effect:
        "Inflicts damage over time (shrinks snake gradually). Eating 'Shield' food cures this debuff. Side effect: Grants temporary self-invincibility (immune to self-collision, but still shrinks)!",
    },
    {
      type: "life-potion",
      emoji: "❤️",
      points: 0,
      effect: `Instantly gain 1 life (up to ${MAX_LIVES}).`,
    },
  ]

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
        <h1 className="text-xl font-bold">Help & How to Play</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Game Objective */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <CircleDot className="w-5 h-5 mr-2" />
              Objective
            </h2>
            <p className={`text-sm ${currentTheme.textMuted}`}>
              Guide your snake to eat food and grow longer. Avoid colliding with your own body or obstacles. The longer
              you survive and the more food you eat, the higher your score! Reach the target score to clear the level
              and advance.
            </p>
          </Card>

          {/* Controls */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Controls
            </h2>
            <ul className={`text-sm ${currentTheme.textMuted} list-disc pl-5 space-y-1`}>
              <li>
                **Movement:** Use <span className="font-bold">WASD</span> or{" "}
                <span className="font-bold">Arrow Keys</span> to change the snake's direction.
              </li>
              <li>
                **Pause/Resume:** Press <span className="font-bold">SPACEBAR</span> during gameplay.
              </li>
              <li>
                **Back to Menu:** Press <span className="font-bold">ESC</span> from any page (except Game Over).
              </li>
            </ul>
          </Card>

          {/* Lives System */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Lives System
            </h2>
            <ul className={`text-sm ${currentTheme.textMuted} list-disc pl-5 space-y-1`}>
              <li>
                You start with {MAX_LIVES} lives. Each time you die, you lose 1 life and restart the current level.
              </li>
              <li>If you run out of lives, you cannot start a new game until lives regenerate or you purchase more.</li>
              <li>Lives regenerate automatically over time (1 life every 5 minutes) up to a maximum of {MAX_LIVES}.</li>
              <li>You can also gain lives by clearing levels or purchasing "Life Potions" from the Tools Store.</li>
            </ul>
          </Card>

          {/* Food Types */}
          <Card
            className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm lg:col-span-2`}
          >
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Apple className="w-5 h-5 mr-2" />
              Food Types
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foodTypes.map((food) => (
                <div key={food.type} className="flex items-start gap-3">
                  <span className="text-2xl">{food.emoji}</span>
                  <div>
                    <h3 className={`font-semibold ${currentTheme.highlight1}`}>
                      {food.type.charAt(0).toUpperCase() + food.type.slice(1)} ({food.points} pts)
                    </h3>
                    <p className={`text-xs ${currentTheme.textMuted}`}>{food.effect}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Food Interactions */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FlaskConical className="w-5 h-5 mr-2" />
              Food Interactions
            </h2>
            <ul className={`text-sm ${currentTheme.textMuted} list-disc pl-5 space-y-1`}>
              <li>
                Eating a <span className="font-bold">Shield (🛡️)</span> will immediately remove{" "}
                <span className="font-bold">Fragile Walls (🧱)</span> and <span className="font-bold">Poison (☠️)</span>{" "}
                debuffs.
              </li>
              <li>
                Eating <span className="font-bold">Fragile Walls (🧱)</span> will immediately remove{" "}
                <span className="font-bold">Shield (🛡️)</span>.
              </li>
              <li>
                Eating <span className="font-bold">Speed (⚡)</span> will immediately remove{" "}
                <span className="font-bold">Slow (🐢)</span>.
              </li>
              <li>
                Eating <span className="font-bold">Slow (🐢)</span> will immediately remove{" "}
                <span className="font-bold">Speed (⚡)</span>.
              </li>
              <li>
                Similar buffs/debuffs (e.g., two 'Speed' foods) will extend the duration of the existing effect rather
                than stacking.
              </li>
            </ul>
          </Card>

          {/* Tools */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Hammer className="w-5 h-5 mr-2" />
              Tools
            </h2>
            <p className={`text-sm ${currentTheme.textMuted} mb-2`}>
              Earn currency by eating food and use it to purchase powerful tools from the Tools Store. Tools have
              limited uses and are consumed when you start a new game session with them equipped. Some tools can also be
              earned through Achievements!
            </p>
            <ul className={`text-sm ${currentTheme.textMuted} list-disc pl-5 space-y-1`}>
              {TOOLS_DATA.map((tool) => (
                <li key={tool.id}>
                  <span className="font-bold">
                    {tool.name} ({tool.icon}):
                  </span>{" "}
                  {tool.description} (Uses: {tool.initialUses}, {tool.stackable ? "Stackable" : "Not Stackable"})
                </li>
              ))}
            </ul>
          </Card>

          {/* Obstacles & Levels */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <CircleDot className="w-5 h-5 mr-2" />
              Obstacles & Levels
            </h2>
            <p className={`text-sm ${currentTheme.textMuted}`}>
              As you progress and reach higher scores, you'll advance to new levels. Each level introduces new obstacles
              that you must avoid. Colliding with an obstacle will end your game!
            </p>
          </Card>

          {/* Difficulty Settings */}
          <Card className={`p-4 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Difficulty Settings
            </h2>
            <ul className={`text-sm ${currentTheme.textMuted} list-disc pl-5 space-y-1`}>
              {Object.entries(DIFFICULTY_SETTINGS).map(([key, value]) => (
                <li key={key}>
                  <span className="font-bold capitalize">{key}:</span> Base Speed {value.baseSpeed}ms, Speed Increase{" "}
                  {value.speedIncrease} per food, {value.foodCount} food items.
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
