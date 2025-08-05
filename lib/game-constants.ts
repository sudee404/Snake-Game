export const GRID_SIZE = 20
export const MAX_LIVES = 5 // Maximum lives a player can have
export const ACHIEVEMENT_CURRENCY_REWARD = 50 // Currency rewarded for unlocking an achievement
export const LIVES_REGEN_INTERVAL_SECONDS = 300 // 5 minutes
export const LIVES_REGEN_AMOUNT = 1 // Lives gained per interval

// Define a standard grid size for level design, which will then be centered on the actual canvas
export const GRID_COLS = 20
export const GRID_ROWS = 20

export type GameMode = "levels" | "endless" | "coop"

export interface Position {
  x: number
  y: number
}

export interface Food {
  position: Position
  type:
    | "apple"
    | "cherry"
    | "gem"
    | "speed"
    | "multiplier"
    | "slow"
    | "shield"
    | "growth"
    | "teleport"
    | "shrink"
    | "fragile-walls"
    | "poison" // New food type
    | "life-potion" // New food type
  points: number
  color: string
  emoji: string
  weight: number // New: for food rarity
  timeLeft?: number // Optional: for foods that disappear after a set time
  shape: "circle" | "square" | "diamond" | "star" | "hexagon" | "heart" // New: for distinct food appearance
  flashColor?: string // New: for special food glow
  sideEffect?: string // New: description of the side effect
  snakeEffect?: "glow" | "transparent" | "tint-green" | "tint-dark" | "pulse-bright" | "pulse-dim" // Visual effect on snake
}

export interface Particle {
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

export interface Firework {
  x: number
  y: number
  particles: FireworkParticle[]
  life: number
}

export interface FireworkParticle {
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

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string // Changed to string for emoji
  unlocked: boolean
  condition: (stats: GameStats) => boolean
  toolRewardId?: string // Optional: ID of tool rewarded
}

export interface DailyChallenge {
  id: string
  name: string
  description: string
  condition: (stats: GameStats) => boolean
  rewardType: "currency" | "theme"
  rewardId?: string // For theme ID
  rewardAmount?: number // For currency
}

export interface GameStats {
  obstaclesBroken: number
  score: number
  foodEaten: number
  foodEatenByType: Record<Food["type"], number> // New: Track food eaten by type
  maxLength: number
  gamesPlayed: number
  totalScore: number
  levelsCleared: number // New stat
  shrinkPotionsEaten: number // New stat
  totalPlayTime: number // New stat: total seconds played
  totalDeaths: number // New stat
  poisonCuredCount: number // New stat: how many times poison was cured
  totalCurrencyEarned: number // New: Track total currency earned
}

export interface GameSettings {
  difficulty: "easy" | "normal" | "hard" | "insane"
  soundEnabled: boolean
  showGrid: boolean
  snakeTheme: "aurora" | "ocean" | "sunset" | "cosmic" | "neon" | "forest" | "lava" // Added new themes
  controlScheme: "wasd" | "arrows" | "both"
}

export interface LevelData {
  targetScore: number
  obstacles: Position[]
}

export interface ThemePalette {
  primaryBgClasses: string
  primaryBgColors: [string, string, string] // Hex values for canvas gradient
  accentGradient: string
  successGradient: string
  successGradientColors: [string, string] // New: for positive shockwave
  warningGradient: string
  dangerGradient: string
  dangerGradientColors: [string, string] // New: for fragile walls and negative shockwave
  surfaceBg: string
  surfaceBorder: string
  textPrimary: string
  textMuted: string
  highlight1: string
  highlight2: string
  highlight3: string
  highlight4: string
  buttonOutlineBorder: string
  buttonOutlineHoverBg: string
  buttonPrimaryTextColor: string // Added for primary button text color
  selectTriggerBg: string
  selectTriggerBorder: string
  selectContentBg: string
  selectItemHoverBg: string
  badgeUnlockedBg: string
  badgeLockedBg: string
  invincibilityGlowColor: string // New: Color for invincibility buff glow
  multiplierGlowColor: string // New: Color for multiplier buff glow
}

export interface Tool {
  id: string
  name: string
  description: string
  cost: number
  icon: string // Emoji or icon string
  initialUses: number // How many uses a tool comes with when purchased/rewarded
  stackable: boolean // Can multiple uses be accumulated?
}

export const DIFFICULTY_SETTINGS = {
  easy: { baseSpeed: 200, speedIncrease: 0.5, foodCount: 3 },
  normal: { baseSpeed: 150, speedIncrease: 1, foodCount: 2 },
  hard: { baseSpeed: 100, speedIncrease: 1.5, foodCount: 2 },
  insane: { baseSpeed: 80, speedIncrease: 2, foodCount: 1 },
}

export const SNAKE_THEMES = {
  aurora: (index: number) => `hsl(${(180 + index * 8) % 360}, 70%, ${65 - index * 1}%)`,
  ocean: (index: number) => `hsl(${(200 + index * 5) % 360}, 80%, ${60 - index * 1}%)`,
  sunset: (index: number) => `hsl(${(30 - index * 3) % 360}, 85%, ${70 - index * 1}%)`,
  cosmic: (index: number) => `hsl(${(280 + index * 10) % 360}, 75%, ${65 - index * 1}%)`,
  neon: (index: number) => `hsl(${(120 + index * 15) % 360}, 90%, ${60 - index * 1}%)`, // Bright greens, yellows, pinks
  forest: (index: number) => `hsl(${(80 + index * 5) % 360}, 40%, ${45 - index * 1}%)`, // Earthy greens, browns
  lava: (index: number) => `hsl(${(0 + index * 10) % 360}, 90%, ${50 - index * 1}%)`, // Fiery reds, oranges
}

export const THEME_PALETTES: Record<GameSettings["snakeTheme"], ThemePalette> = {
  aurora: {
    primaryBgClasses: "from-slate-900 via-purple-900 to-slate-900",
    primaryBgColors: ["#0f172a", "#581c87", "#0f172a"], // Hex values for canvas gradient
    accentGradient: "from-cyan-400 to-purple-500",
    successGradient: "from-emerald-500 to-teal-500",
    successGradientColors: ["#34d399", "#2dd4bf"], // Green-teal for positive shockwave
    warningGradient: "from-amber-400 to-orange-500",
    dangerGradient: "from-red-400 to-pink-500",
    dangerGradientColors: ["#ef4444", "#f43f5e"], // Red-pink for fragile walls and negative shockwave
    surfaceBg: "bg-slate-900/30", // Increased transparency
    surfaceBorder: "border-slate-700/50",
    textPrimary: "text-slate-100 hover:text-white",
    textMuted: "text-slate-400",
    highlight1: "text-cyan-400",
    highlight2: "text-emerald-400",
    highlight3: "text-purple-400",
    highlight4: "text-amber-400",
    buttonOutlineBorder: "border-slate-600",
    buttonOutlineHoverBg: "hover:bg-slate-800/50",
    buttonPrimaryTextColor: "text-white",
    selectTriggerBg: "bg-slate-800/50",
    selectTriggerBorder: "border-slate-600",
    selectContentBg: "bg-slate-800",
    selectItemHoverBg: "focus:bg-slate-700",
    badgeUnlockedBg: "bg-gradient-to-r from-cyan-400 to-purple-500",
    badgeLockedBg: "bg-slate-700",
    invincibilityGlowColor: "#a78bfa", // Purple-ish for shield
    multiplierGlowColor: "#f97316", // Orange for multiplier
  },
  ocean: {
    primaryBgClasses: "from-blue-950 via-blue-800 to-blue-950",
    primaryBgColors: ["#071a2b", "#1e40af", "#071a2b"], // Hex values for canvas gradient
    accentGradient: "from-sky-400 to-blue-500",
    successGradient: "from-green-500 to-cyan-500",
    successGradientColors: ["#34d399", "#2dd4bf"], // Green-teal for positive shockwave
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-red-500 to-rose-600",
    dangerGradientColors: ["#ef4444", "#f43f5e"], // Red-pink for fragile walls and negative shockwave
    surfaceBg: "bg-blue-900/30", // Increased transparency
    surfaceBorder: "border-blue-700/50",
    textPrimary: "text-blue-100 hover:text-white",
    textMuted: "text-blue-400",
    highlight1: "text-sky-400",
    highlight2: "text-green-400",
    highlight3: "text-indigo-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-blue-600",
    buttonOutlineHoverBg: "hover:bg-blue-800/50",
    buttonPrimaryTextColor: "text-white",
    selectTriggerBg: "bg-blue-800/50",
    selectTriggerBorder: "border-blue-600",
    selectContentBg: "bg-blue-800",
    selectItemHoverBg: "focus:bg-blue-700",
    badgeUnlockedBg: "bg-gradient-to-r from-sky-400 to-blue-500",
    badgeLockedBg: "bg-blue-700",
    invincibilityGlowColor: "#6366f1", // Indigo for shield
    multiplierGlowColor: "#f97316", // Orange for multiplier
  },
  sunset: {
    primaryBgClasses: "from-red-950 via-orange-900 to-red-950",
    primaryBgColors: ["#450a0a", "#7c2d12", "#450a0a"], // Hex values for canvas gradient
    accentGradient: "from-amber-400 to-red-500",
    successGradient: "from-lime-500 to-green-500",
    successGradientColors: ["#34d399", "#2dd4bf"], // Green-teal for positive shockwave
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-purple-400 to-pink-500",
    dangerGradientColors: ["#ef4444", "#f43f5e"], // Red-pink for fragile walls and negative shockwave
    surfaceBg: "bg-red-900/30", // Increased transparency
    surfaceBorder: "border-red-700/50",
    textPrimary: "text-red-100 hover:text-white",
    textMuted: "text-red-400",
    highlight1: "text-amber-400",
    highlight2: "text-lime-400",
    highlight3: "text-orange-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-red-600",
    buttonOutlineHoverBg: "hover:bg-red-800/50",
    buttonPrimaryTextColor: "text-black",
    selectTriggerBg: "bg-red-800/50",
    selectTriggerBorder: "border-red-600",
    selectContentBg: "bg-red-800",
    selectItemHoverBg: "focus:bg-red-700",
    badgeUnlockedBg: "bg-gradient-to-r from-amber-400 to-red-500",
    badgeLockedBg: "bg-red-700",
    invincibilityGlowColor: "#a78bfa", // Purple-ish for shield
    multiplierGlowColor: "#f97316", // Orange for multiplier
  },
  cosmic: {
    primaryBgClasses: "from-purple-950 via-indigo-900 to-purple-950",
    primaryBgColors: ["#3b0764", "#3730a3", "#3b0764"], // Hex values for canvas gradient
    accentGradient: "from-fuchsia-400 to-purple-500",
    successGradient: "from-lime-500 to-emerald-500",
    successGradientColors: ["#34d399", "#2dd4bf"], // Green-teal for positive shockwave
    warningGradient: "from-yellow-400 to-orange-500",
    dangerGradient: "from-red-500 to-pink-600",
    dangerGradientColors: ["#ef4444", "#f43f5e"], // Red-pink for fragile walls and negative shockwave
    surfaceBg: "bg-purple-900/30", // Increased transparency
    surfaceBorder: "border-purple-700/50",
    textPrimary: "text-purple-100 hover:text-white",
    textMuted: "text-purple-400",
    highlight1: "text-fuchsia-400",
    highlight2: "text-lime-400",
    highlight3: "text-indigo-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-purple-600",
    buttonOutlineHoverBg: "hover:bg-purple-800/50",
    buttonPrimaryTextColor: "text-black",
    selectTriggerBg: "bg-purple-800/50",
    selectTriggerBorder: "border-purple-600",
    selectContentBg: "bg-purple-800",
    selectItemHoverBg: "focus:bg-purple-700",
    badgeUnlockedBg: "bg-gradient-to-r from-fuchsia-400 to-purple-500",
    badgeLockedBg: "bg-purple-700",
    invincibilityGlowColor: "#a78bfa", // Purple-ish for shield
    multiplierGlowColor: "#f97316", // Orange for multiplier
  },
  neon: {
    primaryBgClasses: "from-gray-950 via-green-900 to-gray-950",
    primaryBgColors: ["#0a0a0a", "#16a34a", "#0a0a0a"],
    accentGradient: "from-lime-400 to-fuchsia-500",
    successGradient: "from-emerald-400 to-cyan-400",
    successGradientColors: ["#34d399", "#2dd4bf"],
    warningGradient: "from-yellow-300 to-orange-400",
    dangerGradient: "from-red-500 to-pink-500",
    dangerGradientColors: ["#ef4444", "#f43f5e"],
    surfaceBg: "bg-gray-900/30",
    surfaceBorder: "border-gray-700/50",
    textPrimary: "text-lime-300 hover:text-white",
    textMuted: "text-gray-400",
    highlight1: "text-lime-400",
    highlight2: "text-fuchsia-400",
    highlight3: "text-cyan-400",
    highlight4: "text-yellow-400",
    buttonOutlineBorder: "border-gray-600",
    buttonOutlineHoverBg: "hover:bg-gray-800/50",
    buttonPrimaryTextColor: "text-black",
    selectTriggerBg: "bg-gray-800/50",
    selectTriggerBorder: "border-gray-600",
    selectContentBg: "bg-gray-800",
    selectItemHoverBg: "focus:bg-gray-700",
    badgeUnlockedBg: "bg-gradient-to-r from-lime-400 to-fuchsia-500",
    badgeLockedBg: "bg-gray-700",
    invincibilityGlowColor: "#a78bfa",
    multiplierGlowColor: "#f97316",
  },
  forest: {
    primaryBgClasses: "from-green-950 via-emerald-900 to-green-950",
    primaryBgColors: ["#052e16", "#065f46", "#052e16"],
    accentGradient: "from-lime-500 to-green-600",
    successGradient: "from-yellow-500 to-amber-500",
    successGradientColors: ["#facc15", "#fbbf24"],
    warningGradient: "from-orange-400 to-red-500",
    dangerGradient: "from-rose-500 to-red-600",
    dangerGradientColors: ["#ef4444", "#f43f5e"],
    surfaceBg: "bg-green-900/30",
    surfaceBorder: "border-green-700/50",
    textPrimary: "text-green-100 hover:text-white",
    textMuted: "text-green-400",
    highlight1: "text-lime-400",
    highlight2: "text-yellow-400",
    highlight3: "text-emerald-400",
    highlight4: "text-amber-400",
    buttonOutlineBorder: "border-green-600",
    buttonOutlineHoverBg: "hover:bg-green-800/50",
    buttonPrimaryTextColor: "text-white",
    selectTriggerBg: "bg-green-800/50",
    selectTriggerBorder: "border-green-600",
    selectContentBg: "bg-green-800",
    selectItemHoverBg: "focus:bg-green-700",
    badgeUnlockedBg: "bg-gradient-to-r from-lime-500 to-green-600",
    badgeLockedBg: "bg-green-700",
    invincibilityGlowColor: "#a78bfa",
    multiplierGlowColor: "#f97316",
  },
  lava: {
    primaryBgClasses: "from-red-950 via-orange-950 to-red-950",
    primaryBgColors: ["#450a0a", "#7c2d12", "#450a0a"],
    accentGradient: "from-orange-500 to-red-600",
    successGradient: "from-yellow-400 to-orange-500",
    successGradientColors: ["#facc15", "#fbbf24"],
    warningGradient: "from-amber-400 to-yellow-500",
    dangerGradient: "from-gray-500 to-gray-600",
    dangerGradientColors: ["#ef4444", "#f43f5e"],
    surfaceBg: "bg-red-900/30",
    surfaceBorder: "border-red-700/50",
    textPrimary: "text-orange-100 hover:text-white",
    textMuted: "text-red-400",
    highlight1: "text-orange-400",
    highlight2: "text-yellow-400",
    highlight3: "text-red-400",
    highlight4: "text-amber-400",
    buttonOutlineBorder: "border-red-600",
    buttonOutlineHoverBg: "hover:bg-red-800/50",
    buttonPrimaryTextColor: "text-white",
    selectTriggerBg: "bg-red-800/50",
    selectTriggerBorder: "border-red-600",
    selectContentBg: "bg-red-800",
    selectItemHoverBg: "focus:bg-red-700",
    badgeUnlockedBg: "bg-gradient-to-r from-orange-500 to-red-600",
    badgeLockedBg: "bg-red-700",
    invincibilityGlowColor: "#a78bfa",
    multiplierGlowColor: "#f97316",
  },
}

// Helper to generate a block of obstacles
const generateBlock = (startX: number, startY: number, width: number, height: number): Position[] => {
  const block: Position[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      block.push({ x: startX + x, y: startY + y })
    }
  }
  return block
}

// Helper to generate a hollow block
const generateHollowBlock = (startX: number, startY: number, width: number, height: number): Position[] => {
  const block: Position[] = []
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (x === 0 || x === width - 1 || y === 0 || y === height - 1) {
        block.push({ x: startX + x, y: startY + y })
      }
    }
  }
  return block
}

// Function to combine obstacle arrays and remove duplicates
const combineObstacles = (...obstacleArrays: Position[][]): Position[] => {
  const uniquePositions = new Set<string>()
  obstacleArrays.forEach((arr) => {
    arr.forEach((pos) => {
      uniquePositions.add(`${pos.x},${pos.y}`)
    })
  })
  return Array.from(uniquePositions).map((str) => {
    const [x, y] = str.split(",").map(Number)
    return { x, y }
  })
}

export const LEVEL_DATA: LevelData[] = [
  {
    targetScore: 400, // Increased target
    obstacles: [], // Level 1: No obstacles
  },
  {
    targetScore: 1000, // Increased target
    // Level 2: Large central cross (approx 112 cells)
    obstacles: combineObstacles(
      generateBlock(2, 8, 16, 4), // Horizontal bar (x:2-17, y:8-11)
      generateBlock(8, 2, 4, 16), // Vertical bar (x:8-11, y:2-17)
    ),
  },
  {
    targetScore: 2000, // Increased target
    // Level 3: Four solid 5x5 blocks in corners (100 cells)
    obstacles: combineObstacles(
      generateBlock(2, 2, 5, 5), // Top-left
      generateBlock(13, 2, 5, 5), // Top-right
      generateBlock(2, 13, 5, 5), // Bottom-left
      generateBlock(13, 13, 5, 5), // Bottom-right
    ),
  },
  {
    targetScore: 3500, // Increased target
    // Level 4: Central "X" pattern with gaps (approx 128 cells)
    obstacles: combineObstacles(
      generateBlock(2, 2, 3, 3),
      generateBlock(6, 6, 3, 3),
      generateBlock(11, 11, 3, 3),
      generateBlock(15, 15, 3, 3),
      generateBlock(15, 2, 3, 3),
      generateBlock(11, 6, 3, 3),
      generateBlock(6, 11, 3, 3),
      generateBlock(2, 15, 3, 3),
    ),
  },
  {
    targetScore: 5000, // Increased target
    // Level 5: Complex central maze (approx 150+ cells)
    obstacles: combineObstacles(
      generateHollowBlock(1, 1, 18, 18), // Outer ring (64 cells)
      generateBlock(5, 5, 2, 2), // Inner blocks
      generateBlock(13, 5, 2, 2),
      generateBlock(5, 13, 2, 2),
      generateBlock(13, 13, 2, 2),
      generateBlock(9, 7, 2, 6), // Central vertical bar
      generateBlock(7, 9, 6, 2), // Central horizontal bar
    ),
  },
  {
    targetScore: 7000, // New Level 6
    obstacles: combineObstacles(
      generateHollowBlock(0, 0, 20, 20), // Outer wall
      generateBlock(4, 4, 2, 12), // Vertical bars
      generateBlock(14, 4, 2, 12),
      generateBlock(7, 7, 6, 2), // Horizontal bars
      generateBlock(7, 11, 6, 2),
    ),
  },
  {
    targetScore: 9000, // New Level 7
    obstacles: combineObstacles(
      generateBlock(2, 2, 3, 16), // Left wall
      generateBlock(15, 2, 3, 16), // Right wall
      generateBlock(5, 5, 10, 3), // Top middle bar
      generateBlock(5, 12, 10, 3), // Bottom middle bar
      generateBlock(9, 0, 2, 2), // Top center block
      generateBlock(9, 18, 2, 2), // Bottom center block
    ),
  },
  {
    targetScore: 12000, // New Level 8
    obstacles: combineObstacles(
      generateHollowBlock(4, 4, 12, 12), // Inner hollow square
      generateBlock(0, 9, 4, 2), // Left horizontal bar
      generateBlock(16, 9, 4, 2), // Right horizontal bar
      generateBlock(9, 0, 2, 4), // Top vertical bar
      generateBlock(9, 16, 2, 4), // Bottom vertical bar
    ),
  },
  {
    targetScore: 15000, // New Level 9
    obstacles: combineObstacles(
      generateBlock(0, 0, 20, 1), // Top border
      generateBlock(0, 19, 20, 1), // Bottom border
      generateBlock(0, 0, 1, 20), // Left border
      generateBlock(19, 0, 1, 20), // Right border
      generateBlock(4, 4, 1, 12), // Vertical lines
      generateBlock(15, 4, 1, 12),
      generateBlock(4, 4, 12, 1), // Horizontal lines
      generateBlock(4, 15, 12, 1),
      generateBlock(9, 9, 2, 2), // Center block
    ),
  },
  {
    targetScore: 20000, // New Level 10 (Final Challenge)
    obstacles: combineObstacles(
      generateHollowBlock(0, 0, 20, 20), // Outer wall
      generateHollowBlock(3, 3, 14, 14), // Second hollow wall
      generateHollowBlock(6, 6, 8, 8), // Third hollow wall
      generateBlock(9, 9, 2, 2), // Center block
    ),
  },
]

export const TOOLS_DATA: Tool[] = [
  {
    id: "starting-boost",
    name: "Starting Boost",
    description: "Start the level with a temporary speed boost (faster snake).",
    cost: 100,
    icon: "🚀",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "extra-life",
    name: "Extra Life",
    description: "Gain a temporary shield at the start of the level.",
    cost: 150,
    icon: "❤️",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "food-magnet",
    name: "Food Magnet",
    description: "Attracts nearby food towards your snake for a short duration.",
    cost: 150,
    icon: "🧲",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "super-shield",
    name: "Super Shield",
    description: "Grants extended invincibility, protecting from all collisions.",
    cost: 300,
    icon: "🛡️",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "coin-booster",
    name: "Coin Booster",
    description: "Doubles currency earned from food for the entire level.",
    cost: 200,
    icon: "💰",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "obstacle-clearer",
    name: "Obstacle Clearer",
    description: "Clears all obstacles on the current level once equipped.",
    cost: 400,
    icon: "💥",
    initialUses: 1,
    stackable: false, // Not stackable, one-time use per purchase
  },
  {
    id: "wall-breaker",
    name: "Wall Breaker",
    description: "Allows you to pass through obstacles a few times without dying.",
    cost: 200,
    icon: "🔨",
    initialUses: 3, // Can break 3 walls
    stackable: true,
  },
  {
    id: "time-warp",
    name: "Time Warp",
    description: "Slows down the game speed for a short duration at the start of the level.",
    cost: 180,
    icon: "⏳",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "food-radar",
    name: "Food Radar",
    description: "Highlights all food on the map for the entire level.",
    cost: 120,
    icon: "📡",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "length-lock",
    name: "Length Lock",
    description: "Prevents your snake from shrinking for a short period.",
    cost: 160,
    icon: "🔒",
    initialUses: 1,
    stackable: true,
  },
  {
    id: "life-potion",
    name: "Life Potion",
    description: `Instantly gain 1 life (up to ${MAX_LIVES}).`,
    cost: 250,
    icon: "❤️",
    initialUses: 1, // Represents 1 life gained
    stackable: true,
  },
]

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "eat-5-gems",
    name: "Gem Collector",
    description: "Eat 5 Gem (💎) food items in a single game session.",
    condition: (stats) => stats.foodEatenByType.gem >= 5,
    rewardType: "currency",
    rewardAmount: 75,
  },
  {
    id: "reach-length-20",
    name: "Long Serpent",
    description: "Reach a snake length of 20 or more.",
    condition: (stats) => stats.maxLength >= 20,
    rewardType: "currency",
    rewardAmount: 100,
  },
  {
    id: "clear-level-2",
    name: "Level Starter",
    description: "Clear Level 2 in Levels Mode.",
    condition: (stats) => stats.levelsCleared >= 2,
    rewardType: "currency",
    rewardAmount: 120,
  },
  {
    id: "play-3-games",
    name: "Dedicated Player",
    description: "Play 3 games in any mode.",
    condition: (stats) => stats.gamesPlayed >= 3,
    rewardType: "currency",
    rewardAmount: 50,
  },
  {
    id: "earn-100-currency",
    name: "Coin Hoarder",
    description: "Earn a total of 100 currency in a single game session.",
    condition: (stats) => stats.totalCurrencyEarned >= 100,
    rewardType: "theme",
    rewardId: "neon", // Unlock Neon theme
  },
  {
    id: "survive-60-seconds-endless",
    name: "Endless Survivor",
    description: "Survive for 60 seconds in Endless Mode.",
    condition: (stats) => stats.totalPlayTime >= 60, // This condition needs to be checked carefully for endless mode
    rewardType: "theme",
    rewardId: "forest", // Unlock Forest theme
  },
  {
    id: "eat-3-cherries",
    name: "Cherry Picker",
    description: "Eat 3 Cherry (🍒) food items in a single game session.",
    condition: (stats) => stats.foodEatenByType.cherry >= 3,
    rewardType: "currency",
    rewardAmount: 60,
  },
  {
    id: "hit-5-obstacles-wallbreaker",
    name: "Obstacle Breaker",
    description: "Break 5 obstacles using the Wall Breaker tool.",
    condition: (stats) => stats.obstaclesBroken >= 5, // Needs new stat tracking
    rewardType: "theme",
    rewardId: "lava", // Unlock Lava theme
  },
]
