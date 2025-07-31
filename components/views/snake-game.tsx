"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
  Pause,
  RotateCcw,
  Trophy,
  Star,
  Zap,
  Apple,
  Settings,
  ArrowLeft,
  Volume2,
  VolumeX,
  Grid3X3,
  Palette,
  Gamepad2,
  Target,
} from "lucide-react"

const CANVAS_WIDTH = 800
const CANVAS_HEIGHT = 600
const GRID_SIZE = 20

interface Position {
  x: number
  y: number
}

interface Food {
  position: Position
  type: "apple" | "cherry" | "gem" | "speed" | "multiplier"
  points: number
  color: string
  emoji: string
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  unlocked: boolean
  condition: (stats: GameStats) => boolean
}

interface GameStats {
  score: number
  foodEaten: number
  maxLength: number
  gamesPlayed: number
  totalScore: number
}

interface GameSettings {
  difficulty: "easy" | "normal" | "hard" | "insane"
  soundEnabled: boolean
  showGrid: boolean
  snakeTheme: "rainbow" | "classic" | "neon" | "fire"
  gameSpeed: number
  controlScheme: "wasd" | "arrows" | "both"
}

const DIFFICULTY_SETTINGS = {
  easy: { baseSpeed: 200, speedIncrease: 0.5, foodCount: 3 },
  normal: { baseSpeed: 150, speedIncrease: 1, foodCount: 2 },
  hard: { baseSpeed: 100, speedIncrease: 1.5, foodCount: 2 },
  insane: { baseSpeed: 80, speedIncrease: 2, foodCount: 1 },
}

const SNAKE_THEMES = {
  rainbow: (index: number) => `hsl(${(index * 10) % 360}, 80%, ${60 - index * 1}%)`,
  classic: () => "#4ade80",
  neon: (index: number) => `hsl(${180 + index * 5}, 100%, ${70 - index * 2}%)`,
  fire: (index: number) => `hsl(${30 - index * 3}, 100%, ${70 - index * 2}%)`,
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Game State
  const [currentPage, setCurrentPage] = useState<"menu" | "game" | "gameOver" | "settings">("menu")
  const [pageTransition, setPageTransition] = useState(false)
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 })
  const [food, setFood] = useState<Food[]>([])
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameState, setGameState] = useState<"playing" | "paused">("playing")
  const [speed, setSpeed] = useState(150)
  const [multiplier, setMultiplier] = useState(1)
  const [multiplierTime, setMultiplierTime] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "normal",
    soundEnabled: true,
    showGrid: true,
    snakeTheme: "rainbow",
    gameSpeed: 150,
    controlScheme: "both",
  })

  // Stats and Achievements
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    foodEaten: 0,
    maxLength: 1,
    gamesPlayed: 0,
    totalScore: 0,
  })
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null)

  // Page transition function
  const navigateToPage = useCallback((page: typeof currentPage) => {
    setPageTransition(true)
    setTimeout(() => {
      setCurrentPage(page)
      setPageTransition(false)
    }, 150)
  }, [])

  // Initialize achievements
  useEffect(() => {
    const achievementList: Achievement[] = [
      {
        id: "first-food",
        name: "First Bite",
        description: "Eat your first food",
        icon: <Apple className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.foodEaten >= 1,
      },
      {
        id: "score-100",
        name: "Century",
        description: "Score 100 points",
        icon: <Star className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.score >= 100,
      },
      {
        id: "length-10",
        name: "Growing Strong",
        description: "Reach length of 10",
        icon: <Zap className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.maxLength >= 10,
      },
      {
        id: "score-500",
        name: "Snake Master",
        description: "Score 500 points",
        icon: <Trophy className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.score >= 500,
      },
      {
        id: "games-10",
        name: "Persistent",
        description: "Play 10 games",
        icon: <RotateCcw className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.gamesPlayed >= 10,
      },
      {
        id: "insane-mode",
        name: "Insane Player",
        description: "Score 200+ on Insane difficulty",
        icon: <Target className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.score >= 200 && settings.difficulty === "insane",
      },
    ]
    setAchievements(achievementList)
  }, [settings.difficulty])

  // Load saved data
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore")
    const savedStats = localStorage.getItem("snakeStats")
    const savedAchievements = localStorage.getItem("snakeAchievements")
    const savedSettings = localStorage.getItem("snakeSettings")

    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
    if (savedStats) setStats(JSON.parse(savedStats))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
    if (savedAchievements) {
      const saved = JSON.parse(savedAchievements)
      setAchievements((prev) =>
        prev.map((ach) => ({
          ...ach,
          unlocked: saved.includes(ach.id),
        })),
      )
    }
  }, [])

  // Save settings
  useEffect(() => {
    localStorage.setItem("snakeSettings", JSON.stringify(settings))
  }, [settings])

  // Check for new achievements
  useEffect(() => {
    achievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        setAchievements((prev) => prev.map((ach) => (ach.id === achievement.id ? { ...ach, unlocked: true } : ach)))
        setShowAchievement(achievement)
        setTimeout(() => setShowAchievement(null), 3000)

        const unlockedIds = achievements.filter((a) => a.unlocked || a.id === achievement.id).map((a) => a.id)
        localStorage.setItem("snakeAchievements", JSON.stringify(unlockedIds))
      }
    })
  }, [stats, achievements])

  const generateFood = useCallback((): Food => {
    const types: Array<{ type: Food["type"]; points: number; color: string; emoji: string; weight: number }> = [
      { type: "apple", points: 10, color: "#ff4444", emoji: "🍎", weight: 60 },
      { type: "cherry", points: 20, color: "#ff1493", emoji: "🍒", weight: 25 },
      { type: "gem", points: 50, color: "#00ffff", emoji: "💎", weight: 10 },
      { type: "speed", points: 15, color: "#ffff00", emoji: "⚡", weight: 3 },
      { type: "multiplier", points: 25, color: "#ff8c00", emoji: "✨", weight: 2 },
    ]

    const totalWeight = types.reduce((sum, type) => sum + type.weight, 0)
    let random = Math.random() * totalWeight

    const selectedType =
      types.find((type) => {
        random -= type.weight
        return random <= 0
      }) || types[0]

    return {
      position: {
        x: Math.floor(Math.random() * (CANVAS_WIDTH / GRID_SIZE)),
        y: Math.floor(Math.random() * (CANVAS_HEIGHT / GRID_SIZE)),
      },
      ...selectedType,
    }
  }, [])

  const createParticles = useCallback((x: number, y: number, color: string, count = 8) => {
    const newParticles: Particle[] = []
    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: x * GRID_SIZE + GRID_SIZE / 2,
        y: y * GRID_SIZE + GRID_SIZE / 2,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        life: 60,
        maxLife: 60,
        color,
        size: Math.random() * 4 + 2,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  const resetGame = useCallback(() => {
    const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty]
    setSnake([{ x: 10, y: 10 }])
    setDirection({ x: 1, y: 0 })
    setFood(Array.from({ length: difficultySettings.foodCount }, () => generateFood()))
    setScore(0)
    setSpeed(difficultySettings.baseSpeed)
    setMultiplier(1)
    setMultiplierTime(0)
    setParticles([])
    setGameState("playing")
    setStats((prev) => ({ ...prev, score: 0, foodEaten: 0, maxLength: 1, gamesPlayed: prev.gamesPlayed + 1 }))
  }, [generateFood, settings.difficulty])

  const startGame = useCallback(() => {
    resetGame()
    navigateToPage("game")
  }, [resetGame, navigateToPage])

  const pauseGame = useCallback(() => {
    setGameState(gameState === "paused" ? "playing" : "paused")
  }, [gameState])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentPage === "game" && gameState === "playing") {
        const key = e.key.toLowerCase()

        const isWASD = settings.controlScheme === "wasd" || settings.controlScheme === "both"
        const isArrows = settings.controlScheme === "arrows" || settings.controlScheme === "both"

        if ((isWASD && key === "w") || (isArrows && key === "arrowup")) {
          setDirection((prev) => (prev.y === 0 ? { x: 0, y: -1 } : prev))
        } else if ((isWASD && key === "s") || (isArrows && key === "arrowdown")) {
          setDirection((prev) => (prev.y === 0 ? { x: 0, y: 1 } : prev))
        } else if ((isWASD && key === "a") || (isArrows && key === "arrowleft")) {
          setDirection((prev) => (prev.x === 0 ? { x: -1, y: 0 } : prev))
        } else if ((isWASD && key === "d") || (isArrows && key === "arrowright")) {
          setDirection((prev) => (prev.x === 0 ? { x: 1, y: 0 } : prev))
        }
      }

      if (e.key === " " && currentPage === "game") {
        e.preventDefault()
        pauseGame()
      }

      if (e.key === "Escape") {
        if (currentPage === "game") {
          navigateToPage("menu")
        } else if (currentPage === "settings") {
          navigateToPage("menu")
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [currentPage, gameState, settings.controlScheme, pauseGame, navigateToPage])

  // Game loop
  useEffect(() => {
    if (currentPage !== "game" || gameState !== "playing") return

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= speed) {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake]
          const head = { ...newSnake[0] }

          head.x += direction.x
          head.y += direction.y

          // Screen wrapping
          if (head.x < 0) head.x = Math.floor(CANVAS_WIDTH / GRID_SIZE) - 1
          if (head.x >= Math.floor(CANVAS_WIDTH / GRID_SIZE)) head.x = 0
          if (head.y < 0) head.y = Math.floor(CANVAS_HEIGHT / GRID_SIZE) - 1
          if (head.y >= Math.floor(CANVAS_HEIGHT / GRID_SIZE)) head.y = 0

          // Self collision
          if (newSnake.some((segment) => segment.x === head.x && segment.y === head.y)) {
            const finalScore = score
            if (finalScore > highScore) {
              setHighScore(finalScore)
              localStorage.setItem("snakeHighScore", finalScore.toString())
            }
            setStats((prev) => {
              const newStats = {
                ...prev,
                totalScore: prev.totalScore + finalScore,
              }
              localStorage.setItem("snakeStats", JSON.stringify(newStats))
              return newStats
            })
            navigateToPage("gameOver")
            return prevSnake
          }

          newSnake.unshift(head)

          // Check food collision
          const eatenFoodIndex = food.findIndex((f) => f.position.x === head.x && f.position.y === head.y)
          if (eatenFoodIndex !== -1) {
            const eatenFood = food[eatenFoodIndex]
            const points = eatenFood.points * multiplier

            setScore((prev) => prev + points)
            setStats((prev) => ({
              ...prev,
              score: prev.score + points,
              foodEaten: prev.foodEaten + 1,
              maxLength: Math.max(prev.maxLength, newSnake.length),
            }))

            createParticles(head.x, head.y, eatenFood.color, 12)

            // Special food effects
            if (eatenFood.type === "speed") {
              setSpeed((prev) => Math.max(50, prev - 20))
            } else if (eatenFood.type === "multiplier") {
              setMultiplier(2)
              setMultiplierTime(300)
            }

            // Remove eaten food and add new one
            setFood((prev) => {
              const newFood = [...prev]
              newFood.splice(eatenFoodIndex, 1)
              newFood.push(generateFood())
              return newFood
            })

            // Increase speed based on difficulty
            const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty]
            setSpeed((prev) => Math.max(50, prev - difficultySettings.speedIncrease))
          } else {
            newSnake.pop()
          }

          return newSnake
        })

        // Update multiplier timer
        setMultiplierTime((prev) => {
          if (prev > 0) {
            const newTime = prev - 1
            if (newTime === 0) setMultiplier(1)
            return newTime
          }
          return 0
        })

        lastTimeRef.current = currentTime
      }

      // Update particles
      setParticles((prev) =>
        prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vx: particle.vx * 0.98,
            vy: particle.vy * 0.98,
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0),
      )

      animationRef.current = requestAnimationFrame(gameLoop)
    }

    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [
    currentPage,
    gameState,
    direction,
    food,
    score,
    highScore,
    speed,
    multiplier,
    generateFood,
    createParticles,
    settings.difficulty,
    navigateToPage,
  ])

  // Canvas rendering
  useEffect(() => {
    if (currentPage !== "game") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
    gradient.addColorStop(0, "#1a1a2e")
    gradient.addColorStop(1, "#16213e")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw grid
    if (settings.showGrid) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)"
      ctx.lineWidth = 1
      for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_HEIGHT)
        ctx.stroke()
      }
      for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(CANVAS_WIDTH, y)
        ctx.stroke()
      }
    }

    // Draw snake with selected theme
    const themeFunction = SNAKE_THEMES[settings.snakeTheme]
    snake.forEach((segment, index) => {
      ctx.fillStyle = themeFunction(index)
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 10

      const x = segment.x * GRID_SIZE
      const y = segment.y * GRID_SIZE

      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 6)
      ctx.fill()

      // Draw eyes on head
      if (index === 0) {
        ctx.fillStyle = "white"
        ctx.shadowBlur = 0
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2)
        ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "black"
        ctx.beginPath()
        ctx.arc(x + 6, y + 6, 1, 0, Math.PI * 2)
        ctx.arc(x + 14, y + 6, 1, 0, Math.PI * 2)
        ctx.fill()
      }
    })

    // Draw food
    food.forEach((f) => {
      const x = f.position.x * GRID_SIZE
      const y = f.position.y * GRID_SIZE

      ctx.fillStyle = f.color
      ctx.shadowColor = f.color
      ctx.shadowBlur = 15

      ctx.beginPath()
      ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.font = "16px Arial"
      ctx.textAlign = "center"
      ctx.fillText(f.emoji, x + GRID_SIZE / 2, y + GRID_SIZE / 2 + 5)
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
      ctx.shadowBlur = 5

      ctx.beginPath()
      ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
      ctx.fill()
    })

    ctx.shadowBlur = 0
  }, [snake, food, particles, currentPage, settings.showGrid, settings.snakeTheme])

  // Menu Page
  const MenuPage = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="text-center mb-12">
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 mb-4 animate-pulse">
          🐍 SNAKE MASTER 🐍
        </h1>
        <p className="text-2xl text-white/80 mb-8">The Ultimate Snake Experience!</p>

        {/* High Score Display */}
        <Card className="p-6 bg-black/30 border-purple-500/50 backdrop-blur-sm mb-8">
          <div className="flex items-center justify-center gap-8 text-white">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{highScore}</div>
              <div className="text-sm text-gray-300">High Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{stats.gamesPlayed}</div>
              <div className="text-sm text-gray-300">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{achievements.filter((a) => a.unlocked).length}</div>
              <div className="text-sm text-gray-300">Achievements</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-md">
        <Button
          onClick={startGame}
          size="lg"
          className="h-16 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all"
        >
          <Play className="w-6 h-6 mr-3" />
          Start Game
        </Button>

        <Button
          onClick={() => navigateToPage("settings")}
          size="lg"
          variant="outline"
          className="h-16 text-xl border-purple-500/50 text-white hover:bg-purple-500/20 transform hover:scale-105 transition-all"
        >
          <Settings className="w-6 h-6 mr-3" />
          Settings
        </Button>

        {/* Achievements Preview */}
        <Card className="p-4 bg-black/30 border-purple-500/50 backdrop-blur-sm">
          <h3 className="text-white font-bold mb-3 text-center">Achievements</h3>
          <div className="flex gap-2 justify-center flex-wrap">
            {achievements.map((achievement) => (
              <Badge
                key={achievement.id}
                variant={achievement.unlocked ? "default" : "secondary"}
                className={`flex items-center gap-1 ${
                  achievement.unlocked
                    ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-black"
                    : "bg-gray-600 text-gray-300"
                }`}
                title={achievement.description}
              >
                {achievement.icon}
              </Badge>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  // Settings Page
  const SettingsPage = () => (
    <div className="h-screen flex flex-col bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="flex items-center mb-8">
        <Button
          onClick={() => navigateToPage("menu")}
          variant="ghost"
          size="lg"
          className="text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </Button>
        <h1 className="text-4xl font-bold text-white ml-4">Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Game Settings */}
          <Card className="p-6 bg-black/30 border-purple-500/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Gamepad2 className="w-6 h-6 mr-2" />
              Game Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="text-white font-medium mb-2 block">Difficulty</label>
                <Select
                  value={settings.difficulty}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, difficulty: value }))}
                >
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">🟢 Easy - Slow & Forgiving</SelectItem>
                    <SelectItem value="normal">🟡 Normal - Balanced</SelectItem>
                    <SelectItem value="hard">🟠 Hard - Fast Paced</SelectItem>
                    <SelectItem value="insane">🔴 Insane - Lightning Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Control Scheme</label>
                <Select
                  value={settings.controlScheme}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, controlScheme: value }))}
                >
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wasd">WASD Keys</SelectItem>
                    <SelectItem value="arrows">Arrow Keys</SelectItem>
                    <SelectItem value="both">Both WASD & Arrows</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-white font-medium mb-2 block">Snake Theme</label>
                <Select
                  value={settings.snakeTheme}
                  onValueChange={(value: any) => setSettings((prev) => ({ ...prev, snakeTheme: value }))}
                >
                  <SelectTrigger className="bg-black/50 border-purple-500/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rainbow">🌈 Rainbow</SelectItem>
                    <SelectItem value="classic">🟢 Classic Green</SelectItem>
                    <SelectItem value="neon">💙 Neon Blue</SelectItem>
                    <SelectItem value="fire">🔥 Fire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Visual & Audio Settings */}
          <Card className="p-6 bg-black/30 border-purple-500/50 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Palette className="w-6 h-6 mr-2" />
              Visual & Audio
            </h2>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 mr-2 text-white" />
                  ) : (
                    <VolumeX className="w-5 h-5 mr-2 text-white" />
                  )}
                  <span className="text-white font-medium">Sound Effects</span>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, soundEnabled: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Grid3X3 className="w-5 h-5 mr-2 text-white" />
                  <span className="text-white font-medium">Show Grid</span>
                </div>
                <Switch
                  checked={settings.showGrid}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showGrid: checked }))}
                />
              </div>
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-6 bg-black/30 border-purple-500/50 backdrop-blur-sm lg:col-span-2">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="w-6 h-6 mr-2" />
              Statistics
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400">{stats.totalScore}</div>
                <div className="text-sm text-gray-300">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.foodEaten}</div>
                <div className="text-sm text-gray-300">Food Eaten</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.maxLength}</div>
                <div className="text-sm text-gray-300">Max Length</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.gamesPlayed}</div>
                <div className="text-sm text-gray-300">Games Played</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )

  // Game Page
  const GamePage = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      {/* Game Stats */}
      <div className="flex gap-6 mb-4">
        <Card className="p-4 bg-black/30 border-purple-500/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 text-white">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">{score}</div>
              <div className="text-sm text-gray-300">Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{highScore}</div>
              <div className="text-sm text-gray-300">High Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{snake.length}</div>
              <div className="text-sm text-gray-300">Length</div>
            </div>
            {multiplier > 1 && (
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400">{multiplier}x</div>
                <div className="text-sm text-gray-300">Multiplier</div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-black/30 border-purple-500/50 backdrop-blur-sm">
          <div className="text-white text-center">
            <div className="text-lg font-bold text-purple-400">{settings.difficulty.toUpperCase()}</div>
            <div className="text-sm text-gray-300">Difficulty</div>
          </div>
        </Card>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-4 border-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          }}
        />

        {/* Pause Overlay */}
        {gameState === "paused" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center text-white">
              <h2 className="text-4xl font-bold mb-4 text-yellow-400">Paused</h2>
              <p className="mb-6 text-lg">Press Space or click Resume to continue</p>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={pauseGame}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button onClick={() => navigateToPage("menu")} variant="outline" size="lg">
                  Menu
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game Controls */}
      <div className="flex gap-4 mt-4">
        <Button
          onClick={pauseGame}
          className={
            gameState === "paused"
              ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
              : "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          }
        >
          {gameState === "paused" ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
          {gameState === "paused" ? "Resume" : "Pause"}
        </Button>
        <Button onClick={() => navigateToPage("menu")} variant="outline">
          Menu
        </Button>
      </div>

      {/* Controls Info */}
      <Card className="mt-4 p-3 bg-black/30 border-purple-500/50 backdrop-blur-sm">
        <div className="text-white text-sm text-center">
          Controls:{" "}
          {settings.controlScheme === "wasd"
            ? "WASD"
            : settings.controlScheme === "arrows"
              ? "Arrow Keys"
              : "WASD / Arrow Keys"}{" "}
          • Space: Pause • Esc: Menu
        </div>
      </Card>
    </div>
  )

  // Game Over Page
  const GameOverPage = () => (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-900 via-purple-900 to-indigo-900 p-8">
      <div className="text-center mb-8">
        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-500 to-purple-500 mb-4 animate-pulse">
          GAME OVER
        </h1>
        <div className="text-6xl mb-6">💀</div>
      </div>

      <Card className="p-8 bg-black/30 border-red-500/50 backdrop-blur-sm mb-8">
        <div className="text-center text-white">
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <div className="text-4xl font-bold text-yellow-400">{score}</div>
              <div className="text-lg text-gray-300">Final Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400">{highScore}</div>
              <div className="text-lg text-gray-300">High Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400">{snake.length}</div>
              <div className="text-lg text-gray-300">Final Length</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">{settings.difficulty}</div>
              <div className="text-lg text-gray-300">Difficulty</div>
            </div>
          </div>

          {score === highScore && score > 0 && (
            <div className="text-2xl mb-6 text-yellow-400 font-bold animate-bounce">🎉 NEW HIGH SCORE! 🎉</div>
          )}
        </div>
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={startGame}
          size="lg"
          className="h-16 text-xl bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 transform hover:scale-105 transition-all"
        >
          <RotateCcw className="w-6 h-6 mr-3" />
          Play Again
        </Button>
        <Button
          onClick={() => navigateToPage("menu")}
          variant="outline"
          size="lg"
          className="h-16 text-xl border-purple-500/50 text-white hover:bg-purple-500/20 transform hover:scale-105 transition-all"
        >
          Menu
        </Button>
      </div>
    </div>
  )

  return (
    <div className={`transition-all duration-150 ${pageTransition ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}>
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <Card className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-0 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">{showAchievement.icon}</div>
              <div>
                <h3 className="font-bold">Achievement Unlocked!</h3>
                <p className="text-sm">{showAchievement.name}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {currentPage === "menu" && <MenuPage />}
      {currentPage === "settings" && <SettingsPage />}
      {currentPage === "game" && <GamePage />}
      {currentPage === "gameOver" && <GameOverPage />}
    </div>
  )
}
