"use client"

import type React from "react"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Play, Home } from "lucide-react"
import { SNAKE_THEMES, type Food, type GameSettings, type Position, type ThemePalette } from "@/lib/game-constants"

const GRID_SIZE = 20

interface GamePageProps {
  canvasRef: React.RefObject<HTMLCanvasElement>
  canvasWidth: number
  canvasHeight: number
  snake: Position[]
  food: Food[]
  particles: any[]
  fireworks: any[]
  obstacles: Position[]
  activeBuffs: Array<{
    type: string
    timeLeft: number
    duration: number
    color: string
    emoji: string
    flashColor?: string
    snakeEffect?: "glow" | "transparent" | "tint-green" | "tint-dark" | "pulse-bright" | "pulse-dim"
  }> // Changed to activeBuffs
  settings: GameSettings
  score: number
  highScore: number
  navigateToPage: (page: string) => void
  currentTheme: ThemePalette
  pauseGame: () => void
  gameState: "playing" | "paused"
  level: number
  currentLevelTargetScore: number // Added for winning cue
  isWallFragile: boolean // New prop for wall fragility
  isPoisoned: boolean // New prop for poison state
  wallBreakerUses: number // New prop for wall breaker tool
  lives: number // New prop for lives
  currency: number // New prop for currency
  gameMode: "levels" | "endless" | "coop" // New prop
  botSnake?: Position[] // New prop for bot snake
  botScore?: number // New prop for bot score
}

export function GamePage({
  canvasRef,
  canvasWidth,
  canvasHeight,
  snake,
  food,
  particles,
  fireworks,
  obstacles,
  activeBuffs, // Destructure activeBuffs
  settings,
  score,
  highScore,
  navigateToPage,
  currentTheme,
  pauseGame,
  gameState,
  level,
  currentLevelTargetScore, // Destructure currentLevelTargetScore
  isWallFragile, // Destructure isWallFragile
  isPoisoned, // Destructure isPoisoned
  wallBreakerUses, // Destructure wallBreakerUses
  lives, // Destructure lives
  currency, // Destructure currency
  gameMode, // Destructure gameMode
  botSnake, // Destructure botSnake
  botScore, // Destructure botScore
}: GamePageProps) {
  // Separate rendering function
  const renderGame = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size if needed
    if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
      canvas.width = canvasWidth
      canvas.height = canvasHeight
    }

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
    gradient.addColorStop(0, currentTheme.primaryBgColors[0])
    gradient.addColorStop(0.5, currentTheme.primaryBgColors[1])
    gradient.addColorStop(1, currentTheme.primaryBgColors[2])
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)

    // Draw grid
    if (settings.showGrid) {
      ctx.strokeStyle = "rgba(148, 163, 184, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvasHeight)
        ctx.stroke()
      }
      for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvasWidth, y)
        ctx.stroke()
      }
    }

    // Draw obstacles
    ctx.fillStyle = "rgba(100, 100, 100, 0.8)"
    ctx.shadowColor = "rgba(100, 100, 100, 0.8)"
    ctx.shadowBlur = 10
    obstacles.forEach((obstacle) => {
      ctx.beginPath()
      ctx.roundRect(obstacle.x * GRID_SIZE + 1, obstacle.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 2)
      ctx.fill()
    })
    ctx.shadowBlur = 0

    // Draw snake
    const themeFunction = SNAKE_THEMES[settings.snakeTheme]
    const activeFlashBuff = activeBuffs.find((buff) => buff.flashColor)

    snake.forEach((segment, index) => {
      let fillColor = themeFunction(index)
      let shadowColor = fillColor
      let shadowBlur = 8
      let globalAlpha = 1 // Default alpha

      // Apply specific visual effects based on active buffs
      const activeSnakeEffectBuff = activeBuffs.find((buff) => buff.snakeEffect)
      if (activeSnakeEffectBuff) {
        switch (activeSnakeEffectBuff.snakeEffect) {
          case "glow":
            shadowColor = activeSnakeEffectBuff.flashColor || currentTheme.invincibilityGlowColor
            shadowBlur = 25 // Very strong glow
            break
          case "transparent":
            globalAlpha = 0.4 + Math.sin(Date.now() * 0.1) * 0.1 // Pulsating transparency
            shadowBlur = 0 // No shadow for ghost
            break
          case "tint-green":
            const poisonAlpha = Math.sin(Date.now() * 0.08) * 0.2 + 0.3 // Slower, more subtle pulse
            ctx.fillStyle = `rgba(0, 255, 0, ${poisonAlpha})` // Green tint
            ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
            shadowBlur = 0
            break
          case "tint-dark":
            shadowBlur = 5 // Subtle glow
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.sin(Date.now() * 0.05) * 0.1 + 0.1})` // Darker tint
            ctx.fillRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2)
            break
          case "pulse-bright":
            shadowColor = activeSnakeEffectBuff.flashColor || currentTheme.highlight1 // Speed color
            shadowBlur = 10 + Math.sin(Date.now() * 0.2) * 5 // Fast pulsating glow
            break
          case "pulse-dim":
            shadowColor = activeSnakeEffectBuff.flashColor || currentTheme.highlight2 // Slow color
            shadowBlur = 5 // Subtle glow
            break
        }
      }

      // Apply flashing effect if an active buff/debuff has a flashColor (for food-related effects)
      if (activeFlashBuff) {
        const flashAlpha = Math.sin(Date.now() * 0.1) * 0.5 + 0.5 // Faster pulsing effect
        // Use the flashColor from the active buff for the glow
        shadowColor = activeFlashBuff.flashColor || fillColor
        shadowBlur = Math.max(shadowBlur, 15 * flashAlpha + 5) // More pronounced glow, don't reduce existing glow
        // Optionally, slightly change the snake's body color for a more integrated flash
        if (index === 0) {
          // Only apply to head for more subtle effect
          const [h, s, l] = fillColor.match(/\d+/g)!.map(Number) // Extract HSL components
          fillColor = `hsl(${h}, ${s}%, ${l + (flashAlpha * 5 - 2.5)}%)` // Slightly adjust lightness
        }
      }

      ctx.fillStyle = fillColor
      ctx.shadowColor = shadowColor
      ctx.shadowBlur = shadowBlur
      ctx.globalAlpha = globalAlpha // Apply global alpha for transparency effects

      const x = segment.x * GRID_SIZE
      const y = segment.y * GRID_SIZE

      ctx.beginPath()
      ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4) // Slightly smaller for outline effect
      ctx.fill()

      // Add a subtle border/outline
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      ctx.stroke()

      if (index === 0) {
        // Eyes
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 2.5, 0, Math.PI * 2) // Slightly larger eyes
        ctx.arc(x + 14, y + 6, 2.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2) // Slightly larger pupils
        ctx.arc(x + 14, y + 6, 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Add specific warning for temp-self-invincible expiring
        const tempSelfInvincibleBuff = activeBuffs.find((buff) => buff.type === "temp-self-invincible")
        if (tempSelfInvincibleBuff && tempSelfInvincibleBuff.timeLeft <= 120) {
          // Last 2 seconds
          const warningAlpha = Math.sin(Date.now() * 0.2) * 0.5 + 0.5 // Faster pulse for warning
          ctx.strokeStyle = `rgba(255, 0, 0, ${warningAlpha})` // Red pulsating outline
          ctx.lineWidth = 3
          ctx.strokeRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2)
        }
      }
    })
    ctx.globalAlpha = 1 // Reset global alpha after drawing snake
    ctx.shadowBlur = 0

    // Draw bot snake if in coop mode
    if (gameMode === "coop" && botSnake && botSnake.length > 0) {
      const botThemeFunction = SNAKE_THEMES["cosmic"] // Bot uses cosmic theme
      botSnake.forEach((segment, index) => {
        const fillColor = botThemeFunction(index)
        ctx.fillStyle = fillColor
        ctx.shadowColor = fillColor
        ctx.shadowBlur = 8

        const x = segment.x * GRID_SIZE
        const y = segment.y * GRID_SIZE

        ctx.beginPath()
        ctx.roundRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4)
        ctx.fill()

        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
        ctx.lineWidth = 1
        ctx.stroke()

        if (index === 0) {
          // Eyes for bot
          ctx.fillStyle = "white"
          ctx.beginPath()
          ctx.arc(x + 6, y + 6, 2.5, 0, Math.PI * 2)
          ctx.arc(x + 14, y + 6, 2.5, 0, Math.PI * 2)
          ctx.fill()

          ctx.fillStyle = "black"
          ctx.beginPath()
          ctx.arc(x + 6, y + 6, 1.5, 0, Math.PI * 2)
          ctx.arc(x + 14, y + 6, 1.5, 0, Math.PI * 2)
          ctx.fill()
        }
      })
      ctx.shadowBlur = 0
    }

    // Draw food
    const isFoodRadarActive = activeBuffs.some((buff) => buff.type === "food-radar")
    food.forEach((f) => {
      const x = f.position.x * GRID_SIZE
      const y = f.position.y * GRID_SIZE

      ctx.fillStyle = f.color
      ctx.shadowColor = f.color
      ctx.shadowBlur = 10

      // Apply pulsating glow for food radar or special food
      if (isFoodRadarActive || f.flashColor) {
        const pulseAlpha = Math.sin(Date.now() * 0.05) * 0.5 + 0.5 // Slower pulse
        ctx.shadowColor = f.flashColor || currentTheme.highlight1 // Use food's flashColor or radar color
        ctx.shadowBlur = 20 * pulseAlpha + 5 // More pronounced glow
      }

      ctx.beginPath()
      if (f.shape === "circle") {
        ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2)
      } else if (f.shape === "square") {
        ctx.fillRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4)
      } else if (f.shape === "diamond") {
        ctx.moveTo(x + GRID_SIZE / 2, y + 2)
        ctx.lineTo(x + GRID_SIZE - 2, y + GRID_SIZE / 2)
        ctx.lineTo(x + GRID_SIZE / 2, y + GRID_SIZE - 2)
        ctx.lineTo(x + 2, y + GRID_SIZE / 2)
        ctx.closePath()
      } else if (f.shape === "star") {
        const outerRadius = GRID_SIZE / 2 - 2
        const innerRadius = outerRadius / 2
        const numPoints = 5
        for (let i = 0; i < numPoints * 2; i++) {
          const radius = i % 2 === 0 ? outerRadius : innerRadius
          const angle = (Math.PI / numPoints) * i - Math.PI / 2 // Start point upwards
          const px = x + GRID_SIZE / 2 + radius * Math.cos(angle)
          const py = y + GRID_SIZE / 2 + radius * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
      } else if (f.shape === "hexagon") {
        const radius = GRID_SIZE / 2 - 2
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i
          const px = x + GRID_SIZE / 2 + radius * Math.cos(angle)
          const py = y + GRID_SIZE / 2 + radius * Math.sin(angle)
          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
      } else if (f.shape === "heart") {
        const scale = 0.8 // Adjust size
        ctx.moveTo(x + GRID_SIZE / 2, y + (GRID_SIZE / 4) * scale + (GRID_SIZE / 2) * (1 - scale))
        ctx.bezierCurveTo(
          x + GRID_SIZE / 2 + (GRID_SIZE / 4) * scale,
          y + (GRID_SIZE / 8) * scale + (GRID_SIZE / 2) * (1 - scale),
          x + GRID_SIZE / 2 + (GRID_SIZE / 2) * scale,
          y + (GRID_SIZE / 2) * scale + (GRID_SIZE / 2) * (1 - scale),
          x + GRID_SIZE / 2,
          y + GRID_SIZE / 2 + (GRID_SIZE / 4) * scale + (GRID_SIZE / 2) * (1 - scale),
        )
        ctx.bezierCurveTo(
          x + GRID_SIZE / 2 - (GRID_SIZE / 2) * scale,
          y + (GRID_SIZE / 2) * scale + (GRID_SIZE / 2) * (1 - scale),
          x + GRID_SIZE / 2 - (GRID_SIZE / 4) * scale,
          y + (GRID_SIZE / 8) * scale + (GRID_SIZE / 2) * (1 - scale),
          x + GRID_SIZE / 2,
          y + (GRID_SIZE / 4) * scale + (GRID_SIZE / 2) * (1 - scale),
        )
        ctx.closePath()
      }
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(f.emoji, x + GRID_SIZE / 2, y + GRID_SIZE / 2 + 4)

      // Draw food timer if applicable (only for timed buffs/debuffs)
      const isTimedFoodType = ["speed", "multiplier", "slow", "shield", "shrink", "fragile-walls", "poison"].includes(
        f.type,
      )
      if (isTimedFoodType && f.timeLeft !== undefined && f.timeLeft < 180) {
        // Show timer for last 3 seconds (180 frames)
        const timerText = (f.timeLeft / 60).toFixed(1)
        ctx.fillStyle = "white"
        ctx.font = "10px Arial"
        ctx.textAlign = "center"
        ctx.fillText(timerText, x + GRID_SIZE / 2, y + GRID_SIZE / 2 - 10)
      }
    })

    // Draw particles
    particles.forEach((particle) => {
      const alpha = particle.life / particle.maxLife
      ctx.fillStyle =
        particle.color +
        Math.floor(alpha * 255)
          .toString(16)
          .padStart(2, "0")
      ctx.shadowColor = particle.color
      ctx.shadowBlur = 3

      ctx.beginPath()
      if (particle.shape === "square") {
        ctx.fillRect(
          particle.x - particle.size / 2,
          particle.y - particle.size / 2,
          particle.size * alpha,
          particle.size * alpha,
        )
      } else {
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      }
      ctx.fill()
    })

    ctx.shadowBlur = 0

    // Draw fragile walls indicator
    if (isWallFragile) {
      ctx.strokeStyle = currentTheme.dangerGradientColors[0] // Use a color from the danger gradient
      ctx.lineWidth = 5
      ctx.shadowColor = currentTheme.dangerGradientColors[1]
      ctx.shadowBlur = 15
      ctx.strokeRect(0, 0, canvasWidth, canvasHeight)
      ctx.shadowBlur = 0
    }
  }

  // Continuous rendering loop for smooth gameplay
  useEffect(() => {
    let renderAnimationFrame: number
    const animate = () => {
      renderGame()
      renderAnimationFrame = requestAnimationFrame(animate)
    }
    renderAnimationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(renderAnimationFrame)
    }
  }, [
    snake,
    food,
    particles,
    settings.showGrid,
    settings.snakeTheme,
    canvasWidth,
    canvasHeight,
    obstacles,
    activeBuffs, // Added activeBuffs to dependencies
    currentTheme,
    isWallFragile, // Added isWallFragile to dependencies
    isPoisoned, // Added isPoisoned to dependencies
    wallBreakerUses, // Added wallBreakerUses to dependencies
    gameMode, // Added gameMode for bot rendering
    botSnake, // Added botSnake for bot rendering
  ])

  const scoreProximity = score / currentLevelTargetScore
  const isCloseToWinning = scoreProximity >= 0.8 && scoreProximity < 1

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex gap-4">
          <div
            className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm ${
              isCloseToWinning && gameMode === "levels" ? `${currentTheme.highlight4} font-bold animate-pulse` : ""
            }`}
          >
            <span className={`text-sm ${currentTheme.textMuted}`}>Score: </span>
            <span className={`${currentTheme.highlight1} font-bold`}>{score}</span>
          </div>
          {gameMode === "coop" && botScore !== undefined && (
            <div
              className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}
            >
              <span className={`text-sm ${currentTheme.textMuted}`}>Bot Score: </span>
              <span className={`${currentTheme.highlight2} font-bold`}>{botScore}</span>
            </div>
          )}
          <div className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <span className={`text-sm ${currentTheme.textMuted}`}>Length: </span>
            <span className={`${currentTheme.highlight2} font-bold`}>{snake.length}</span>
          </div>
          {activeBuffs.map((buff) => (
            <div
              key={buff.type}
              className={`px-3 py-1 rounded ${buff.color.replace("text-", "bg-")}/20 border ${buff.color.replace("text-", "border-")}/50 backdrop-blur-sm`}
            >
              <span className={`font-bold ${buff.emoji.includes("gradient") ? "" : buff.color}`}>{buff.emoji}</span>
              {buff.timeLeft !== 999999 && ( // Only show timer if not effectively infinite
                <span className="ml-1 text-xs">({(buff.timeLeft / 60).toFixed(1)}s)</span>
              )}
            </div>
          ))}
          {wallBreakerUses > 0 && (
            <div
              className={`px-3 py-1 rounded ${currentTheme.highlight4.replace("text-", "bg-")}/20 border ${currentTheme.highlight4.replace("text-", "border-")}/50 backdrop-blur-sm`}
            >
              <span className={`font-bold ${currentTheme.highlight4}`}>🔨</span>
              <span className="ml-1 text-xs">({wallBreakerUses} uses)</span>
            </div>
          )}
        </div>

        <div className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
          <span className={`text-sm ${currentTheme.textMuted}`}>High: </span>
          <span className={`${currentTheme.highlight3} font-bold`}>{highScore}</span>
        </div>
      </div>

      {/* Level Indicator */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div
          className={`px-4 py-1 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}
        >
          {gameMode === "levels" ? (
            <>
              <span className={`text-sm ${currentTheme.textMuted}`}>Level: </span>
              <span className={`${currentTheme.highlight4} font-bold`}>{level + 1}</span>
            </>
          ) : (
            <span className={`text-sm ${currentTheme.textMuted}`}>Mode: </span>
          )}
          <span className={`${currentTheme.highlight4} font-bold ml-2`}>
            {gameMode === "levels" ? `(${settings.difficulty.toUpperCase()})` : gameMode.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Lives and Currency Indicator */}
      <div className="absolute top-4 right-4 z-10 flex gap-4">
        <div
          className={`px-4 py-1 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex items-center`}
        >
          <span className={`text-sm ${currentTheme.textMuted}`}>Lives: </span>
          <span className={`${currentTheme.highlight1} font-bold ml-2`}>{lives} ❤️</span>
        </div>
        <div
          className={`px-4 py-1 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm flex items-center`}
        >
          <span className={`text-sm ${currentTheme.textMuted}`}>Coins: </span>
          <span className={`${currentTheme.highlight2} font-bold ml-2`}>{currency} 🪙</span>
        </div>
      </div>

      {/* Action Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex justify-center z-10">
        <div
          className={`px-4 py-2 rounded-full ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}
        >
          <div className="flex items-center gap-4 text-xs">
            <span className={`${currentTheme.textMuted}`}>
              {settings.controlScheme === "wasd" ? "WASD" : settings.controlScheme === "arrows" ? "↑↓←→" : "WASD/↑↓←→"}{" "}
              Move
            </span>
            <span className={`${currentTheme.textMuted}`}>SPACE Pause</span>
            <span className={`${currentTheme.textMuted}`}>ESC Menu</span>
          </div>
        </div>
      </div>

      {/* Pause Overlay */}
      {gameState === "paused" && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="text-center">
            <h2 className={`text-4xl font-bold ${currentTheme.textPrimary} mb-6`}>Paused</h2>
            <div className="flex gap-4">
              <Button
                onClick={pauseGame}
                className={`bg-gradient-to-r ${currentTheme.successGradient} ${currentTheme.buttonPrimaryTextColor} font-semibold`}
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button
                onClick={() => navigateToPage("menu")}
                variant="outline"
                className={`border-2 ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.surfaceBg} ${currentTheme.buttonOutlineHoverBg}`}
              >
                <Home className="w-5 h-5 mr-2" />
                Menu
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
