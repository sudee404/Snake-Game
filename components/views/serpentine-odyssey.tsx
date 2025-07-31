"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Play,
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
  Home,
  BarChart2,
  Award,
} from "lucide-react"

const GRID_SIZE = 20

interface Position {
  x: number
  y: number
}

interface Food {
  position: Position
  type: "apple" | "cherry" | "gem" | "speed" | "multiplier" | "slow" | "shield" | "qte"
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
  shape?: "circle" | "square"
}

interface Firework {
  x: number
  y: number
  particles: FireworkParticle[]
  life: number
}

interface FireworkParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  trail: Position[]
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
  qteSuccesses: number
}

interface GameSettings {
  difficulty: "easy" | "normal" | "hard" | "insane"
  soundEnabled: boolean
  showGrid: boolean
  snakeTheme: "aurora" | "ocean" | "sunset" | "cosmic"
  controlScheme: "wasd" | "arrows" | "both"
}

interface LevelData {
  targetScore: number
  obstacles: Position[]
}

const DIFFICULTY_SETTINGS = {
  easy: { baseSpeed: 200, speedIncrease: 0.5, foodCount: 3 },
  normal: { baseSpeed: 150, speedIncrease: 1, foodCount: 2 },
  hard: { baseSpeed: 100, speedIncrease: 1.5, foodCount: 2 },
  insane: { baseSpeed: 80, speedIncrease: 2, foodCount: 1 },
}

const SNAKE_THEMES = {
  aurora: (index: number) => `hsl(${(180 + index * 8) % 360}, 70%, ${65 - index * 1}%)`,
  ocean: (index: number) => `hsl(${(200 + index * 5) % 360}, 80%, ${60 - index * 1}%)`,
  sunset: (index: number) => `hsl(${(30 - index * 3) % 360}, 85%, ${70 - index * 1}%)`,
  cosmic: (index: number) => `hsl(${(280 + index * 10) % 360}, 75%, ${65 - index * 1}%)`,
}

const THEME_PALETTES = {
  aurora: {
    primaryBgClasses: "from-slate-900 via-purple-900 to-slate-900",
    primaryBgColors: ["#0f172a", "#581c87", "#0f172a"], // Hex values for canvas gradient
    accentGradient: "from-cyan-400 to-purple-500",
    successGradient: "from-emerald-500 to-teal-500",
    warningGradient: "from-amber-400 to-orange-500",
    dangerGradient: "from-red-400 to-pink-500",
    surfaceBg: "bg-slate-900/40",
    surfaceBorder: "border-slate-700/50",
    textPrimary: "text-slate-100",
    textMuted: "text-slate-400",
    highlight1: "text-cyan-400",
    highlight2: "text-emerald-400",
    highlight3: "text-purple-400",
    highlight4: "text-amber-400",
    buttonOutlineBorder: "border-slate-600",
    buttonOutlineHoverBg: "hover:bg-slate-800/50",
    selectTriggerBg: "bg-slate-800/50",
    selectTriggerBorder: "border-slate-600",
    selectContentBg: "bg-slate-800",
    selectItemHoverBg: "focus:bg-slate-700",
    badgeUnlockedBg: "bg-gradient-to-r from-cyan-400 to-purple-500",
    badgeLockedBg: "bg-slate-700",
  },
  ocean: {
    primaryBgClasses: "from-blue-950 via-blue-800 to-blue-950",
    primaryBgColors: ["#071a2b", "#1e40af", "#071a2b"], // Hex values for canvas gradient
    accentGradient: "from-sky-400 to-blue-500",
    successGradient: "from-green-500 to-cyan-500",
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-red-500 to-rose-600",
    surfaceBg: "bg-blue-900/40",
    surfaceBorder: "border-blue-700/50",
    textPrimary: "text-blue-100",
    textMuted: "text-blue-400",
    highlight1: "text-sky-400",
    highlight2: "text-green-400",
    highlight3: "text-indigo-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-blue-600",
    buttonOutlineHoverBg: "hover:bg-blue-800/50",
    selectTriggerBg: "bg-blue-800/50",
    selectTriggerBorder: "border-blue-600",
    selectContentBg: "bg-blue-800",
    selectItemHoverBg: "focus:bg-blue-700",
    badgeUnlockedBg: "bg-gradient-to-r from-sky-400 to-blue-500",
    badgeLockedBg: "bg-blue-700",
  },
  sunset: {
    primaryBgClasses: "from-red-950 via-orange-900 to-red-950",
    primaryBgColors: ["#450a0a", "#7c2d12", "#450a0a"], // Hex values for canvas gradient
    accentGradient: "from-amber-400 to-red-500",
    successGradient: "from-lime-500 to-green-500",
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-purple-400 to-pink-500",
    surfaceBg: "bg-red-900/40",
    surfaceBorder: "border-red-700/50",
    textPrimary: "text-red-100",
    textMuted: "text-red-400",
    highlight1: "text-amber-400",
    highlight2: "text-lime-400",
    highlight3: "text-orange-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-red-600",
    buttonOutlineHoverBg: "hover:bg-red-800/50",
    selectTriggerBg: "bg-red-800/50",
    selectTriggerBorder: "border-red-600",
    selectContentBg: "bg-red-800",
    selectItemHoverBg: "focus:bg-red-700",
    badgeUnlockedBg: "bg-gradient-to-r from-amber-400 to-red-500",
    badgeLockedBg: "bg-red-700",
  },
  cosmic: {
    primaryBgClasses: "from-purple-950 via-indigo-900 to-purple-950",
    primaryBgColors: ["#3b0764", "#3730a3", "#3b0764"], // Hex values for canvas gradient
    accentGradient: "from-fuchsia-400 to-purple-500",
    successGradient: "from-lime-500 to-emerald-500",
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-red-500 to-pink-600",
    surfaceBg: "bg-purple-900/40",
    surfaceBorder: "border-purple-700/50",
    textPrimary: "text-purple-100",
    textMuted: "text-purple-400",
    highlight1: "text-fuchsia-400",
    highlight2: "text-lime-400",
    highlight3: "text-indigo-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-purple-600",
    buttonOutlineHoverBg: "hover:bg-purple-800/50",
    selectTriggerBg: "bg-purple-800/50",
    selectTriggerBorder: "border-purple-600",
    selectContentBg: "bg-purple-800",
    selectItemHoverBg: "focus:bg-purple-700",
    badgeUnlockedBg: "bg-gradient-to-r from-fuchsia-400 to-purple-500",
    badgeLockedBg: "bg-purple-700",
  },
}

// Level Data
const LEVEL_DATA: LevelData[] = [
  {
    targetScore: 50,
    obstacles: [], // Level 1: No obstacles
  },
  {
    targetScore: 150,
    obstacles: [
      // Level 2: Central cross
      { x: 10, y: 8 },
      { x: 10, y: 9 },
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
      { x: 8, y: 10 },
      { x: 9, y: 10 },
      { x: 11, y: 10 },
      { x: 12, y: 10 },
    ],
  },
  {
    targetScore: 300,
    obstacles: [
      // Level 3: Border walls (inner perimeter)
      ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 0 })), // Top
      ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 19 })), // Bottom
      ...Array.from({ length: 18 }, (_, i) => ({ x: 0, y: i + 1 })), // Left
      ...Array.from({ length: 18 }, (_, i) => ({ x: 19, y: i + 1 })), // Right
    ],
  },
  {
    targetScore: 500,
    obstacles: [
      // Level 4: Two vertical lines
      ...Array.from({ length: 15 }, (_, i) => ({ x: 5, y: i + 2 })),
      ...Array.from({ length: 15 }, (_, i) => ({ x: 15, y: i + 2 })),
    ],
  },
  {
    targetScore: 750,
    obstacles: [
      // Level 5: Maze-like
      ...Array.from({ length: 10 }, (_, i) => ({ x: 5, y: i + 2 })),
      ...Array.from({ length: 10 }, (_, i) => ({ x: 15, y: i + 8 })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: i + 5, y: 12 })),
      ...Array.from({ length: 5 }, (_, i) => ({ x: i + 10, y: 5 })),
    ],
  },
  // Add more levels as desired
]

export default function SerpentineOdyssey() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const renderRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(800)
  const [canvasHeight, setCanvasHeight] = useState(600)

  // Game State
  const [currentPage, setCurrentPage] = useState<"menu" | "game" | "gameOver" | "settings" | "achievements" | "stats">(
    "menu",
  )
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
  const [invincibilityTime, setInvincibilityTime] = useState(0)
  const [particles, setParticles] = useState<Particle[]>([])
  const [fireworks, setFireworks] = useState<Firework[]>([])

  // Level State
  const [level, setLevel] = useState(0)
  const [obstacles, setObstacles] = useState<Position[]>([])
  const [levelUpMessage, setLevelUpMessage] = useState(false)

  // QTE State
  const [isQTEActive, setIsQTEActive] = useState(false)
  const [qteKey, setQTEKey] = useState("")
  const [qteTimer, setQTETimer] = useState(0)
  const QTE_KEYS = ["q", "e", "r", "t", "y"]

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "normal",
    soundEnabled: true,
    showGrid: false,
    snakeTheme: "aurora",
    controlScheme: "both",
  })

  // Stats and Achievements (overall)
  const [overallStats, setOverallStats] = useState<GameStats>({
    score: 0,
    foodEaten: 0,
    maxLength: 1,
    gamesPlayed: 0,
    totalScore: 0,
    qteSuccesses: 0,
  })
  // Session achievements
  const [sessionAchievements, setSessionAchievements] = useState<Achievement[]>([])
  // Overall achievements (for display on menu)
  const [overallAchievements, setOverallAchievements] = useState<Achievement[]>([])
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(null)

  const currentTheme = THEME_PALETTES[settings.snakeTheme]

  // Set canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      setCanvasWidth(window.innerWidth)
      setCanvasHeight(window.innerHeight)
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Page transition function
  const navigateToPage = useCallback((page: typeof currentPage) => {
    setPageTransition(true)
    setTimeout(() => {
      setCurrentPage(page)
      setPageTransition(false)
    }, 200) // Match CSS transition duration
  }, [])

  // Create fireworks for achievements
  const createFireworks = useCallback(
    (count = 3) => {
      const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#ffeaa7", "#dda0dd", "#98d8c8"]
      const newFireworks: Firework[] = []

      for (let i = 0; i < count; i++) {
        const firework: Firework = {
          x: Math.random() * canvasWidth,
          y: Math.random() * (canvasHeight * 0.6) + canvasHeight * 0.2,
          life: 120,
          particles: [],
        }

        for (let j = 0; j < 25; j++) {
          const angle = (Math.PI * 2 * j) / 25
          const velocity = Math.random() * 4 + 2
          firework.particles.push({
            x: firework.x,
            y: firework.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 80 + Math.random() * 40,
            maxLife: 80 + Math.random() * 40,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 3 + 2,
            trail: [],
          })
        }

        newFireworks.push(firework)
      }

      setFireworks((prev) => [...prev, ...newFireworks])
    },
    [canvasWidth, canvasHeight],
  )

  // Initialize achievements
  useEffect(() => {
    const achievementList: Achievement[] = [
      {
        id: "first-food",
        name: "First Taste",
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
        name: "Serpent Master",
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
        name: "Insane Serpent",
        description: "Score 200+ on Insane difficulty",
        icon: <Target className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.score >= 200 && settings.difficulty === "insane",
      },
      {
        id: "qte-master",
        name: "QTE Master",
        description: "Successfully complete 5 QTEs",
        icon: <Gamepad2 className="w-4 h-4" />,
        unlocked: false,
        condition: (stats) => stats.qteSuccesses >= 5,
      },
    ]
    setOverallAchievements(achievementList) // For menu display
    setSessionAchievements(achievementList.map((a) => ({ ...a, unlocked: false }))) // For session tracking
  }, [settings.difficulty])

  // Load saved data
  useEffect(() => {
    const savedHighScore = localStorage.getItem("serpentineHighScore")
    const savedOverallStats = localStorage.getItem("serpentineOverallStats")
    const savedOverallAchievements = localStorage.getItem("serpentineOverallAchievements")
    const savedSettings = localStorage.getItem("serpentineSettings")

    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore))
    if (savedOverallStats) setOverallStats(JSON.parse(savedOverallStats))
    if (savedSettings) setSettings(JSON.parse(savedSettings))
    if (savedOverallAchievements) {
      const saved = JSON.parse(savedOverallAchievements)
      setOverallAchievements((prev) =>
        prev.map((ach) => ({
          ...ach,
          unlocked: saved.includes(ach.id),
        })),
      )
    }
  }, [])

  // Save settings
  useEffect(() => {
    localStorage.setItem("serpentineSettings", JSON.stringify(settings))
  }, [settings])

  // Check for new achievements (overall and session)
  useEffect(() => {
    // Check overall achievements
    overallAchievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(overallStats)) {
        setOverallAchievements((prev) =>
          prev.map((ach) => (ach.id === achievement.id ? { ...ach, unlocked: true } : ach)),
        )
        setShowAchievement(achievement)
        createFireworks(5)
        setTimeout(() => setShowAchievement(null), 1000) // Show for 1 second

        const unlockedIds = overallAchievements.filter((a) => a.unlocked || a.id === achievement.id).map((a) => a.id)
        localStorage.setItem("serpentineOverallAchievements", JSON.stringify(unlockedIds))
      }
    })

    // Check session achievements (for in-game display)
    sessionAchievements.forEach((achievement) => {
      if (!achievement.unlocked && achievement.condition(overallStats)) {
        setSessionAchievements((prev) =>
          prev.map((ach) => (ach.id === achievement.id ? { ...ach, unlocked: true } : ach)),
        )
      }
    })
  }, [overallStats, overallAchievements, sessionAchievements, createFireworks])

  const generateFood = useCallback((): Food => {
    const types: Array<{ type: Food["type"]; points: number; color: string; emoji: string; weight: number }> = [
      { type: "apple", points: 10, color: "#ef4444", emoji: "🍎", weight: 40 },
      { type: "cherry", points: 20, color: "#ec4899", emoji: "🍒", weight: 20 },
      { type: "gem", points: 50, color: "#06b6d4", emoji: "💎", weight: 10 },
      { type: "speed", points: 15, color: "#eab308", emoji: "⚡", weight: 5 },
      { type: "multiplier", points: 25, color: "#f97316", emoji: "✨", weight: 5 },
      { type: "slow", points: 5, color: "#84cc16", emoji: "🐢", weight: 5 },
      { type: "shield", points: 30, color: "#6366f1", emoji: "🛡️", weight: 3 },
      { type: "qte", points: 100, color: "#a855f7", emoji: "🎯", weight: 2 },
    ]

    const totalWeight = types.reduce((sum, type) => sum + type.weight, 0)
    let random = Math.random() * totalWeight

    const selectedType =
      types.find((type) => {
        random -= type.weight
        return random <= 0
      }) || types[0]

    const maxX = Math.floor(canvasWidth / GRID_SIZE)
    const maxY = Math.floor(canvasHeight / GRID_SIZE)

    let position: Position
    let isValidPosition = false
    while (!isValidPosition) {
      position = {
        x: Math.floor(Math.random() * maxX),
        y: Math.floor(Math.random() * maxY),
      }
      // Ensure food doesn't spawn on snake or obstacles
      const onSnake = snake.some((s) => s.x === position.x && s.y === position.y)
      const onObstacle = obstacles.some((o) => o.x === position.x && o.y === position.y)
      if (!onSnake && !onObstacle) {
        isValidPosition = true
      }
    }

    return {
      position: position!,
      ...selectedType,
    }
  }, [canvasWidth, canvasHeight, snake, obstacles])

  const createParticles = useCallback((x: number, y: number, foodType: Food["type"]) => {
    let color: string
    let count: number
    let size: number
    let shape: Particle["shape"] = "circle"

    switch (foodType) {
      case "apple":
        color = "#ef4444"
        count = 8
        size = 4
        break
      case "cherry":
        color = "#ec4899"
        count = 12
        size = 5
        break
      case "gem":
        color = "#06b6d4"
        count = 15
        size = 6
        shape = "square"
        break
      case "speed":
        color = "#eab308"
        count = 10
        size = 4
        break
      case "multiplier":
        color = "#f97316"
        count = 10
        size = 4
        break
      case "slow":
        color = "#84cc16"
        count = 8
        size = 4
        break
      case "shield":
        color = "#6366f1"
        count = 12
        size = 5
        break
      case "qte":
        color = "#a855f7"
        count = 20
        size = 6
        shape = "square"
        break
      default:
        color = "#ffffff"
        count = 8
        size = 4
    }

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
        size: Math.random() * size + 2,
        shape,
      })
    }
    setParticles((prev) => [...prev, ...newParticles])
  }, [])

  const resetGame = useCallback(() => {
    const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty]
    const maxX = Math.floor(canvasWidth / GRID_SIZE)
    const maxY = Math.floor(canvasHeight / GRID_SIZE)

    const startX = Math.floor(maxX / 2)
    const startY = Math.floor(maxY / 2)

    setSnake([{ x: startX, y: startY }])
    setDirection({ x: 1, y: 0 })
    setScore(0)
    setSpeed(difficultySettings.baseSpeed)
    setMultiplier(1)
    setMultiplierTime(0)
    setInvincibilityTime(0)
    setParticles([])
    setFireworks([])
    setGameState("playing")
    setLevel(0) // Start at level 0
    setObstacles(LEVEL_DATA[0].obstacles)
    setFood(Array.from({ length: difficultySettings.foodCount }, () => generateFood()))
    setLevelUpMessage(false)
    setIsQTEActive(false)
    setQTEKey("")
    setQTETimer(0)

    // Reset session achievements
    setSessionAchievements((prev) => prev.map((a) => ({ ...a, unlocked: false })))

    // Update overall game count
    setOverallStats((prev) => ({
      ...prev,
      score: 0,
      foodEaten: 0,
      maxLength: 1,
      gamesPlayed: prev.gamesPlayed + 1,
      qteSuccesses: 0, // Reset QTE successes for new game session
    }))
  }, [generateFood, settings.difficulty, canvasWidth, canvasHeight])

  const startGame = useCallback(() => {
    resetGame()
    navigateToPage("game")
  }, [resetGame, navigateToPage])

  const pauseGame = useCallback(() => {
    setGameState(gameState === "paused" ? "playing" : "paused")
  }, [gameState])

  const levelUp = useCallback(() => {
    const nextLevel = level + 1
    if (nextLevel < LEVEL_DATA.length) {
      setLevel(nextLevel)
      setObstacles(LEVEL_DATA[nextLevel].obstacles)
      setFood(Array.from({ length: DIFFICULTY_SETTINGS[settings.difficulty].foodCount }, () => generateFood()))
      setLevelUpMessage(true)
      setTimeout(() => setLevelUpMessage(false), 2000)
    } else {
      // Game completed! Or loop back to first level with increased difficulty
      setLevelUpMessage(true)
      setTimeout(() => setLevelUpMessage(false), 2000)
      // For now, just stay on the last level
    }
  }, [level, generateFood, settings.difficulty])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentPage === "game") {
        const key = e.key.toLowerCase()

        if (isQTEActive) {
          if (key === qteKey) {
            setOverallStats((prev) => ({ ...prev, qteSuccesses: prev.qteSuccesses + 1 }))
            setScore((prev) => prev + 100 * multiplier) // Bonus points for QTE
            setIsQTEActive(false)
            setQTEKey("")
            setQTETimer(0)
            createParticles(snake[0].x, snake[0].y, "qte") // QTE success particles
          } else {
            // QTE failed
            setIsQTEActive(false)
            setQTEKey("")
            setQTETimer(0)
            setScore((prev) => Math.max(0, prev - 50)) // Penalty for QTE failure
          }
          e.preventDefault()
          return
        }

        if (gameState === "playing") {
          const isWASD = settings.controlScheme === "wasd" || settings.controlScheme === "both"
          const isArrows = settings.controlScheme === "arrows" || settings.controlScheme === "both"

          if ((isWASD && key === "w") || (isArrows && key === "arrowup")) {
            e.preventDefault()
            setDirection((prev) => (prev.y === 0 ? { x: 0, y: -1 } : prev))
          } else if ((isWASD && key === "s") || (isArrows && key === "arrowdown")) {
            e.preventDefault()
            setDirection((prev) => (prev.y === 0 ? { x: 0, y: 1 } : prev))
          } else if ((isWASD && key === "a") || (isArrows && key === "arrowleft")) {
            e.preventDefault()
            setDirection((prev) => (prev.x === 0 ? { x: -1, y: 0 } : prev))
          } else if ((isWASD && key === "d") || (isArrows && key === "arrowright")) {
            e.preventDefault()
            setDirection((prev) => (prev.x === 0 ? { x: 1, y: 0 } : prev))
          }
        }

        if (e.key === " " && currentPage === "game") {
          e.preventDefault()
          pauseGame()
        }
      }

      if (e.key === "Escape") {
        if (currentPage === "game") navigateToPage("menu")
        else if (currentPage === "settings") navigateToPage("menu")
        else if (currentPage === "achievements") navigateToPage("menu")
        else if (currentPage === "stats") navigateToPage("menu")
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [
    currentPage,
    gameState,
    settings.controlScheme,
    pauseGame,
    navigateToPage,
    isQTEActive,
    qteKey,
    multiplier,
    snake,
    createParticles,
  ])

  // Separate rendering function
  const renderGame = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || currentPage !== "game") return

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
    snake.forEach((segment, index) => {
      ctx.fillStyle = themeFunction(index)
      ctx.shadowColor = ctx.fillStyle
      ctx.shadowBlur = 8

      const x = segment.x * GRID_SIZE
      const y = segment.y * GRID_SIZE

      ctx.beginPath()
      ctx.roundRect(x + 2, y + 2, GRID_SIZE - 4, GRID_SIZE - 4, 4)
      ctx.fill()

      if (index === 0) {
        // Invincibility glow
        if (invincibilityTime > 0) {
          const glowAlpha = Math.sin(Date.now() * 0.01) * 0.5 + 0.5 // Pulsing effect
          ctx.shadowColor = currentTheme.highlight3
          ctx.shadowBlur = 20 * glowAlpha
        }

        ctx.fillStyle = "white"
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
    ctx.shadowBlur = 0

    // Draw food
    food.forEach((f) => {
      const x = f.position.x * GRID_SIZE
      const y = f.position.y * GRID_SIZE

      ctx.fillStyle = f.color
      ctx.shadowColor = f.color
      ctx.shadowBlur = 10

      ctx.beginPath()
      ctx.arc(x + GRID_SIZE / 2, y + GRID_SIZE / 2, GRID_SIZE / 2 - 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.shadowBlur = 0
      ctx.font = "14px Arial"
      ctx.textAlign = "center"
      ctx.fillText(f.emoji, x + GRID_SIZE / 2, y + GRID_SIZE / 2 + 4)
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
  }, [
    snake,
    food,
    particles,
    currentPage,
    settings.showGrid,
    settings.snakeTheme,
    canvasWidth,
    canvasHeight,
    obstacles,
    invincibilityTime,
    currentTheme,
  ])

  // Continuous rendering loop for smooth gameplay
  useEffect(() => {
    if (currentPage === "game") {
      const render = () => {
        renderGame()
        renderRef.current = requestAnimationFrame(render)
      }
      renderRef.current = requestAnimationFrame(render)
    }

    return () => {
      if (renderRef.current) {
        cancelAnimationFrame(renderRef.current)
      }
    }
  }, [currentPage, renderGame])

  // Game loop
  useEffect(() => {
    if (currentPage !== "game" || gameState !== "playing" || isQTEActive) return

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= speed) {
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake]
          const head = { ...newSnake[0] }

          head.x += direction.x
          head.y += direction.y

          // Screen wrapping
          const maxX = Math.floor(canvasWidth / GRID_SIZE)
          const maxY = Math.floor(canvasHeight / GRID_SIZE)

          if (head.x < 0) head.x = maxX - 1
          if (head.x >= maxX) head.x = 0
          if (head.y < 0) head.y = maxY - 1
          if (head.y >= maxY) head.y = 0

          // Self collision - check against body (not head)
          const selfCollision = newSnake.slice(1).some((segment) => segment.x === head.x && segment.y === head.y)
          // Obstacle collision
          const obstacleCollision = obstacles.some((obstacle) => obstacle.x === head.x && obstacle.y === head.y)

          if ((selfCollision || obstacleCollision) && invincibilityTime <= 0) {
            const finalScore = score
            if (finalScore > highScore) {
              setHighScore(finalScore)
              localStorage.setItem("serpentineHighScore", finalScore.toString())
            }
            setOverallStats((prev) => {
              const newStats = { ...prev, totalScore: prev.totalScore + finalScore }
              localStorage.setItem("serpentineOverallStats", JSON.stringify(newStats))
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
            setOverallStats((prev) => ({
              ...prev,
              score: prev.score + points,
              foodEaten: prev.foodEaten + 1,
              maxLength: Math.max(prev.maxLength, newSnake.length),
            }))

            createParticles(head.x, head.y, eatenFood.type)

            // Special food effects
            if (eatenFood.type === "speed") {
              setSpeed((prev) => Math.max(50, prev - 20))
            } else if (eatenFood.type === "multiplier") {
              setMultiplier(2)
              setMultiplierTime(300) // 5 seconds
            } else if (eatenFood.type === "slow") {
              setSpeed((prev) => Math.min(400, prev + 50)) // Slow down
            } else if (eatenFood.type === "shield") {
              setInvincibilityTime(300) // 5 seconds invincibility
            } else if (eatenFood.type === "qte") {
              setIsQTEActive(true)
              setQTEKey(QTE_KEYS[Math.floor(Math.random() * QTE_KEYS.length)])
              setQTETimer(60) // 1 second to react
            }

            setFood((prev) => {
              const newFood = [...prev]
              newFood.splice(eatenFoodIndex, 1)
              newFood.push(generateFood())
              return newFood
            })

            const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty]
            setSpeed((prev) => Math.max(50, prev - difficultySettings.speedIncrease))
          } else {
            newSnake.pop()
          }

          return newSnake
        })

        // Check for level up
        if (level < LEVEL_DATA.length && score >= LEVEL_DATA[level].targetScore) {
          levelUp()
        }

        setMultiplierTime((prev) => {
          if (prev > 0) {
            const newTime = prev - 1
            if (newTime === 0) setMultiplier(1)
            return newTime
          }
          return 0
        })

        setInvincibilityTime((prev) => Math.max(0, prev - 1))

        // QTE timer
        setQTETimer((prev) => {
          if (isQTEActive && prev > 0) {
            const newTime = prev - 1
            if (newTime === 0) {
              // QTE failed due to timeout
              setIsQTEActive(false)
              setQTEKey("")
              setScore((prevScore) => Math.max(0, prevScore - 50)) // Penalty
            }
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

      // Update fireworks
      setFireworks((prev) =>
        prev
          .map((firework) => ({
            ...firework,
            life: firework.life - 1,
            particles: firework.particles
              .map((particle) => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vx: particle.vx * 0.98,
                vy: particle.vy * 0.98 + 0.1,
                life: particle.life - 1,
                trail: [...particle.trail.slice(-8), { x: particle.x, y: particle.y }],
              }))
              .filter((particle) => particle.life > 0),
          }))
          .filter((firework) => firework.life > 0 && firework.particles.length > 0),
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
    canvasWidth,
    canvasHeight,
    obstacles,
    level,
    levelUp,
    invincibilityTime,
    isQTEActive,
    qteKey,
  ])

  // Initialize food when canvas dimensions are available
  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0 && food.length === 0) {
      const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty]
      setFood(Array.from({ length: difficultySettings.foodCount }, () => generateFood()))
    }
  }, [canvasWidth, canvasHeight, food.length, generateFood, settings.difficulty])

  // Menu Page
  const MenuPage = () => (
    <div
      className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6`}
    >
      <div className="text-center mb-8">
        <h1
          className={`text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.accentGradient} mb-2`}
        >
          SERPENTINE ODYSSEY
        </h1>
        <p className={`text-lg ${currentTheme.textMuted}`}>A Minimalist Snake Experience</p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button
          onClick={startGame}
          size="lg"
          className={`h-14 text-xl bg-gradient-to-r ${currentTheme.successGradient} text-black font-medium hover:scale-105 transition-all`}
        >
          <Play className="w-6 h-6 mr-3" />
          Play Game
        </Button>

        <Button
          onClick={() => navigateToPage("settings")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all`}
        >
          <Settings className="w-6 h-6 mr-3" />
          Settings
        </Button>

        <Button
          onClick={() => navigateToPage("achievements")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all`}
        >
          <Award className="w-6 h-6 mr-3" />
          Achievements
        </Button>

        <Button
          onClick={() => navigateToPage("stats")}
          size="lg"
          variant="outline"
          className={`h-14 text-xl ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all`}
        >
          <BarChart2 className="w-6 h-6 mr-3" />
          Statistics
        </Button>
      </div>
    </div>
  )

  // Settings Page
  const SettingsPage = () => (
    <div
      className={`h-screen flex flex-col bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6 ${currentTheme.textPrimary}`}
    >
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => navigateToPage("menu")}
          variant="ghost"
          className={`${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Settings</h1>
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
                  <SelectTrigger className={`${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder}`}>
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
                  <SelectTrigger className={`${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder}`}>
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
                  <SelectTrigger className={`${currentTheme.selectTriggerBg} ${currentTheme.selectTriggerBorder}`}>
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

  // Achievements Page
  const AchievementsPage = () => (
    <div
      className={`h-screen flex flex-col bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6 ${currentTheme.textPrimary}`}
    >
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => navigateToPage("menu")}
          variant="ghost"
          className={`${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Achievements</h1>
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
                  achievement.unlocked
                    ? currentTheme.successGradient.replace("from-", "bg-gradient-to-r from-").replace("to-", "to-")
                    : currentTheme.badgeLockedBg
                } text-black`}
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

  // Statistics Page
  const StatsPage = () => (
    <div
      className={`h-screen flex flex-col bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6 ${currentTheme.textPrimary}`}
    >
      <div className="flex items-center justify-between mb-6">
        <Button
          onClick={() => navigateToPage("menu")}
          variant="ghost"
          className={`${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Statistics</h1>
        <div className="w-20" /> {/* Spacer */}
      </div>

      <div className="flex-1 overflow-y-auto">
        <Card
          className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm max-w-2xl mx-auto`}
        >
          <h2 className="text-xl font-bold mb-4 flex items-center">
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
              <div className={`text-3xl font-bold ${currentTheme.highlight2}`}>{overallStats.qteSuccesses}</div>
              <div className={`text-sm ${currentTheme.textMuted}`}>QTEs Completed</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )

  // Game Page
  const GamePage = () => (
    <div className="h-screen w-screen relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="flex gap-4">
          <div className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <span className={`text-sm ${currentTheme.textMuted}`}>Score: </span>
            <span className={`${currentTheme.highlight1} font-bold`}>{score}</span>
          </div>
          <div className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
            <span className={`text-sm ${currentTheme.textMuted}`}>Length: </span>
            <span className={`${currentTheme.highlight2} font-bold`}>{snake.length}</span>
          </div>
          {multiplier > 1 && (
            <div
              className={`px-3 py-1 rounded ${currentTheme.warningGradient.replace("from-", "bg-gradient-to-r from-").replace("to-", "to-").replace("via-", "bg-")}/20 border ${currentTheme.warningGradient.replace("from-", "border-").replace("to-", "border-").replace("via-", "border-")}/50 backdrop-blur-sm`}
            >
              <span className={`${currentTheme.highlight4} font-bold`}>{multiplier}x</span>
            </div>
          )}
          {invincibilityTime > 0 && (
            <div
              className={`px-3 py-1 rounded ${currentTheme.highlight3.replace("text-", "bg-")}/20 border ${currentTheme.highlight3.replace("text-", "border-")}/50 backdrop-blur-sm`}
            >
              <span className={`${currentTheme.highlight3} font-bold`}>🛡️</span>
            </div>
          )}
        </div>

        <div className={`px-3 py-1 rounded ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm`}>
          <span className={`text-sm ${currentTheme.textMuted}`}>High: </span>
          <span className={`${currentTheme.highlight3} font-bold`}>{highScore}</span>
        </div>
      </div>

      {/* Level Up Message */}
      {levelUpMessage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in zoom-in duration-300 fade-out-500">
          <h2
            className={`text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.successGradient}`}
          >
            LEVEL {level + 1}!
          </h2>
        </div>
      )}

      {/* QTE Prompt */}
      {isQTEActive && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 animate-in zoom-in duration-100">
          <Card className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm text-center`}>
            <h2 className={`text-5xl font-bold ${currentTheme.highlight3} mb-4`}>{qteKey.toUpperCase()}</h2>
            <p className={`text-lg ${currentTheme.textMuted}`}>Press the key!</p>
            <div className={`w-full h-2 bg-gray-700 rounded-full mt-4`}>
              <div
                className={`h-full ${currentTheme.accentGradient.replace("from-", "bg-gradient-to-r from-").replace("to-", "to-")} rounded-full transition-all duration-100`}
                style={{ width: `${(qteTimer / 60) * 100}%` }}
              />
            </div>
          </Card>
        </div>
      )}

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
                className={`bg-gradient-to-r ${currentTheme.successGradient} text-black font-medium`}
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button
                onClick={() => navigateToPage("menu")}
                variant="outline"
                className={`${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg}`}
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

  // Game Over Page
  const GameOverPage = () => (
    <div
      className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br ${currentTheme.primaryBgClasses} p-6`}
    >
      <div className="text-center mb-8">
        <h1
          className={`text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${currentTheme.dangerGradient} mb-4`}
        >
          Game Over
        </h1>
        <div className="text-4xl mb-4">🐍</div>
      </div>

      <Card
        className={`p-6 ${currentTheme.surfaceBg} ${currentTheme.surfaceBorder} backdrop-blur-sm mb-8 w-full max-w-md`}
      >
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight1}`}>{score}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Final Score</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight2}`}>{highScore}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>High Score</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight3}`}>{snake.length}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Length</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${currentTheme.highlight4}`}>{settings.difficulty}</div>
            <div className={`text-sm ${currentTheme.textMuted}`}>Difficulty</div>
          </div>
        </div>

        {score === highScore && score > 0 && (
          <div className={`text-center mt-4 ${currentTheme.highlight4} font-bold animate-pulse`}>
            🎉 New High Score! 🎉
          </div>
        )}
      </Card>

      <div className="flex gap-4">
        <Button
          onClick={startGame}
          size="lg"
          className={`h-14 text-xl bg-gradient-to-r ${currentTheme.successGradient} text-black font-medium hover:scale-105 transition-all`}
        >
          <RotateCcw className="w-6 h-6 mr-3" />
          Play Again
        </Button>
        <Button
          onClick={() => navigateToPage("menu")}
          variant="outline"
          size="lg"
          className={`h-14 text-xl ${currentTheme.buttonOutlineBorder} ${currentTheme.textPrimary} ${currentTheme.buttonOutlineHoverBg} hover:scale-105 transition-all`}
        >
          <Home className="w-6 h-6 mr-3" />
          Menu
        </Button>
      </div>
    </div>
  )

  return (
    <div
      className={`transition-all duration-200 ${pageTransition ? "opacity-0 translate-y-4 scale-95" : "opacity-100 translate-y-0 scale-100"}`}
    >
      {/* Achievement Notification with Fireworks */}
      {showAchievement && (
        <>
          {/* Fireworks Canvas */}
          <div className="fixed inset-0 z-40 pointer-events-none">
            <canvas
              width={canvasWidth}
              height={canvasHeight}
              className="absolute inset-0"
              ref={(canvas) => {
                if (canvas && fireworks.length > 0) {
                  const ctx = canvas.getContext("2d")
                  if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                    fireworks.forEach((firework) => {
                      firework.particles.forEach((particle) => {
                        const alpha = particle.life / particle.maxLife

                        // Draw trail
                        if (particle.trail.length > 1) {
                          ctx.strokeStyle =
                            particle.color +
                            Math.floor(alpha * 128)
                              .toString(16)
                              .padStart(2, "0")
                          ctx.lineWidth = 2
                          ctx.beginPath()
                          ctx.moveTo(particle.trail[0].x, particle.trail[0].y)
                          particle.trail.forEach((point) => ctx.lineTo(point.x, point.y))
                          ctx.stroke()
                        }

                        // Draw particle
                        ctx.fillStyle =
                          particle.color +
                          Math.floor(alpha * 255)
                            .toString(16)
                            .padStart(2, "0")
                        ctx.shadowColor = particle.color
                        ctx.shadowBlur = 8

                        ctx.beginPath()
                        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2)
                        ctx.fill()
                      })
                    })
                    ctx.shadowBlur = 0
                  }
                }
              }}
            />
          </div>

          {/* Achievement Card */}
          <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300 fade-out-1000">
            <Card className={`p-4 bg-gradient-to-r ${currentTheme.warningGradient} text-black border-0 shadow-2xl`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">{showAchievement.icon}</div>
                <div>
                  <h3 className="font-bold">Achievement Unlocked!</h3>
                  <p className="text-sm">{showAchievement.name}</p>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}

      {currentPage === "menu" && <MenuPage />}
      {currentPage === "settings" && <SettingsPage />}
      {currentPage === "achievements" && <AchievementsPage />}
      {currentPage === "stats" && <StatsPage />}
      {currentPage === "game" && <GamePage />}
      {currentPage === "gameOver" && <GameOverPage />}
    </div>
  )
}
