"use client";

import type React from "react";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DIFFICULTY_SETTINGS,
  LEVEL_DATA,
  THEME_PALETTES,
  TOOLS_DATA, // Import TOOLS_DATA
  type Achievement,
  type Food,
  type GameSettings,
  type Position,
  GRID_SIZE,
  MAX_LIVES, // Import MAX_LIVES
  ACHIEVEMENT_CURRENCY_REWARD, // Import ACHIEVEMENT_CURRENCY_REWARD
  LIVES_REGEN_INTERVAL_SECONDS, // Import LIVES_REGEN_AMOUNT
  GRID_COLS, // Import GRID_COLS for obstacle centering
  GRID_ROWS, // Import GRID_ROWS for obstacle centering
  type GameStats, // Import GameStats type
  LIVES_REGEN_AMOUNT,
  type GameMode, // Import GameMode type
  type DailyChallenge, // Import DailyChallenge type
  DAILY_CHALLENGES, // Import DAILY_CHALLENGES
} from "@/lib/game-constants";
import { MenuPage } from "@/components/game/menu-page";
import { SettingsPage } from "@/components/game/settings-page";
import { AchievementsPage } from "@/components/game/achievements-page";
import { StatsPage } from "@/components/game/stats-page";
import { GamePage } from "@/components/game/game-page";
import { GameOverPage } from "@/components/game/game-over-page";
import { AchievementNotification } from "@/components/game/achievement-notification";
import { HelpPage } from "@/components/game/help-page";
import { LevelStartPage } from "@/components/game/level-start-page";
import { ToolsPage } from "@/components/game/tools-page"; // Import ToolsPage
import { LevelSelectPage } from "@/components/game/level-select-page"; // Import LevelSelectPage
import { WelcomeModal } from "@/components/game/welcome-modal"; // Import WelcomeModal
import { ModePage } from "@/components/game/mode-page";

export default function SerpentineOdyssey() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const renderRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const gameStartTimeRef = useRef<number>(0); // To track total play time

  // Audio refs
  const tapSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-game-ball-tap-2073.wav
  const treasureSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-video-game-treasure-2066.wav
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-retro-arcade-casino-notification-211.wav
  const levelCompleteSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-game-level-completed-2059.wav
  const loseSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-player-losing-or-failing-2042.wav
  const unlockNotificationSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-unlock-game-notification-253.wav
  const coinWinSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-winning-a-coin-video-game-2069.wav
  const punchSoundRef = useRef<HTMLAudioElement | null>(null); // mixkit-martial-arts-fast-punch-2047.wav

  // Canvas dimensions
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(600);

  // Game State
  const [currentPage, setCurrentPage] = useState<
    | "menu"
    | "mode"
    | "game"
    | "gameOver"
    | "settings"
    | "achievements"
    | "stats"
    | "help"
    | "levelStart"
    | "tools"
    | "levelSelect"
  >("menu");
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const directionQueue = useRef<Position[]>([]); // New: Queue for buffered inputs
  const [food, setFood] = useState<Food[]>([]);
  const [score, setScore] = useState(0); // Cumulative score for the current game session
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "paused">("playing");
  const [speed, setSpeed] = useState(150);
  const [activeBuffs, setActiveBuffs] = useState<
    Array<{
      type: string;
      timeLeft: number;
      duration: number;
      color: string;
      emoji: string;
      flashColor?: string;
      snakeEffect?:
        | "glow"
        | "transparent"
        | "tint-green"
        | "tint-dark"
        | "pulse-bright"
        | "pulse-dim";
    }> // Added snakeEffect
  >([]);
  const [particles, setParticles] = useState<any[]>([]);
  const [fireworks, setFireworks] = useState<any[]>([]);
  const [isWallFragile, setIsWallFragile] = useState(false); // New state for wall fragility
  const [isPoisoned, setIsPoisoned] = useState(false); // New state for poison debuff
  const [wallBreakerUses, setWallBreakerUses] = useState(0); // For Wall Breaker tool

  // Level State
  const [level, setLevel] = useState(0); // Current level index (0-indexed)
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [currentLevelTargetScore, setCurrentLevelTargetScore] = useState(
    LEVEL_DATA[0].targetScore
  );
  const [foodEatenInLevel, setFoodEatenInLevel] = useState(0); // Track food eaten for speed increase
  const [unreachableFoodPendingShield, setUnreachableFoodPendingShield] =
    useState(false); // Track if an unreachable food was spawned

  const [lastBeatenLevel, setLastBeatenLevel] = useState(0); // Highest level cleared

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    difficulty: "normal",
    soundEnabled: true,
    showGrid: false,
    snakeTheme: "aurora",
    controlScheme: "both",
  });

  // Currency and Tools
  const [currency, setCurrency] = useState(0);
  const [unlockedTools, setUnlockedTools] = useState<
    Array<{ id: string; uses: number }>
  >([]); // Array of tool IDs with uses
  const [equippedTool, setEquippedTool] = useState<string | null>(null); // ID of currently equipped tool

  // Lives
  const [lives, setLives] = useState(MAX_LIVES); // Default 3 lives
  const lastLifeRegenTimeRef = useRef<number>(Date.now()); // To track last regeneration time

  // Stats and Achievements (overall)
  const [overallStats, setOverallStats] = useState<GameStats>({
    score: 0, // This is now total score across all games played
    foodEaten: 0,
    foodEatenByType: {
      apple: 0,
      cherry: 0,
      gem: 0,
      speed: 0,
      multiplier: 0,
      slow: 0,
      shield: 0,
      growth: 0,
      teleport: 0,
      shrink: 0,
      "fragile-walls": 0,
      poison: 0,
      "life-potion": 0,
    }, // Initialize all food types to 0
    maxLength: 1,
    gamesPlayed: 0,
    totalScore: 0, // This will be cumulative score across all games played
    levelsCleared: 0, // Reset for session
    shrinkPotionsEaten: 0, // Reset for session
    totalPlayTime: 0, // New stat
    totalDeaths: 0, // New stat
    poisonCuredCount: 0, // New stat
    totalCurrencyEarned: 0, // New stat
    obstaclesBroken: 0, // New stat for daily challenge
  });
  // Session achievements
  const [sessionAchievements, setSessionAchievements] = useState<Achievement[]>(
    []
  );
  // Overall achievements (for display on menu)
  const [overallAchievements, setOverallAchievements] = useState<Achievement[]>(
    []
  );
  const [showAchievement, setShowAchievement] = useState<Achievement | null>(
    null
  );

  // Daily Challenge State
  const [currentDailyChallenge, setCurrentDailyChallenge] =
    useState<DailyChallenge | null>(null);
  const [isDailyChallengeCompleted, setIsDailyChallengeCompleted] =
    useState(false);
  const [lastDailyChallengeDate, setLastDailyChallengeDate] = useState("");

  // Unlocked Themes
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>([
    "aurora",
    "ocean",
    "sunset",
    "cosmic",
  ]); // Default unlocked themes

  // Game Modes
  const [gameMode, setGameMode] = useState<GameMode>("levels"); // "levels", "endless", "coop"
  const [botSnake, setBotSnake] = useState<Position[]>([]);
  const [botDirection, setBotDirection] = useState<Position>({ x: 1, y: 0 });
  const [botScore, setBotScore] = useState(0);
  const botActiveRef = useRef(false); // To track if bot is still in game

  // Welcome Modal
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  const currentTheme = THEME_PALETTES[settings.snakeTheme];

  // Set canvas dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      // Ensure dimensions are multiples of GRID_SIZE
      const newWidth = Math.floor(window.innerWidth / GRID_SIZE) * GRID_SIZE;
      const newHeight = Math.floor(window.innerHeight / GRID_SIZE) * GRID_SIZE;

      setCanvasWidth(newWidth);
      setCanvasHeight(newHeight);
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Page transition function
  const navigateToPage = useCallback((page: typeof currentPage) => {
    setCurrentPage(page);
  }, []);

  // Initialize audio elements
  useEffect(() => {
    tapSoundRef.current = new Audio("/sounds/tap.wav");
    treasureSoundRef.current = new Audio("/sounds/treasure.wav");
    notificationSoundRef.current = new Audio("/sounds/notification.wav");
    levelCompleteSoundRef.current = new Audio("/sounds/level-completed.wav");
    loseSoundRef.current = new Audio("/sounds/lose.wav");
    unlockNotificationSoundRef.current = new Audio(
      "/sounds/unlock-notification.wav"
    );
    coinWinSoundRef.current = new Audio("/sounds/coin-win.wav");
    punchSoundRef.current = new Audio("/sounds/punch.wav");

    // Preload audio
    tapSoundRef.current.load();
    treasureSoundRef.current.load();
    notificationSoundRef.current.load();
    levelCompleteSoundRef.current.load();
    loseSoundRef.current.load();
    unlockNotificationSoundRef.current.load();
    coinWinSoundRef.current.load();
    punchSoundRef.current.load();
  }, []);

  // Audio playback utility
  const playSound = useCallback(
    (
      soundType:
        | "eat"
        | "powerup"
        | "start"
        | "levelup"
        | "gameover"
        | "achievement"
        | "score_increase"
        | "teleport_effect"
        | "general_positive_effect"
        | "general_negative_effect"
    ) => {
      if (!settings.soundEnabled) return;

      let audioRef: React.MutableRefObject<HTMLAudioElement | null>;
      switch (soundType) {
        case "eat":
          audioRef = tapSoundRef;
          break;
        case "powerup":
        case "general_positive_effect":
          audioRef = treasureSoundRef;
          break;
        case "start":
          audioRef = notificationSoundRef;
          break;
        case "levelup":
          audioRef = levelCompleteSoundRef;
          break;
        case "gameover":
        case "general_negative_effect":
          audioRef = loseSoundRef;
          break;
        case "achievement":
          audioRef = unlockNotificationSoundRef;
          break;
        case "score_increase":
          audioRef = coinWinSoundRef;
          break;
        case "teleport_effect":
          audioRef = punchSoundRef;
          break;
        default:
          return;
      }

      if (audioRef.current) {
        audioRef.current.currentTime = 0; // Rewind to start
        audioRef.current.volume = 0.5; // Adjust volume
        audioRef.current
          .play()
          .catch((e) =>
            console.error(`Audio playback failed for ${soundType}:`, e)
          );
      }
    },
    [settings.soundEnabled]
  );

  // Create fireworks for achievements
  const createFireworks = useCallback(
    (count = 2) => {
      // Reduced count for performance
      const colors = [
        "#ff6b6b",
        "#4ecdc4",
        "#45b7d1",
        "#96ceb4",
        "#ffeaa7",
        "#dda0dd",
        "#98d8c8",
      ];
      const newFireworks: any[] = [];

      for (let i = 0; i < count; i++) {
        const firework: any = {
          x: Math.random() * canvasWidth,
          y: Math.random() * (canvasHeight * 0.6) + canvasHeight * 0.2,
          life: 90, // Reduced life for performance
          particles: [],
        };

        for (let j = 0; j < 15; j++) {
          // Reduced particles per firework
          const angle = (Math.PI * 2 * j) / 15;
          const velocity = Math.random() * 3 + 1;
          firework.particles.push({
            x: firework.x,
            y: firework.y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 45 + Math.random() * 15, // Reduced life for particles
            maxLife: 45 + Math.random() * 15,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 2 + 1,
            trail: [],
          });
        }

        newFireworks.push(firework);
      }

      setFireworks((prev) => [...prev, ...newFireworks]);
    },
    [canvasWidth, canvasHeight]
  );

  // Helper to get duration based on difficulty
  const getEffectDuration = useCallback(
    (isBuff: boolean, baseDuration: number) => {
      switch (settings.difficulty) {
        case "easy":
          return isBuff ? baseDuration * 1.2 : baseDuration * 0.8; // Buffs last longer, debuffs shorter
        case "hard":
          return isBuff ? baseDuration * 0.8 : baseDuration * 1.2; // Buffs shorter, debuffs longer
        case "insane":
          return isBuff ? baseDuration * 0.7 : baseDuration * 1.3; // Buffs much shorter, debuffs much longer
        default: // normal
          return baseDuration;
      }
    },
    [settings.difficulty]
  );

  // Initialize achievements
  useEffect(() => {
    const achievementList: Achievement[] = [
      {
        id: "first-food",
        name: "First Taste",
        description: "Eat your first food",
        icon: "🍎",
        unlocked: false,
        condition: (stats) => stats.foodEaten >= 1,
      },
      {
        id: "score-100",
        name: "Century",
        description: "Score 100 points",
        icon: "⭐",
        unlocked: false,
        condition: (stats) => stats.score >= 100,
      },
      {
        id: "length-10",
        name: "Growing Strong",
        description: "Reach length of 10",
        icon: "⚡",
        unlocked: false,
        condition: (stats) => stats.maxLength >= 10,
      },
      {
        id: "score-500",
        name: "Serpent Master",
        description: "Score 500 points",
        icon: "🏆",
        unlocked: false,
        condition: (stats) => stats.score >= 500,
      },
      {
        id: "games-10",
        name: "Persistent",
        description: "Play 10 games",
        icon: "🔄",
        unlocked: false,
        condition: (stats) => stats.gamesPlayed >= 10,
      },
      {
        id: "insane-mode",
        name: "Insane Serpent",
        description: "Score 200+ on Insane difficulty",
        icon: "🎯",
        unlocked: false,
        condition: (stats) =>
          stats.score >= 200 && settings.difficulty === "insane",
      },
      {
        id: "level-3-clear",
        name: "Obstacle Conqueror",
        description: "Clear Level 3",
        icon: "🚧",
        unlocked: false,
        condition: (stats) => stats.levelsCleared >= 3, // New condition
        toolRewardId: "wall-breaker", // Reward a tool
      },
      {
        id: "no-shrink",
        name: "Growth Spurt",
        description: "Complete a level without eating a Shrink potion",
        icon: "📈",
        unlocked: false,
        condition: (stats) =>
          stats.levelsCleared > 0 && stats.shrinkPotionsEaten === 0, // New condition
        toolRewardId: "time-warp", // Reward another tool
      },
      {
        id: "survive-poison",
        name: "Poison Antidote",
        description: "Survive a poison debuff by eating a shield.",
        icon: "💚",
        unlocked: false,
        condition: (stats) => stats.poisonCuredCount >= 1, // New condition
        toolRewardId: "food-radar", // Reward another tool
      },
      {
        id: "long-play",
        name: "Endurance Master",
        description: "Play for a total of 5 minutes.",
        icon: "⏳",
        unlocked: false,
        condition: (stats) => stats.totalPlayTime >= 300, // 5 minutes in seconds
      },
      {
        id: "death-defier",
        name: "Death Defier",
        description: "Reach 5 deaths.",
        icon: "💀",
        unlocked: false,
        condition: (stats) => stats.totalDeaths >= 5,
        toolRewardId: "extra-life",
      },
    ];
    setOverallAchievements(achievementList);
    setSessionAchievements(
      achievementList.map((a) => ({ ...a, unlocked: false }))
    );
  }, [settings.difficulty]);

  // Helper to get food types with adjusted weights based on difficulty
  const getWeightedFoodTypes = useCallback(
    (difficulty: GameSettings["difficulty"]) => {
      const basePointFoodTypes = [
        {
          type: "apple",
          points: 10,
          color: "#ef4444",
          emoji: "🍎",
          weight: 40,
          shape: "circle",
        },
        {
          type: "cherry",
          points: 20,
          color: "#ec4899",
          emoji: "🍒",
          weight: 20,
          shape: "circle",
        },
        {
          type: "gem",
          points: 50,
          color: "#06b6d4",
          emoji: "💎",
          weight: 10,
          shape: "diamond",
        },
      ];

      const baseSpecialFoodTypes: Array<Omit<Food, "position" | "timeLeft">> = [
        {
          type: "speed",
          points: 15,
          color: "#eab308",
          emoji: "⚡",
          weight: 5,
          shape: "star",
          flashColor: currentTheme.highlight1,
          sideEffect: "Food disappears faster!",
          snakeEffect: "pulse-bright",
        },
        {
          type: "multiplier",
          points: 25,
          color: "#f97316",
          emoji: "✨",
          weight: 5,
          shape: "star",
          flashColor: currentTheme.multiplierGlowColor,
          sideEffect: "Snake grows slightly longer!",
        },
        {
          type: "slow",
          points: 5,
          color: "#84cc16",
          emoji: "🐢",
          weight: 5,
          shape: "square",
          flashColor: currentTheme.highlight2,
          sideEffect: "Food lasts longer!",
          snakeEffect: "pulse-dim",
        },
        {
          type: "shield",
          points: 30,
          color: "#6366f1",
          emoji: "🛡️",
          weight: 3,
          shape: "hexagon",
          flashColor: currentTheme.invincibilityGlowColor,
          sideEffect: "Lose a small amount of score!",
          snakeEffect: "glow",
        },
        {
          type: "growth",
          points: 0,
          color: "#a78bfa",
          emoji: "🧪",
          weight: 5,
          shape: "circle",
          sideEffect: "Temporarily slows you down!",
        },
        {
          type: "teleport",
          points: 0,
          color: "#8b5cf6",
          emoji: "🌀",
          weight: 3,
          shape: "circle",
          sideEffect: "Direction becomes random!",
        },
        {
          type: "shrink",
          points: -10,
          color: "#94a3b8",
          emoji: "🤏",
          weight: 5,
          shape: "square",
          flashColor: currentTheme.highlight4,
          sideEffect: "Gain a temporary speed boost!",
        },
        {
          type: "fragile-walls",
          points: -5,
          color: "#dc2626",
          emoji: "🧱",
          weight: 2,
          shape: "square",
          flashColor: currentTheme.dangerGradientColors[0],
          sideEffect: "Gain currency!",
        },
        {
          type: "poison",
          points: -20,
          color: "#8b008b",
          emoji: "☠️",
          weight: 3,
          shape: "square",
          flashColor: currentTheme.dangerGradientColors[1],
          sideEffect: "Temporary self-invincibility!",
          snakeEffect: "tint-green",
        },
        {
          type: "life-potion",
          points: 0,
          color: "#ff0000",
          emoji: "❤️",
          weight: 1,
          shape: "heart",
          flashColor: currentTheme.highlight1,
          sideEffect: "Gain 1 life!",
        },
      ];

      let adjustedSpecialFoodTypes = baseSpecialFoodTypes.map((food) => ({
        ...food,
      }));

      if (difficulty === "easy") {
        adjustedSpecialFoodTypes = adjustedSpecialFoodTypes.map((food) => {
          if (
            [
              "speed",
              "multiplier",
              "shield",
              "growth",
              "teleport",
              "life-potion",
            ].includes(food.type)
          ) {
            return { ...food, weight: food.weight * 1.5 }; // More common
          }
          if (
            ["slow", "shrink", "fragile-walls", "poison"].includes(food.type)
          ) {
            return { ...food, weight: food.weight * 0.5 }; // Less common
          }
          return food;
        });
      } else if (difficulty === "hard" || difficulty === "insane") {
        adjustedSpecialFoodTypes = adjustedSpecialFoodTypes.map((food) => {
          if (
            [
              "speed",
              "multiplier",
              "shield",
              "growth",
              "teleport",
              "life-potion",
            ].includes(food.type)
          ) {
            return { ...food, weight: food.weight * 0.5 }; // Less common
          }
          if (
            ["slow", "shrink", "fragile-walls", "poison"].includes(food.type)
          ) {
            return { ...food, weight: food.weight * 1.5 }; // More common
          }
          return food;
        });
      }
      return {
        pointFoodTypes: basePointFoodTypes,
        specialFoodTypes: adjustedSpecialFoodTypes,
      };
    },
    [currentTheme]
  );

  const generateFood = useCallback(
    (isSpecialSpawn = false): Food => {
      const { pointFoodTypes, specialFoodTypes } = getWeightedFoodTypes(
        settings.difficulty
      );

      const maxX = Math.floor(canvasWidth / GRID_SIZE);
      const maxY = Math.floor(canvasHeight / GRID_SIZE);

      let position: Position;
      let isValidPosition = false;
      let attempts = 0;
      const MAX_ATTEMPTS = 100;

      let selectedType:
        | (typeof pointFoodTypes)[number]
        | (typeof specialFoodTypes)[number];

      // Smart spawning logic for special foods
      if (isSpecialSpawn) {
        let filteredSpecialTypes = [...specialFoodTypes];

        // Prioritize shield if poisoned or walls are fragile
        if (isPoisoned || isWallFragile) {
          filteredSpecialTypes = filteredSpecialTypes.filter(
            (t) => t.type === "shield"
          );
          if (filteredSpecialTypes.length === 0) {
            filteredSpecialTypes = specialFoodTypes.filter(
              (t) => t.type === "shield"
            ); // Fallback
          }
        } else if (activeBuffs.some((b) => b.type === "slow")) {
          // Prioritize speed if slow debuff is active
          filteredSpecialTypes = filteredSpecialTypes.filter(
            (t) => t.type === "speed"
          );
          if (filteredSpecialTypes.length === 0) {
            filteredSpecialTypes = specialFoodTypes.filter(
              (t) => t.type === "speed"
            ); // Fallback
          }
        } else if (activeBuffs.some((b) => b.type === "speed")) {
          // Prioritize slow if speed buff is active (to balance)
          filteredSpecialTypes = filteredSpecialTypes.filter(
            (t) => t.type === "slow"
          );
          if (filteredSpecialTypes.length === 0) {
            filteredSpecialTypes = specialFoodTypes.filter(
              (t) => t.type === "slow"
            ); // Fallback
          }
        }

        // If no specific priority, select from all special types
        if (filteredSpecialTypes.length === 0) {
          filteredSpecialTypes = specialFoodTypes;
        }

        const totalWeight = filteredSpecialTypes.reduce(
          (sum, type) => sum + type.weight,
          0
        );
        let random = Math.random() * totalWeight;
        selectedType =
          filteredSpecialTypes.find((type) => {
            random -= type.weight;
            return random <= 0;
          }) || specialFoodTypes[0]; // Fallback to first special food
      } else {
        // Normal weighted random selection for point foods
        const totalWeight = pointFoodTypes.reduce(
          (sum, type) => sum + type.weight,
          0
        );
        let random = Math.random() * totalWeight;
        selectedType =
          pointFoodTypes.find((type) => {
            random -= type.weight;
            return random <= 0;
          }) || pointFoodTypes[0];
      }

      // Force shield if an unreachable food was previously spawned
      if (unreachableFoodPendingShield) {
        selectedType =
          specialFoodTypes.find((t) => t.type === "shield") ||
          pointFoodTypes[0]; // Ensure shield is selected
        setUnreachableFoodPendingShield(false); // Reset flag
      }

      while (!isValidPosition && attempts < MAX_ATTEMPTS) {
        position = {
          x: Math.floor(Math.random() * maxX),
          y: Math.floor(Math.random() * maxY),
        };
        const onSnake = snake.some(
          (s) => s.x === position.x && s.y === position.y
        );
        const onBotSnake =
          gameMode === "coop" &&
          botSnake.some((s) => s.x === position.x && s.y === position.y);
        const onObstacle = obstacles.some(
          (o) => o.x === position.x && o.y === position.y
        );

        if (!onSnake && !onBotSnake && !onObstacle) {
          isValidPosition = true;
        } else if (onObstacle && selectedType.type !== "shield") {
          // If food spawns on obstacle and it's not a shield, guarantee next food is shield
          setUnreachableFoodPendingShield(true);
        }
        attempts++;
      }

      if (!isValidPosition) {
        console.warn("Could not find a valid food position, placing at (0,0)");
        position = { x: 0, y: 0 };
      }

      // Only timed for buffs/debuffs that have a duration
      const isTimedFood = [
        "speed",
        "multiplier",
        "slow",
        "shield",
        "shrink",
        "fragile-walls",
        "poison",
      ].includes(selectedType.type);

      return {
        position: position!,
        ...(selectedType as any),
        timeLeft: isTimedFood ? getEffectDuration(true, 300) : undefined, // Base duration 5 seconds (300 frames)
      };
    },
    [
      canvasWidth,
      canvasHeight,
      snake,
      obstacles,
      unreachableFoodPendingShield,
      isPoisoned,
      isWallFragile,
      activeBuffs,
      settings.difficulty,
      getEffectDuration,
      getWeightedFoodTypes,
      gameMode,
      botSnake,
    ]
  );

  const createParticles = useCallback(
    (
      x: number,
      y: number,
      particleType: Food["type"] | "disappear" | "wall-break"
    ) => {
      let color: string;
      let count: number;
      let size: number;
      let shape: "circle" | "square" = "circle";
      let initialVelocityMultiplier = 8; // Increased for more burst

      switch (particleType) {
        case "apple":
          color = "#ef4444";
          count = 8;
          size = 4;
          break;
        case "cherry":
          color = "#ec4899";
          count = 12;
          size = 5;
          break;
        case "gem":
          color = "#06b6d4";
          count = 15;
          size = 6;
          shape = "square";
          break;
        case "speed":
          color = "#eab308";
          count = 10;
          size = 4;
          break;
        case "multiplier":
          color = "#f97316";
          count = 10;
          size = 4;
          break;
        case "slow":
          color = "#84cc16";
          count = 8;
          size = 4;
          break;
        case "shield":
          color = "#6366f1";
          count = 12;
          size = 5;
          break;
        case "growth": // New food type
          color = "#a78bfa";
          count = 10;
          size = 5;
          break;
        case "teleport": // New food type
          color = "#8b5cf6";
          count = 15;
          size = 4;
          initialVelocityMultiplier = 12; // More spread for teleport
          break;
        case "shrink": // New food type
          color = "#94a3b8";
          count = 10;
          size = 4;
          break;
        case "fragile-walls": // New food type
          color = "#dc2626";
          count = 10;
          size = 4;
          break;
        case "poison": // New food type
          color = "#8b008b";
          count = 10;
          size = 4;
          break;
        case "life-potion": // New food type
          color = "#ff0000";
          count = 10;
          size = 4;
          break;
        case "disappear": // For food disappearance effect
          color = "#cbd5e1"; // Light gray
          count = 5;
          size = 3;
          initialVelocityMultiplier = 4;
          break;
        case "wall-break": // New particle type for wall breaking
          color = "#a3a3a3"; // Gray for debris
          count = 20;
          size = 6;
          shape = "square";
          initialVelocityMultiplier = 10;
          break;
        default:
          color = "#ffffff";
          count = 8;
          size = 4;
      }

      const newParticles: any[] = [];
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: x * GRID_SIZE + GRID_SIZE / 2,
          y: y * GRID_SIZE + GRID_SIZE / 2,
          vx: (Math.random() - 0.5) * initialVelocityMultiplier,
          vy: (Math.random() - 0.5) * initialVelocityMultiplier,
          life: 60,
          maxLife: 60,
          color,
          size: Math.random() * size + 2,
          shape,
        });
      }
      setParticles((prev) => [...prev, ...newParticles]);
    },
    []
  );

  const applyEquippedToolEffect = useCallback(
    (toolId: string | null) => {
      if (!toolId) return;

      const tool = TOOLS_DATA.find((t) => t.id === toolId);
      if (!tool) return;

      // Helper to add or update a buff
      const addOrUpdateBuff = (newBuff: (typeof activeBuffs)[0]) => {
        setActiveBuffs((prevBuffs) => {
          const existingBuffIndex = prevBuffs.findIndex(
            (b) => b.type === newBuff.type
          );
          if (existingBuffIndex !== -1) {
            // If buff exists, extend its duration
            return prevBuffs.map((b, i) =>
              i === existingBuffIndex ? { ...b, timeLeft: newBuff.timeLeft } : b
            );
          }
          return [...prevBuffs, newBuff];
        });
      };

      switch (tool.id) {
        case "starting-boost":
          setSpeed((prev) => Math.max(50, prev - 30)); // Start faster
          addOrUpdateBuff({
            type: "starting-boost",
            timeLeft: getEffectDuration(true, 300),
            duration: getEffectDuration(true, 300),
            color: currentTheme.highlight1,
            emoji: "🚀",
            flashColor: currentTheme.highlight1,
            snakeEffect: "pulse-bright",
          });
          break;
        case "extra-life":
          addOrUpdateBuff({
            type: "shield",
            timeLeft: getEffectDuration(true, 300),
            duration: getEffectDuration(true, 300),
            color: currentTheme.highlight3,
            emoji: "🛡️",
            flashColor: currentTheme.invincibilityGlowColor,
            snakeEffect: "glow",
          });
          break;
        case "food-magnet":
          addOrUpdateBuff({
            type: "food-attractor-active",
            timeLeft: getEffectDuration(true, 600), // 10 seconds
            duration: getEffectDuration(true, 600),
            color: currentTheme.highlight1,
            emoji: "🧲",
            flashColor: currentTheme.highlight1,
          });
          break;
        case "super-shield":
          addOrUpdateBuff({
            type: "shield",
            timeLeft: getEffectDuration(true, 900), // 15 seconds
            duration: getEffectDuration(true, 900),
            color: currentTheme.highlight3,
            emoji: "🛡️",
            flashColor: currentTheme.invincibilityGlowColor,
            snakeEffect: "glow",
          });
          break;
        case "coin-booster":
          addOrUpdateBuff({
            type: "coin-booster-active",
            timeLeft: 999999, // Lasts for the whole level
            duration: 999999,
            color: currentTheme.highlight2,
            emoji: "💰",
            flashColor: currentTheme.highlight2,
          });
          break;
        case "obstacle-clearer":
          setObstacles([]); // Clear all obstacles immediately
          playSound("general_positive_effect");
          break;
        case "wall-breaker":
          setWallBreakerUses(tool.initialUses); // Set initial uses for wall breaker
          addOrUpdateBuff({
            type: "wall-breaker-tool",
            timeLeft: 999999, // Effectively infinite, managed by uses
            duration: 999999,
            color: currentTheme.highlight4,
            emoji: "🔨",
            flashColor: currentTheme.highlight4,
          });
          break;
        case "time-warp":
          setSpeed((prev) => Math.min(400, prev + 100)); // Slow down game significantly
          addOrUpdateBuff({
            type: "time-warp",
            timeLeft: getEffectDuration(true, 300),
            duration: getEffectDuration(true, 300),
            color: currentTheme.highlight2,
            emoji: "⏳",
            flashColor: currentTheme.highlight2,
            snakeEffect: "pulse-dim",
          });
          break;
        case "food-radar":
          addOrUpdateBuff({
            type: "food-radar",
            timeLeft: 999999, // Lasts for the whole level
            duration: 999999,
            color: currentTheme.highlight1,
            emoji: "📡",
            flashColor: currentTheme.highlight1,
          });
          break;
        case "length-lock":
          addOrUpdateBuff({
            type: "length-lock",
            timeLeft: getEffectDuration(true, 600), // 10 seconds
            duration: getEffectDuration(true, 600),
            color: currentTheme.highlight3,
            emoji: "🔒",
            flashColor: currentTheme.highlight3,
          });
          break;
        default:
          break;
      }
    },
    [currentTheme, getEffectDuration, playSound]
  );

  const initializeGameSession = useCallback(
    (mode: GameMode, startLevelIndex = 0) => {
      if (lives <= 0 && mode !== "coop") {
        // Prevent starting if no lives, unless it's coop mode (which doesn't consume lives for player)
        console.log("Not enough lives to start a game!");
        return;
      }

      const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty];
      const maxX = Math.floor(canvasWidth / GRID_SIZE);
      const maxY = Math.floor(canvasHeight / GRID_SIZE);

      let initialSnakeHead: Position = {
        x: Math.floor(maxX / 2),
        y: Math.floor(maxY / 2),
      };
      let attempts = 0;
      const MAX_SPAWN_ATTEMPTS = 100;

      // Calculate obstacle offset for centering
      const levelObstacles =
        mode === "levels" ? LEVEL_DATA[startLevelIndex].obstacles : []; // No fixed obstacles in endless/coop
      const offsetX = Math.floor((maxX - GRID_COLS) / 2);
      const offsetY = Math.floor((maxY - GRID_ROWS) / 2);
      const currentObstacles = levelObstacles.map((o) => ({
        x: o.x + offsetX,
        y: o.y + offsetY,
      }));
      setObstacles(currentObstacles);

      // Ensure snake spawns in a clear spot
      while (
        currentObstacles.some(
          (o) => o.x === initialSnakeHead.x && o.y === initialSnakeHead.y
        ) &&
        attempts < MAX_SPAWN_ATTEMPTS
      ) {
        initialSnakeHead = {
          x: Math.floor(Math.random() * maxX),
          y: Math.floor(Math.random() * maxY),
        };
        attempts++;
      }
      if (attempts === MAX_SPAWN_ATTEMPTS) {
        console.warn(
          "Could not find a clear spawn point for snake, placing at default."
        );
        initialSnakeHead = { x: Math.floor(maxX / 2), y: Math.floor(maxY / 2) }; // Fallback
      }

      setSnake([initialSnakeHead]); // Reset snake position and length
      setDirection({ x: 1, y: 0 });
      directionQueue.current = []; // Clear direction queue on new game
      setScore(0); // Reset cumulative score for new game session
      setSpeed(difficultySettings.baseSpeed);
      setActiveBuffs([]); // Clear all buffs
      setParticles([]);
      setFireworks([]);
      setIsWallFragile(false); // Reset wall fragility
      setIsPoisoned(false); // Reset poison
      setWallBreakerUses(0); // Reset wall breaker uses
      setGameState("playing");
      setLevel(startLevelIndex); // Start at specified level

      setCurrentLevelTargetScore(
        mode === "levels"
          ? LEVEL_DATA[startLevelIndex].targetScore
          : Number.POSITIVE_INFINITY
      ); // Set target score or Infinity for endless
      setFoodEatenInLevel(0); // Reset food eaten for speed increase
      setUnreachableFoodPendingShield(false); // Reset shield guarantee flag
      gameStartTimeRef.current = Date.now(); // Start tracking play time

      // Reset session achievements and add new stats for them
      setSessionAchievements((prev) =>
        prev.map((a) => ({ ...a, unlocked: false }))
      );
      setOverallStats((prev) => ({
        ...prev,
        score: 0, // Reset session score for overall stats tracking
        foodEaten: 0,
        foodEatenByType: {
          apple: 0,
          cherry: 0,
          gem: 0,
          speed: 0,
          multiplier: 0,
          slow: 0,
          shield: 0,
          growth: 0,
          teleport: 0,
          shrink: 0,
          "fragile-walls": 0,
          poison: 0,
          "life-potion": 0,
        },
        maxLength: 1,
        gamesPlayed: prev.gamesPlayed + 1,
        levelsCleared: 0, // Reset for session
        shrinkPotionsEaten: 0, // Reset for session
        poisonCuredCount: 0, // Reset for session
        totalCurrencyEarned: 0, // Reset for session
        obstaclesBroken: 0, // Reset for session
      }));
      // Lives are NOT reset here, they are global

      setGameMode(mode); // Set the current game mode

      // Initialize bot for coop mode
      if (mode === "coop") {
        let initialBotHead: Position = {
          x: Math.floor(maxX / 2) + 5,
          y: Math.floor(maxY / 2),
        }; // Spawn bot away from player
        attempts = 0;
        while (
          (currentObstacles.some(
            (o) => o.x === initialBotHead.x && o.y === initialBotHead.y
          ) ||
            (initialBotHead.x === initialSnakeHead.x &&
              initialBotHead.y === initialSnakeHead.y)) &&
          attempts < MAX_SPAWN_ATTEMPTS
        ) {
          initialBotHead = {
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY),
          };
          attempts++;
        }
        setBotSnake([initialBotHead]);
        setBotDirection({ x: -1, y: 0 }); // Bot starts moving left
        setBotScore(0);
        botActiveRef.current = true;
      } else {
        setBotSnake([]);
        setBotScore(0);
        botActiveRef.current = false;
      }

      // Apply equipped tool effect at the start of the game
      if (equippedTool) {
        const toolToApply = TOOLS_DATA.find((t) => t.id === equippedTool);
        const equippedToolInState = unlockedTools.find(
          (t) => t.id === equippedTool
        );

        if (
          toolToApply &&
          equippedToolInState &&
          equippedToolInState.uses > 0
        ) {
          applyEquippedToolEffect(equippedTool); // Apply the effect
          setUnlockedTools((prev) => {
            // Then update uses
            const updatedTools = prev.map((t) => {
              if (t.id === equippedTool && t.uses > 0) {
                return { ...t, uses: t.uses - 1 };
              }
              return t;
            });
            // If the equipped tool ran out of uses, unequip it
            const toolAfterUse = updatedTools.find(
              (t) => t.id === equippedTool
            );
            if (toolAfterUse && toolAfterUse.uses === 0) {
              setEquippedTool(null);
            }
            return updatedTools;
          });
        }
      }

      // Generate initial food: 70% point food, 30% special food
      const initialFood: Food[] = [];
      for (let i = 0; i < difficultySettings.foodCount; i++) {
        initialFood.push(generateFood(Math.random() < 0.3)); // 30% chance for special food
      }

      // Ensure at least one beneficial food if all are debuffs
      const hasBeneficialFood = initialFood.some(
        (f) => !["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
      );
      if (!hasBeneficialFood && initialFood.length > 0) {
        const badFoodIndex = initialFood.findIndex((f) =>
          ["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
        );
        if (badFoodIndex !== -1) {
          initialFood[badFoodIndex] = generateFood(false); // Replace with a non-special food
        }
      }
      setFood(initialFood);

      playSound("start"); // Play start game sound
      localStorage.setItem("hasPlayedBefore", "true"); // Mark as played
    },
    [
      generateFood,
      settings.difficulty,
      canvasWidth,
      canvasHeight,
      playSound,
      equippedTool,
      unlockedTools,
      applyEquippedToolEffect,
      lives,
      gameMode,
      botSnake,
    ]
  );

  const resetLevelState = useCallback(
    (nextLevelIndex: number) => {
      const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty];
      const maxX = Math.floor(canvasWidth / GRID_SIZE);
      const maxY = Math.floor(canvasHeight / GRID_SIZE);

      let initialSnakeHead: Position = {
        x: Math.floor(maxX / 2),
        y: Math.floor(maxY / 2),
      };
      let attempts = 0;
      const MAX_SPAWN_ATTEMPTS = 100;

      // Calculate obstacle offset for centering
      const levelObstacles = LEVEL_DATA[nextLevelIndex].obstacles;
      const offsetX = Math.floor((maxX - GRID_COLS) / 2);
      const offsetY = Math.floor((maxY - GRID_ROWS) / 2);
      const currentObstacles = levelObstacles.map((o) => ({
        x: o.x + offsetX,
        y: o.y + offsetY,
      }));
      setObstacles(currentObstacles);

      // Ensure snake spawns in a clear spot
      while (
        currentObstacles.some(
          (o) => o.x === initialSnakeHead.x && o.y === initialSnakeHead.y
        ) &&
        attempts < MAX_SPAWN_ATTEMPTS
      ) {
        initialSnakeHead = {
          x: Math.floor(Math.random() * maxX),
          y: Math.floor(Math.random() * maxY),
        };
        attempts++;
      }
      if (attempts === MAX_SPAWN_ATTEMPTS) {
        console.warn(
          "Could not find a clear spawn point for snake, placing at default."
        );
        initialSnakeHead = { x: Math.floor(maxX / 2), y: Math.floor(maxY / 2) }; // Fallback
      }

      setSnake([initialSnakeHead]); // Reset snake position and length
      setDirection({ x: 1, y: 0 }); // Reset direction
      directionQueue.current = []; // Clear direction queue on level reset
      setSpeed(difficultySettings.baseSpeed); // Reset speed
      setActiveBuffs([]); // Clear all buffs
      setParticles([]); // Clear particles
      setFireworks([]); // Clear fireworks
      setIsWallFragile(false); // Reset wall fragility
      setIsPoisoned(false); // Reset poison
      setWallBreakerUses(0); // Reset wall breaker uses

      setLevel(nextLevelIndex); // Set to the new level

      setCurrentLevelTargetScore(LEVEL_DATA[nextLevelIndex].targetScore); // Set new target score
      setFoodEatenInLevel(0); // Reset food eaten for speed increase
      setUnreachableFoodPendingShield(false); // Reset shield guarantee flag

      // Grant a life for clearing a level, up to MAX_LIVES
      setLives((prev) => Math.min(prev + 1, MAX_LIVES));
      // Update last beaten level
      setLastBeatenLevel((prev) => Math.max(prev, nextLevelIndex)); // If cleared level X, then X is beaten

      // Apply equipped tool effect at the start of the level
      if (equippedTool) {
        const toolToApply = TOOLS_DATA.find((t) => t.id === equippedTool);
        const equippedToolInState = unlockedTools.find(
          (t) => t.id === equippedTool
        );

        if (
          toolToApply &&
          equippedToolInState &&
          equippedToolInState.uses > 0
        ) {
          applyEquippedToolEffect(equippedTool); // Apply the effect
          setUnlockedTools((prev) => {
            // Then update uses
            const updatedTools = prev.map((t) => {
              if (t.id === equippedTool && t.uses > 0) {
                return { ...t, uses: t.uses - 1 };
              }
              return t;
            });
            const toolAfterUse = updatedTools.find(
              (t) => t.id === equippedTool
            );
            if (toolAfterUse && toolAfterUse.uses === 0) {
              setEquippedTool(null);
            }
            return updatedTools;
          });
        }
      }

      // Generate food for the new level: 70% point food, 30% special food
      const newLevelFood: Food[] = [];
      for (let i = 0; i < difficultySettings.foodCount; i++) {
        newLevelFood.push(generateFood(Math.random() < 0.3)); // 30% chance for special food
      }
      const hasBeneficialFood = newLevelFood.some(
        (f) => !["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
      );
      if (!hasBeneficialFood && newLevelFood.length > 0) {
        const badFoodIndex = newLevelFood.findIndex((f) =>
          ["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
        );
        if (badFoodIndex !== -1) {
          newLevelFood[badFoodIndex] = generateFood(false); // Replace with a non-special food
        }
      }
      setFood(newLevelFood);

      setGameState("paused"); // Pause game for level transition
      navigateToPage("levelStart"); // Go to level start page
      playSound("levelup"); // Play level up sound
    },
    [
      generateFood,
      settings.difficulty,
      canvasWidth,
      canvasHeight,
      navigateToPage,
      playSound,
      equippedTool,
      unlockedTools,
      applyEquippedToolEffect,
      getEffectDuration,
    ]
  );

  const startGameSession = useCallback(
    (mode: GameMode, startLevelIndex = 0) => {
      initializeGameSession(mode, startLevelIndex);
      navigateToPage("game");
    },
    [initializeGameSession, navigateToPage]
  );

  const resumeGame = useCallback(() => {
    setGameState("playing");
    navigateToPage("game");
  }, [navigateToPage]);

  const pauseGame = useCallback(() => {
    setGameState((prev) => (prev === "paused" ? "playing" : "paused"));
  }, []);

  const purchaseTool = useCallback(
    (toolId: string) => {
      const tool = TOOLS_DATA.find((t) => t.id === toolId);
      if (!tool) return false;

      const existingTool = unlockedTools.find((t) => t.id === tool.id); // Use tool.id here

      if (tool.id === "life-potion") {
        if (currency >= tool.cost && lives < MAX_LIVES) {
          setCurrency((prev) => prev - tool.cost);
          setLives((prev) => Math.min(prev + tool.initialUses, MAX_LIVES));
          playSound("powerup");
          return true;
        }
        return false; // Cannot afford or already at max lives
      }

      if (existingTool) {
        if (tool.stackable && currency >= tool.cost) {
          setCurrency((prev) => prev - tool.cost);
          setUnlockedTools((prev) =>
            prev.map((t) =>
              t.id === tool.id ? { ...t, uses: t.uses + tool.initialUses } : t
            )
          );
          playSound("powerup");
          return true;
        }
      } else {
        if (currency >= tool.cost) {
          setCurrency((prev) => prev - tool.cost);
          setUnlockedTools((prev) => [
            ...prev,
            { id: tool.id, uses: tool.initialUses },
          ]);
          playSound("powerup");
          return true;
        }
      }
      return false;
    },
    [currency, unlockedTools, playSound, lives]
  );

  const equipTool = useCallback(
    (toolId: string | null) => {
      setEquippedTool(toolId);
      playSound("achievement"); // Use achievement sound for equip
    },
    [playSound]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (currentPage === "game") {
        const key = e.key.toLowerCase();

        if (gameState === "playing") {
          const isWASD =
            settings.controlScheme === "wasd" ||
            settings.controlScheme === "both";
          const isArrows =
            settings.controlScheme === "arrows" ||
            settings.controlScheme === "both";

          let newDirection: Position | null = null;
          if ((isWASD && key === "w") || (isArrows && key === "arrowup")) {
            e.preventDefault();
            newDirection = { x: 0, y: -1 };
          } else if (
            (isWASD && key === "s") ||
            (isArrows && key === "arrowdown")
          ) {
            e.preventDefault();
            newDirection = { x: 0, y: 1 };
          } else if (
            (isWASD && key === "a") ||
            (isArrows && key === "arrowleft")
          ) {
            e.preventDefault();
            newDirection = { x: -1, y: 0 };
          } else if (
            (isWASD && key === "d") ||
            (isArrows && key === "arrowright")
          ) {
            e.preventDefault();
            newDirection = { x: 1, y: 0 };
          }

          if (newDirection) {
            // Prevent immediate reversal
            const currentDir =
              directionQueue.current.length > 0
                ? directionQueue.current[directionQueue.current.length - 1]
                : direction;
            if (
              !(
                newDirection.x === -currentDir.x &&
                newDirection.y === -currentDir.y
              )
            ) {
              directionQueue.current.push(newDirection);
            }
          }
        }

        if (e.key === " " && currentPage === "game") {
          e.preventDefault();
          pauseGame();
        }

        if (e.key === "Escape") {
          if (currentPage === "game") {
            setGameState("paused"); // Pause game when going to menu from game
            navigateToPage("menu");
          } else if (currentPage === "settings") navigateToPage("menu");
          else if (currentPage === "achievements") navigateToPage("menu");
          else if (currentPage === "stats") navigateToPage("menu");
          else if (currentPage === "help") navigateToPage("menu");
          else if (currentPage === "levelStart")
            navigateToPage("menu"); // Allow escaping from level start
          else if (currentPage === "tools")
            navigateToPage("menu"); // Allow escaping from tools page
          else if (currentPage === "levelSelect") navigateToPage("menu"); // Allow escaping from level select
        }
      } else if (currentPage === "levelStart") {
        if (e.key === "Escape") {
          navigateToPage("menu");
        }
      } else if (currentPage === "gameOver") {
        // No escape from game over, must choose option
      } else {
        if (e.key === "Escape") {
          navigateToPage("menu"); // For other menu pages
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    currentPage,
    gameState,
    settings.controlScheme,
    pauseGame,
    navigateToPage,
    direction,
  ]); // Added direction to dependencies for input queue logic

  // Load saved data and check for first-time play
  useEffect(() => {
    const savedHighScore = localStorage.getItem("serpentineHighScore");
    const savedOverallStats = localStorage.getItem("serpentineOverallStats");
    const savedOverallAchievements = localStorage.getItem(
      "serpentineOverallAchievements"
    );
    const savedSettings = localStorage.getItem("serpentineSettings");
    const savedCurrency = localStorage.getItem("serpentineCurrency");
    const savedUnlockedTools = localStorage.getItem("serpentineUnlockedTools");
    const savedEquippedTool = localStorage.getItem("serpentineEquippedTool");
    const savedLives = localStorage.getItem("serpentineLives");
    const savedLastBeatenLevel = localStorage.getItem(
      "serpentineLastBeatenLevel"
    );
    const savedLastLifeRegenTime = localStorage.getItem(
      "serpentineLastLifeRegenTime"
    );
    const hasPlayedBefore = localStorage.getItem("hasPlayedBefore");
    const savedUnlockedThemes = localStorage.getItem(
      "serpentineUnlockedThemes"
    );
    const savedDailyChallenge = localStorage.getItem(
      "serpentineDailyChallenge"
    );
    const savedIsDailyChallengeCompleted = localStorage.getItem(
      "serpentineIsDailyChallengeCompleted"
    );
    const savedLastDailyChallengeDate = localStorage.getItem(
      "serpentineLastDailyChallengeDate"
    );

    if (savedHighScore) setHighScore(Number.parseInt(savedHighScore));
    if (savedOverallStats) {
      const parsedStats = JSON.parse(savedOverallStats);
      // Ensure foodEatenByType is fully initialized for older saves
      const defaultFoodEatenByType = Object.keys(
        overallStats.foodEatenByType
      ).reduce((acc, type) => {
        acc[type as Food["type"]] = 0;
        return acc;
      }, {} as Record<Food["type"], number>);
      setOverallStats({
        ...overallStats, // Use default initial state for new fields
        ...parsedStats,
        foodEatenByType: {
          ...defaultFoodEatenByType,
          ...parsedStats.foodEatenByType,
        },
      });
    }
    if (savedSettings) setSettings(JSON.parse(savedSettings));
    if (savedCurrency) setCurrency(Number.parseInt(savedCurrency));
    if (savedUnlockedTools) setUnlockedTools(JSON.parse(savedUnlockedTools));
    if (savedEquippedTool) setEquippedTool(savedEquippedTool);
    if (savedLastBeatenLevel)
      setLastBeatenLevel(Number.parseInt(savedLastBeatenLevel));

    // Load lives and apply regeneration
    let loadedLives = savedLives ? Number.parseInt(savedLives) : MAX_LIVES;
    const loadedLastRegenTime = savedLastLifeRegenTime
      ? Number.parseInt(savedLastLifeRegenTime)
      : Date.now();

    const now = Date.now();
    const timeElapsed = now - loadedLastRegenTime;
    const livesToRegen = Math.floor(
      timeElapsed / (LIVES_REGEN_INTERVAL_SECONDS * 1000)
    );

    loadedLives = Math.min(
      MAX_LIVES,
      loadedLives + livesToRegen * LIVES_REGEN_AMOUNT
    );
    setLives(loadedLives);
    lastLifeRegenTimeRef.current =
      now - (timeElapsed % (LIVES_REGEN_INTERVAL_SECONDS * 1000)); // Update last regen time to account for partial interval

    if (savedUnlockedThemes) setUnlockedThemes(JSON.parse(savedUnlockedThemes));

    // Load daily challenge state
    if (savedDailyChallenge)
      setCurrentDailyChallenge(JSON.parse(savedDailyChallenge));
    if (savedIsDailyChallengeCompleted)
      setIsDailyChallengeCompleted(JSON.parse(savedIsDailyChallengeCompleted));
    if (savedLastDailyChallengeDate)
      setLastDailyChallengeDate(savedLastDailyChallengeDate);

    if (!hasPlayedBefore) {
      setShowWelcomeModal(true);
    }
  }, []);

  // Save settings, currency, tools, lives, lastBeatenLevel, themes, daily challenge
  useEffect(() => {
    localStorage.setItem("serpentineSettings", JSON.stringify(settings));
    localStorage.setItem("serpentineCurrency", currency.toString());
    localStorage.setItem(
      "serpentineUnlockedTools",
      JSON.stringify(unlockedTools)
    );
    localStorage.setItem("serpentineEquippedTool", equippedTool || "");
    localStorage.setItem("serpentineLives", lives.toString());
    localStorage.setItem(
      "serpentineLastBeatenLevel",
      lastBeatenLevel.toString()
    );
    localStorage.setItem(
      "serpentineLastLifeRegenTime",
      lastLifeRegenTimeRef.current.toString()
    );
    localStorage.setItem(
      "serpentineOverallStats",
      JSON.stringify(overallStats)
    ); // Save overall stats
    localStorage.setItem(
      "serpentineUnlockedThemes",
      JSON.stringify(unlockedThemes)
    );
    localStorage.setItem(
      "serpentineDailyChallenge",
      JSON.stringify(currentDailyChallenge)
    );
    localStorage.setItem(
      "serpentineIsDailyChallengeCompleted",
      JSON.stringify(isDailyChallengeCompleted)
    );
    localStorage.setItem(
      "serpentineLastDailyChallengeDate",
      lastDailyChallengeDate
    );
  }, [
    settings,
    currency,
    unlockedTools,
    equippedTool,
    lives,
    lastBeatenLevel,
    overallStats,
    unlockedThemes,
    currentDailyChallenge,
    isDailyChallengeCompleted,
    lastDailyChallengeDate,
  ]);

  // Life regeneration interval
  useEffect(() => {
    const regenInterval = setInterval(() => {
      setLives((prevLives) => {
        if (prevLives < MAX_LIVES) {
          const newLives = Math.min(prevLives + LIVES_REGEN_AMOUNT, MAX_LIVES);
          lastLifeRegenTimeRef.current = Date.now();
          return newLives;
        }
        return prevLives;
      });
    }, LIVES_REGEN_INTERVAL_SECONDS * 1000); // Convert seconds to milliseconds

    return () => clearInterval(regenInterval);
  }, []);

  // Daily Challenge Logic
  useEffect(() => {
    const today = new Date().toDateString();
    if (lastDailyChallengeDate !== today) {
      // Reset and generate new daily challenge
      const randomIndex = Math.floor(Math.random() * DAILY_CHALLENGES.length);
      setCurrentDailyChallenge(DAILY_CHALLENGES[randomIndex]);
      setIsDailyChallengeCompleted(false);
      setLastDailyChallengeDate(today);
      console.log("New daily challenge:", DAILY_CHALLENGES[randomIndex].name);
    }
  }, [lastDailyChallengeDate]);

  // Check for new achievements (overall and session)
  const checkAchievements = useCallback(() => {
    setOverallAchievements((prevOverall) => {
      let updatedOverall = [...prevOverall];
      let newAchievementUnlocked = false;

      prevOverall.forEach((achievement) => {
        if (!achievement.unlocked && achievement.condition(overallStats)) {
          updatedOverall = updatedOverall.map((ach) =>
            ach.id === achievement.id ? { ...ach, unlocked: true } : ach
          );
          setShowAchievement(achievement);
          createFireworks(2);
          playSound("achievement");
          setCurrency((prev) => prev + ACHIEVEMENT_CURRENCY_REWARD);
          setOverallStats((prev) => ({
            ...prev,
            totalCurrencyEarned:
              prev.totalCurrencyEarned + ACHIEVEMENT_CURRENCY_REWARD,
          }));
          newAchievementUnlocked = true;

          if (achievement.toolRewardId) {
            const toolToReward = TOOLS_DATA.find(
              (t) => t.id === achievement.toolRewardId
            );
            if (toolToReward) {
              setUnlockedTools((prevUnlocked) => {
                const existingTool = prevUnlocked.find(
                  (t) => t.id === toolToReward.id
                );
                if (existingTool) {
                  if (toolToReward.stackable) {
                    return prevUnlocked.map((t) =>
                      t.id === toolToReward.id
                        ? { ...t, uses: t.uses + toolToReward.initialUses }
                        : t
                    );
                  }
                  return prevUnlocked;
                } else {
                  return [
                    ...prevUnlocked,
                    { id: toolToReward.id, uses: toolToReward.initialUses },
                  ];
                }
              });
            }
          }
        }
      });

      if (newAchievementUnlocked) {
        setTimeout(() => setShowAchievement(null), 3000);
        const unlockedIds = updatedOverall
          .filter((a) => a.unlocked)
          .map((a) => a.id);
        localStorage.setItem(
          "serpentineOverallAchievements",
          JSON.stringify(unlockedIds)
        );
      }
      return updatedOverall;
    });

    setSessionAchievements((prevSession) => {
      let updatedSession = [...prevSession];
      prevSession.forEach((achievement) => {
        if (!achievement.unlocked && achievement.condition(overallStats)) {
          updatedSession = updatedSession.map((ach) =>
            ach.id === achievement.id ? { ...ach, unlocked: true } : ach
          );
        }
      });
      return updatedSession;
    });

    // Check daily challenge
    if (
      currentDailyChallenge &&
      !isDailyChallengeCompleted &&
      currentDailyChallenge.condition(overallStats)
    ) {
      setIsDailyChallengeCompleted(true);
      playSound("achievement"); // Use achievement sound for daily challenge completion
      if (
        currentDailyChallenge.rewardType === "currency" &&
        currentDailyChallenge.rewardAmount
      ) {
        setCurrency((prev) => prev + currentDailyChallenge.rewardAmount!);
        setOverallStats((prev) => ({
          ...prev,
          totalCurrencyEarned:
            prev.totalCurrencyEarned + currentDailyChallenge.rewardAmount!,
        }));
        console.log(
          `Daily challenge completed! Gained ${currentDailyChallenge.rewardAmount} currency.`
        );
      } else if (
        currentDailyChallenge.rewardType === "theme" &&
        currentDailyChallenge.rewardId
      ) {
        setUnlockedThemes((prev) => {
          if (!prev.includes(currentDailyChallenge.rewardId!)) {
            console.log(
              `Daily challenge completed! Unlocked theme: ${currentDailyChallenge.rewardId}.`
            );
            return [...prev, currentDailyChallenge.rewardId!];
          }
          return prev;
        });
      }
    }
  }, [
    overallStats,
    createFireworks,
    playSound,
    ACHIEVEMENT_CURRENCY_REWARD,
    TOOLS_DATA,
    currentDailyChallenge,
    isDailyChallengeCompleted,
  ]);

  // Trigger achievement checks when overallStats change
  useEffect(() => {
    checkAchievements();
  }, [overallStats, checkAchievements]);

  // Trigger achievement checks when navigating to menu or stats page
  useEffect(() => {
    if (currentPage === "menu" || currentPage === "stats") {
      checkAchievements();
    }
  }, [currentPage, checkAchievements]);

  // Bot AI Logic
  const getBotDirection = useCallback(
    (
      botHead: Position,
      botBody: Position[],
      foodItems: Food[],
      currentObstacles: Position[]
    ): Position => {
      const maxX = Math.floor(canvasWidth / GRID_SIZE);
      const maxY = Math.floor(canvasHeight / GRID_SIZE);

      // Find closest food
      let closestFood: Food | null = null;
      let minDistance = Number.POSITIVE_INFINITY;
      foodItems.forEach((f) => {
        const dist =
          Math.abs(botHead.x - f.position.x) +
          Math.abs(botHead.y - f.position.y);
        if (dist < minDistance) {
          minDistance = dist;
          closestFood = f;
        }
      });

      const possibleDirections = [
        { x: 0, y: -1 }, // Up
        { x: 0, y: 1 }, // Down
        { x: -1, y: 0 }, // Left
        { x: 1, y: 0 }, // Right
      ];

      // Prioritize moving towards food
      if (closestFood) {
        const targetX = (closestFood as Food)?.position?.x;
        const targetY = (closestFood as Food)?.position?.y;

        // Try horizontal movement first
        if (targetX > botHead.x) possibleDirections.unshift({ x: 1, y: 0 });
        else if (targetX < botHead.x)
          possibleDirections.unshift({ x: -1, y: 0 });

        // Then vertical movement
        if (targetY > botHead.y) possibleDirections.unshift({ x: 0, y: 1 });
        else if (targetY < botHead.y)
          possibleDirections.unshift({ x: 0, y: -1 });
      }

      // Filter out directions that lead to immediate collision
      const safeDirections = possibleDirections.filter((dir) => {
        let nextX = botHead.x + dir.x;
        let nextY = botHead.y + dir.y;

        // Account for wrapping
        if (nextX < 0) nextX = maxX - 1;
        if (nextX >= maxX) nextX = 0;
        if (nextY < 0) nextY = maxY - 1;
        if (nextY >= maxY) nextY = 0;

        const collisionWithSelf = botBody.some(
          (segment, idx) =>
            idx > 0 && segment.x === nextX && segment.y === nextY
        );
        const collisionWithObstacle = currentObstacles.some(
          (o) => o.x === nextX && o.y === nextY
        );
        const collisionWithPlayer = snake.some(
          (s) => s.x === nextX && s.y === nextY
        );

        return (
          !collisionWithSelf && !collisionWithObstacle && !collisionWithPlayer
        );
      });

      // If there are safe directions, pick one (prioritizing the first in the list)
      if (safeDirections.length > 0) {
        return safeDirections[0];
      }

      // If no safe direction, try to reverse (as a last resort, might still die)
      const currentDir = botDirection;
      const reverseDir = { x: -currentDir.x, y: -currentDir.y };
      if (
        !(
          botBody.some(
            (segment, idx) =>
              idx > 0 &&
              segment.x === botHead.x + reverseDir.x &&
              segment.y === botHead.y + reverseDir.y
          ) ||
          currentObstacles.some(
            (o) =>
              o.x === botHead.x + reverseDir.x &&
              o.y === botHead.y + reverseDir.y
          ) ||
          snake.some(
            (s) =>
              s.x === botHead.x + reverseDir.x &&
              s.y === botHead.y + reverseDir.y
          )
        )
      ) {
        return reverseDir;
      }

      // If truly stuck, just pick a random direction (will likely die)
      return possibleDirections[
        Math.floor(Math.random() * possibleDirections.length)
      ];
    },
    [canvasWidth, canvasHeight, snake, obstacles, botDirection]
  );

  // Game loop
  useEffect(() => {
    if (currentPage !== "game" || gameState !== "playing") return;

    const gameLoop = (currentTime: number) => {
      if (currentTime - lastTimeRef.current >= speed) {
        // Player Snake Movement
        setSnake((prevSnake) => {
          const newSnake = [...prevSnake];
          const head = { ...newSnake[0] };

          // Process direction from queue
          let currentDirection = direction; // Default to current state direction
          if (directionQueue.current.length > 0) {
            currentDirection = directionQueue.current.shift() || direction; // Use queued direction
            setDirection(currentDirection); // Update state direction
          }

          head.x += currentDirection.x;
          head.y += currentDirection.y;

          const maxX = Math.floor(canvasWidth / GRID_SIZE);
          const maxY = Math.floor(canvasHeight / GRID_SIZE);

          // Check if shield or temporary self-invincibility is active
          // These buffs prevent death from ALL collisions (self, obstacle, wall).
          const isInvincible = activeBuffs.some(
            (buff) => buff.type === "shield"
          );
          const isTempSelfInvincible = activeBuffs.some(
            (b) => b.type === "temp-self-invincible"
          );
          const isWallBreakerActive = wallBreakerUses > 0;

          // Wall collision logic (modified for fragile-walls and wall-breaker)
          let wallCollision = false;
          if (head.x < 0 || head.x >= maxX || head.y < 0 || head.y >= maxY) {
            if (isWallFragile) {
              wallCollision = true; // Wall collision is lethal
            } else if (isWallBreakerActive) {
              // Consume a wall breaker use and wrap
              setWallBreakerUses((prev) => prev - 1);
              if (head.x < 0) head.x = maxX - 1;
              if (head.x >= maxX) head.x = 0;
              if (head.y < 0) head.y = maxY - 1;
              if (head.y >= maxY) head.y = 0;
              playSound("general_positive_effect"); // Sound for passing through wall
              createParticles(head.x, head.y, "wall-break"); // Particles for wall break
              setOverallStats((prev) => ({
                ...prev,
                obstaclesBroken: prev.obstaclesBroken + 1,
              }));
            } else {
              // Normal screen wrapping
              if (head.x < 0) head.x = maxX - 1;
              if (head.x >= maxX) head.x = 0;
              if (head.y < 0) head.y = maxY - 1;
              if (head.y >= maxY) head.y = 0;
            }
          }

          // Self collision - check against body (not head)
          const selfCollision = newSnake
            .slice(1)
            .some((segment) => segment.x === head.x && segment.y === head.y);
          // Obstacle collision
          let obstacleCollision = obstacles.some(
            (obstacle) => obstacle.x === head.x && obstacle.y === head.y
          );
          // Bot collision
          const botCollision =
            gameMode === "coop" &&
            botSnake.some(
              (segment) => segment.x === head.x && segment.y === head.y
            );

          if (obstacleCollision && isWallBreakerActive) {
            // If wall breaker is active, consume a use and remove the obstacle
            setWallBreakerUses((prev) => prev - 1);
            setObstacles((prev) =>
              prev.filter((o) => !(o.x === head.x && o.y === head.y))
            );
            playSound("general_positive_effect");
            createParticles(head.x, head.y, "wall-break");
            setOverallStats((prev) => ({
              ...prev,
              obstaclesBroken: prev.obstaclesBroken + 1,
            }));
            obstacleCollision = false; // No collision if broken
          }

          // Death condition: collision AND NOT (invincible OR temporarily self-invincible)
          if (
            (selfCollision ||
              obstacleCollision ||
              wallCollision ||
              botCollision) &&
            !(isInvincible || isTempSelfInvincible)
          ) {
            const finalScore = score;
            if (finalScore > highScore) {
              setHighScore(finalScore);
              localStorage.setItem(
                "serpentineHighScore",
                finalScore.toString()
              );
            }
            setOverallStats((prev) => {
              const newStats = {
                ...prev,
                totalScore: prev.totalScore + finalScore,
                totalDeaths: prev.totalDeaths + 1, // Increment total deaths
                totalPlayTime:
                  prev.totalPlayTime +
                  Math.floor((Date.now() - gameStartTimeRef.current) / 1000), // Add session play time
              };
              localStorage.setItem(
                "serpentineOverallStats",
                JSON.stringify(newStats)
              );
              return newStats;
            });
            setLives((prev) => prev - 1); // Consume a life
            navigateToPage("gameOver"); // Always go to game over screen
            playSound("gameover"); // Play game over sound
            return prevSnake; // Return current snake state, game over page will handle reset
          }

          newSnake.unshift(head);

          // Check food collision
          const eatenFoodIndex = food.findIndex(
            (f) => f.position.x === head.x && f.position.y === head.y
          );
          if (eatenFoodIndex !== -1) {
            const eatenFood = food[eatenFoodIndex];
            const points =
              eatenFood.points *
              (activeBuffs.some((buff) => buff.type === "multiplier") ? 2 : 1);

            setScore((prev) => prev + points); // Update cumulative score
            setCurrency(
              (prev) =>
                prev +
                Math.floor(points / 5) +
                1 *
                  (activeBuffs.some((b) => b.type === "coin-booster-active")
                    ? 2
                    : 1)
            ); // Earn currency based on points, doubled by coin booster
            setFoodEatenInLevel((prev) => prev + 1); // Increment food eaten for speed increase
            setOverallStats((prev) => ({
              ...prev,
              score: prev.score + points, // Update overall session score
              foodEaten: prev.foodEaten + 1,
              foodEatenByType: {
                ...prev.foodEatenByType,
                [eatenFood.type]:
                  (prev.foodEatenByType[eatenFood.type] || 0) + 1,
              }, // Track food by type
              maxLength: Math.max(prev.maxLength, newSnake.length),
              shrinkPotionsEaten:
                eatenFood.type === "shrink"
                  ? prev.shrinkPotionsEaten + 1
                  : prev.shrinkPotionsEaten,
              totalCurrencyEarned:
                prev.totalCurrencyEarned +
                Math.floor(points / 5) +
                1 *
                  (activeBuffs.some((b) => b.type === "coin-booster-active")
                    ? 2
                    : 1),
            }));

            createParticles(head.x, head.y, eatenFood.type); // Particles for food type

            // --- Food Interaction Logic ---
            setActiveBuffs((updatedBuffs) => {
              let currentBuffs = [...updatedBuffs]; // Use let to allow re-assignment

              const addOrUpdateBuff = (newBuff: (typeof activeBuffs)[0]) => {
                const existingBuffIndex = currentBuffs.findIndex(
                  (b) => b.type === newBuff.type
                );
                if (existingBuffIndex !== -1) {
                  // If buff exists, extend its duration
                  currentBuffs = currentBuffs.map((b, i) =>
                    i === existingBuffIndex
                      ? { ...b, timeLeft: newBuff.timeLeft }
                      : b
                  );
                } else {
                  // Otherwise, add new buff
                  currentBuffs.push(newBuff);
                }
              };

              // Handle counteracting effects and apply side effects
              if (eatenFood.type === "shield") {
                currentBuffs = currentBuffs.filter((b) => {
                  if (b.type === "fragile-walls") {
                    setIsWallFragile(false);
                    playSound("general_positive_effect");
                    return false;
                  }
                  if (b.type === "poisoned") {
                    setIsPoisoned(false);
                    setOverallStats((prev) => ({
                      ...prev,
                      poisonCuredCount: prev.poisonCuredCount + 1,
                    }));
                    playSound("general_positive_effect");
                    return false;
                  }
                  return true;
                });
                // Shield's side effect: lose score
                setScore((prev) => Math.max(0, prev - 5));
                addOrUpdateBuff({
                  type: "shield",
                  timeLeft: getEffectDuration(true, 300),
                  duration: getEffectDuration(true, 300),
                  color: currentTheme.highlight3,
                  emoji: "🛡️",
                  flashColor: currentTheme.invincibilityGlowColor,
                  snakeEffect: "glow",
                });
              } else if (eatenFood.type === "fragile-walls") {
                currentBuffs = currentBuffs.filter((b) => {
                  if (b.type === "shield") {
                    playSound("general_negative_effect");
                    return false;
                  }
                  return true;
                });
                // Fragile Walls' side effect: gain currency
                setCurrency((prev) => prev + 10);
                setOverallStats((prev) => ({
                  ...prev,
                  totalCurrencyEarned: prev.totalCurrencyEarned + 10,
                }));
                addOrUpdateBuff({
                  type: "fragile-walls",
                  timeLeft: getEffectDuration(false, 300),
                  duration: getEffectDuration(false, 300),
                  color: currentTheme.dangerGradientColors[0],
                  emoji: "🧱",
                  flashColor: currentTheme.dangerGradientColors[0],
                });
                setIsWallFragile(true);
              } else if (eatenFood.type === "speed") {
                currentBuffs = currentBuffs.filter((b) => {
                  if (b.type === "slow" || b.type === "temp-slow") {
                    setSpeed((prev) => Math.max(50, prev - 20)); // Counteract slow effect
                    playSound("general_positive_effect");
                    return false;
                  }
                  return true;
                });
                // Speed's side effect: food disappears faster
                setFood((prev) =>
                  prev.map((f) =>
                    f.timeLeft !== undefined
                      ? { ...f, timeLeft: Math.max(1, f.timeLeft * 0.8) }
                      : f
                  )
                );
                addOrUpdateBuff({
                  type: "speed",
                  timeLeft: getEffectDuration(true, 300),
                  duration: getEffectDuration(true, 300),
                  color: currentTheme.highlight1,
                  emoji: "⚡",
                  flashColor: currentTheme.highlight1,
                  snakeEffect: "pulse-bright",
                });
              } else if (eatenFood.type === "slow") {
                currentBuffs = currentBuffs.filter((b) => {
                  if (b.type === "speed" || b.type === "temp-speed") {
                    setSpeed((prev) => Math.min(400, prev + 20)); // Counteract speed effect
                    playSound("general_negative_effect");
                    return false;
                  }
                  return true;
                });
                // Slow's side effect: food lasts longer
                setFood((prev) =>
                  prev.map((f) =>
                    f.timeLeft !== undefined
                      ? { ...f, timeLeft: Math.min(600, f.timeLeft * 1.2) }
                      : f
                  )
                );
                addOrUpdateBuff({
                  type: "slow",
                  timeLeft: getEffectDuration(false, 300),
                  duration: getEffectDuration(false, 300),
                  color: currentTheme.highlight2,
                  emoji: "🐢",
                  flashColor: currentTheme.highlight2,
                  snakeEffect: "pulse-dim",
                });
              } else if (eatenFood.type === "growth") {
                // Growth's side effect: temporary slight slow
                setSpeed((prev) => Math.min(400, prev + 20));
                addOrUpdateBuff({
                  type: "temp-slow",
                  timeLeft: getEffectDuration(false, 180), // Debuff duration
                  duration: getEffectDuration(false, 180),
                  color: currentTheme.highlight2,
                  emoji: "🐌",
                  snakeEffect: "pulse-dim",
                });
                playSound("general_positive_effect");
              } else if (eatenFood.type === "teleport") {
                // Teleport's side effect: random direction change and speed reduction
                const randomDirections = [
                  { x: 1, y: 0 },
                  { x: -1, y: 0 },
                  { x: 0, y: 1 },
                  { x: 0, y: -1 },
                ];
                setDirection(
                  randomDirections[
                    Math.floor(Math.random() * randomDirections.length)
                  ]
                );
                setSpeed((prev) => Math.min(400, prev + 50)); // Reduce speed

                // Find a new safe position for the snake
                let newPosition: Position | null = null;
                let teleportAttempts = 0;
                const maxTeleportAttempts = 100;
                while (!newPosition && teleportAttempts < maxTeleportAttempts) {
                  const randX = Math.floor(Math.random() * maxX);
                  const randY = Math.floor(Math.random() * maxY);
                  const potentialPos = { x: randX, y: randY };
                  const onSnake = newSnake.some(
                    (s) => s.x === potentialPos.x && s.y === potentialPos.y
                  );
                  const onObstacle = obstacles.some(
                    (o) => o.x === potentialPos.x && o.y === potentialPos.y
                  );
                  const onBotSnake =
                    gameMode === "coop" &&
                    botSnake.some(
                      (s) => s.x === potentialPos.x && s.y === potentialPos.y
                    );
                  if (!onSnake && !onObstacle && !onBotSnake) {
                    newPosition = potentialPos;
                  }
                  teleportAttempts++;
                }

                if (newPosition) {
                  setSnake([newPosition]); // Teleport snake head
                } else {
                  console.warn("Could not find a safe teleport location.");
                }

                playSound("teleport_effect");
              } else if (eatenFood.type === "shrink") {
                // Shrink's side effect: temporary speed boost
                setSpeed((prev) => Math.max(50, prev - 20));
                addOrUpdateBuff({
                  type: "temp-speed",
                  timeLeft: getEffectDuration(true, 180), // Buff duration
                  duration: getEffectDuration(true, 180),
                  color: currentTheme.highlight1,
                  emoji: "💨",
                  snakeEffect: "pulse-bright",
                });
                playSound("general_negative_effect");
              } else if (eatenFood.type === "poison") {
                // Poison's side effect: temporary self-invincibility
                addOrUpdateBuff({
                  type: "temp-self-invincible",
                  timeLeft: getEffectDuration(true, 180), // Buff duration
                  duration: getEffectDuration(true, 180),
                  color: currentTheme.highlight3,
                  emoji: "👻",
                  flashColor: currentTheme.invincibilityGlowColor, // Use shield glow for ghost
                  snakeEffect: "transparent",
                });
                setIsPoisoned(true);
                playSound("general_negative_effect");
              } else if (eatenFood.type === "life-potion") {
                setLives((prev) => Math.min(prev + 1, MAX_LIVES));
                playSound("powerup");
              } else if (eatenFood.type === "multiplier") {
                addOrUpdateBuff({
                  type: "multiplier",
                  timeLeft: getEffectDuration(true, 300),
                  duration: getEffectDuration(true, 300),
                  color: currentTheme.highlight4,
                  emoji: "✨",
                  flashColor: currentTheme.multiplierGlowColor,
                });
                playSound("general_positive_effect");
              } else {
                playSound("score_increase"); // Default eat sound for apple, cherry, gem
              }

              return currentBuffs;
            });

            setFood((prev) => {
              const newFood = [...prev];
              newFood.splice(eatenFoodIndex, 1);
              newFood.push(generateFood(Math.random() < 0.3)); // 30% chance for special food
              return newFood;
            });

            const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty];
            setSpeed((prev) =>
              Math.max(50, prev - difficultySettings.speedIncrease)
            );
          } else {
            // Snake always shrinks if no food is eaten, regardless of temp-self-invincible
            // The temp-self-invincible buff only prevents death from collisions.
            const isLengthLocked = activeBuffs.some(
              (b) => b.type === "length-lock"
            );
            if (!isLengthLocked) {
              newSnake.pop();
            }
          }

          return newSnake;
        });

        // Bot Snake Movement (if active)
        if (gameMode === "coop" && botActiveRef.current) {
          setBotSnake((prevBotSnake) => {
            if (prevBotSnake.length === 0) return []; // Bot is dead

            const newBotSnake = [...prevBotSnake];
            const botHead = { ...newBotSnake[0] };

            const newBotDir = getBotDirection(
              botHead,
              newBotSnake,
              food,
              obstacles
            );
            setBotDirection(newBotDir); // Update bot's direction state

            botHead.x += newBotDir.x;
            botHead.y += newBotDir.y;

            const maxX = Math.floor(canvasWidth / GRID_SIZE);
            const maxY = Math.floor(canvasHeight / GRID_SIZE);

            // Bot Wall wrapping
            if (botHead.x < 0) botHead.x = maxX - 1;
            if (botHead.x >= maxX) botHead.x = 0;
            if (botHead.y < 0) botHead.y = maxY - 1;
            if (botHead.y >= maxY) botHead.y = 0;

            // Bot collision detection
            const botSelfCollision = newBotSnake
              .slice(1)
              .some(
                (segment) => segment.x === botHead.x && segment.y === botHead.y
              );
            const botObstacleCollision = obstacles.some(
              (obstacle) => obstacle.x === botHead.x && obstacle.y === botHead.y
            );
            const botPlayerCollision = snake.some(
              (segment) => segment.x === botHead.x && segment.y === botHead.y
            );

            if (
              botSelfCollision ||
              botObstacleCollision ||
              botPlayerCollision
            ) {
              botActiveRef.current = false; // Bot dies
              playSound("general_negative_effect");
              return []; // Bot snake disappears
            }

            newBotSnake.unshift(botHead);

            // Check bot food collision
            const botEatenFoodIndex = food.findIndex(
              (f) => f.position.x === botHead.x && f.position.y === botHead.y
            );
            if (botEatenFoodIndex !== -1) {
              const eatenFood = food[botEatenFoodIndex];
              const points = eatenFood.points; // Bot doesn't get multipliers for simplicity

              setBotScore((prev) => prev + points);
              setFood((prev) => {
                const newFood = [...prev];
                newFood.splice(botEatenFoodIndex, 1);
                newFood.push(generateFood(Math.random() < 0.3));
                return newFood;
              });
            } else {
              newBotSnake.pop(); // Bot shrinks if no food
            }
            return newBotSnake;
          });
        }

        // Check for level up (only in levels mode)
        if (
          gameMode === "levels" &&
          level < LEVEL_DATA.length - 1 &&
          score >= currentLevelTargetScore
        ) {
          const nextLevel = level + 1;
          setOverallStats((prev) => ({
            ...prev,
            levelsCleared: prev.levelsCleared + 1,
          })); // Update levels cleared
          resetLevelState(nextLevel); // Call resetLevelState for level transition
        }

        // Update active buffs
        setActiveBuffs((prev) =>
          prev
            .map((buff) => {
              const newTimeLeft = buff.timeLeft - 1;
              // Warning for temp-self-invincible expiring
              if (buff.type === "temp-self-invincible" && newTimeLeft === 120) {
                // Last 2 seconds
                playSound("general_negative_effect"); // Use a distinct warning sound
              }
              return { ...buff, timeLeft: newTimeLeft };
            })
            .filter((buff) => {
              if (buff.timeLeft <= 0) {
                // Specific cleanup for buffs ending
                if (buff.type === "fragile-walls") {
                  setIsWallFragile(false);
                }
                if (buff.type === "poisoned") {
                  setIsPoisoned(false);
                }
                if (buff.type === "time-warp") {
                  setSpeed((prev) => Math.max(50, prev - 100)); // Revert speed change from time warp
                }
                if (buff.type === "temp-slow") {
                  setSpeed((prev) => Math.max(50, prev - 20)); // Revert temp slow
                }
                if (buff.type === "temp-speed") {
                  setSpeed((prev) => Math.min(400, prev + 20)); // Revert temp speed
                }
                return false;
              }
              return true;
            })
        );

        // Apply poison effect if active
        const isLengthLocked = activeBuffs.some(
          (b) => b.type === "length-lock"
        );
        if (
          isPoisoned &&
          snake.length > 1 &&
          lastTimeRef.current % 60 === 0 &&
          !isLengthLocked
        ) {
          // Shrink every second
          setSnake((prev) => {
            const newLength = Math.max(1, prev.length - 1);
            return prev.slice(0, newLength);
          });
        }

        // Update food timers and remove expired food
        setFood((prevFood) => {
          const updatedFood = prevFood
            .map((f) => {
              if (f.timeLeft !== undefined) {
                return { ...f, timeLeft: f.timeLeft - 1 };
              }
              return f;
            })
            .filter((f) => {
              if (f.timeLeft !== undefined && f.timeLeft <= 0) {
                // Food expired, generate a new one and create disappearance particles
                createParticles(f.position.x, f.position.y, "disappear");
                setFood((currentFood) => [
                  ...currentFood,
                  generateFood(Math.random() < 0.3),
                ]); // 30% chance for special food
                return false; // Remove this food
              }
              return true;
            });
          return updatedFood;
        });

        // Food attractor logic
        const isFoodAttractorActive = activeBuffs.some(
          (b) => b.type === "food-attractor-active"
        );
        if (isFoodAttractorActive && snake.length > 0) {
          setFood((prevFood) =>
            prevFood.map((f) => {
              const head = snake[0];
              const dx = head.x - f.position.x;
              const dy = head.y - f.position.y;
              const distance = Math.sqrt(dx * dx + dy * dy);

              if (distance > 0 && distance < 8) {
                // Only attract if within 8 grid units
                const moveAmount = 0.1; // How fast food moves towards snake
                return {
                  ...f,
                  position: {
                    x: f.position.x + Math.sign(dx) * moveAmount,
                    y: f.position.y + Math.sign(dy) * moveAmount,
                  },
                };
              }
              return f;
            })
          );
        }

        lastTimeRef.current = currentTime;
      }

      // Update particles
      setParticles((prev) =>
        prev
          .map((particle: any) => {
            return {
              ...particle,
              x: particle.x + particle.vx,
              y: particle.y + particle.vy,
              vx: particle.vx * 0.98,
              vy: particle.vy * 0.98 + 0.1,
              life: particle.life - 1,
            };
          })
          .filter((particle: any) => particle.life > 0)
      );

      // Update fireworks
      setFireworks((prev) =>
        prev
          .map((firework: any) => ({
            ...firework,
            life: firework.life - 1,
            particles: firework.particles
              .map((particle: any) => ({
                ...particle,
                x: particle.x + particle.vx,
                y: particle.y + particle.vy,
                vx: particle.vx * 0.98,
                vy: particle.vy * 0.98 + 0.1,
                life: particle.life - 1,
                trail: [
                  ...particle.trail.slice(-8),
                  { x: particle.x, y: particle.y },
                ],
              }))
              .filter((particle: any) => particle.life > 0),
          }))
          .filter(
            (firework: any) =>
              firework.life > 0 && firework.particles.length > 0
          )
      );

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    animationRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    currentPage,
    gameState,
    direction, // Keep direction here as it's read directly for movement
    food,
    score,
    highScore,
    speed,
    generateFood,
    createParticles,
    settings.difficulty,
    navigateToPage,
    canvasWidth,
    canvasHeight,
    obstacles,
    level,
    currentLevelTargetScore,
    resetLevelState,
    activeBuffs, // Added activeBuffs to dependencies
    currentTheme, // Added currentTheme to dependencies for buff colors
    playSound, // Added playSound to dependencies
    unreachableFoodPendingShield, // Added for shield logic
    isWallFragile, // Added for wall collision logic
    isPoisoned, // Added for poison logic
    snake,
    wallBreakerUses, // For wall breaker tool
    lives, // For life system
    getEffectDuration,
    currency, // For coin booster
    directionQueue, // Added directionQueue to dependencies
    gameMode, // Added gameMode for mode-specific logic
    botSnake, // Added botSnake for bot logic
    botDirection, // Added botDirection for bot logic
    getBotDirection, // Added getBotDirection for bot logic
  ]);

  // Speed increase every 10 bites (or 5 for endless)
  useEffect(() => {
    if (foodEatenInLevel > 0) {
      const speedIncreaseThreshold = gameMode === "endless" ? 5 : 10;
      if (foodEatenInLevel % speedIncreaseThreshold === 0) {
        setSpeed((prev) => Math.max(50, prev - 10)); // Increase speed by 10ms every X bites
      }
    }
  }, [foodEatenInLevel, gameMode]);

  // Initialize food when canvas dimensions are available
  useEffect(() => {
    if (canvasWidth > 0 && canvasHeight > 0 && food.length === 0) {
      const difficultySettings = DIFFICULTY_SETTINGS[settings.difficulty];
      const initialFood: Food[] = [];
      const foodCount =
        gameMode === "endless"
          ? difficultySettings.foodCount + 1
          : difficultySettings.foodCount; // More food in endless
      for (let i = 0; i < foodCount; i++) {
        initialFood.push(generateFood(Math.random() < 0.3)); // 30% chance for special food
      }
      const hasBeneficialFood = initialFood.some(
        (f) => !["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
      );
      if (!hasBeneficialFood && initialFood.length > 0) {
        const badFoodIndex = initialFood.findIndex((f) =>
          ["slow", "shrink", "fragile-walls", "poison"].includes(f.type)
        );
        if (badFoodIndex !== -1) {
          initialFood[badFoodIndex] = generateFood(false); // Replace with a non-special food
        }
      }
      setFood(initialFood);
    }
  }, [
    canvasWidth,
    canvasHeight,
    food.length,
    generateFood,
    settings.difficulty,
    gameMode,
  ]);

  // Simplified page transition variants
  const pageVariants = {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
    },
    exit: {
      opacity: 0,
    },
  };

  return (
    <>
      {/* Achievement Notification with Fireworks */}
      {showAchievement && currentPage === "game" && (
        <AchievementNotification
          achievement={showAchievement}
          fireworks={fireworks}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          currentTheme={currentTheme}
        />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
          className="fixed inset-0"
        >
          {currentPage === "menu" && (
            <MenuPage
              navigateToPage={navigateToPage as any}
              highScore={highScore}
              overallStats={overallStats}
              overallAchievements={overallAchievements}
              currentTheme={currentTheme}
              currency={currency} // Pass currency
              equippedTool={equippedTool} // Pass equipped tool
              unlockedTools={unlockedTools} // Pass unlocked tools to show uses
              currentDailyChallenge={currentDailyChallenge}
              isDailyChallengeCompleted={isDailyChallengeCompleted}
              startGameSession={startGameSession} // Pass startGameSession
            />
          )}
          {currentPage === "mode" && (
            <ModePage
              navigateToPage={navigateToPage as any}
              highScore={highScore}
              overallStats={overallStats}
              overallAchievements={overallAchievements}
              currentTheme={currentTheme}
              currency={currency} // Pass currency
              equippedTool={equippedTool} // Pass equipped tool
              unlockedTools={unlockedTools} // Pass unlocked tools to show uses
              currentDailyChallenge={currentDailyChallenge}
              isDailyChallengeCompleted={isDailyChallengeCompleted}
              startGameSession={startGameSession} // Pass startGameSession
            />
          )}
          {currentPage === "settings" && (
            <SettingsPage
              navigateToPage={navigateToPage as any}
              settings={settings}
              setSettings={setSettings}
              currentTheme={currentTheme}
              unlockedThemes={unlockedThemes} // Pass unlocked themes
            />
          )}
          {currentPage === "achievements" && (
            <AchievementsPage
              navigateToPage={navigateToPage as any}
              overallAchievements={overallAchievements}
              currentTheme={currentTheme}
            />
          )}
          {currentPage === "stats" && (
            <StatsPage
              navigateToPage={navigateToPage as any}
              overallStats={overallStats}
              highScore={highScore}
              currentTheme={currentTheme}
            />
          )}
          {currentPage === "help" && (
            <HelpPage
              navigateToPage={navigateToPage as any}
              currentTheme={currentTheme}
            />
          )}
          {currentPage === "levelSelect" && (
            <LevelSelectPage
              navigateToPage={navigateToPage as any}
              startGameSessionFromLevel={(levelIndex) =>
                startGameSession("levels", levelIndex)
              } // Pass mode
              lastBeatenLevel={lastBeatenLevel}
              currentTheme={currentTheme}
              lives={lives} // Pass lives to level select
            />
          )}
          {currentPage === "levelStart" && (
            <LevelStartPage
              navigateToPage={navigateToPage as any}
              startGameSession={() => startGameSession("levels", 1)} // Start current level in levels mode
              resumeGame={resumeGame}
              currentTheme={currentTheme}
              level={level}
              score={score}
              gameState={gameState}
              currentLevelTargetScore={currentLevelTargetScore}
            />
          )}
          {currentPage === "tools" && (
            <ToolsPage
              navigateToPage={navigateToPage as any}
              currency={currency}
              unlockedTools={unlockedTools}
              equippedTool={equippedTool}
              toolsData={TOOLS_DATA}
              purchaseTool={purchaseTool}
              equipTool={equipTool}
              currentTheme={currentTheme}
              lives={lives} // Pass lives to tools page
            />
          )}
          {currentPage === "game" && (
            <GamePage
              canvasRef={canvasRef as any}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              snake={snake}
              food={food}
              particles={particles}
              fireworks={fireworks}
              obstacles={obstacles}
              activeBuffs={activeBuffs} // Pass activeBuffs
              settings={settings}
              score={score}
              highScore={highScore}
              navigateToPage={navigateToPage as any}
              currentTheme={currentTheme}
              pauseGame={pauseGame}
              gameState={gameState}
              level={level}
              currentLevelTargetScore={currentLevelTargetScore} // Pass target score for winning cue
              isWallFragile={isWallFragile} // Pass wall fragility state
              isPoisoned={isPoisoned} // Pass poison state
              wallBreakerUses={wallBreakerUses} // Pass wall breaker uses
              lives={lives} // Pass lives to game page
              currency={currency} // Pass currency to game page
              gameMode={gameMode} // Pass game mode
              botSnake={botSnake} // Pass bot snake
              botScore={botScore} // Pass bot score
            />
          )}
          {currentPage === "gameOver" && (
            <GameOverPage
              score={score}
              highScore={highScore}
              snakeLength={snake.length}
              difficulty={settings.difficulty}
              startGameSession={startGameSession} // Pass startGameSession
              navigateToPage={navigateToPage as any}
              currentTheme={currentTheme}
              level={level}
              lives={lives} // Pass lives to game over page
              gameMode={gameMode} // Pass game mode
              botScore={botScore} // Pass bot score
            />
          )}
        </motion.div>
      </AnimatePresence>

      {showWelcomeModal && (
        <WelcomeModal
          navigateToPage={navigateToPage as any}
          onClose={() => setShowWelcomeModal(false)}
        />
      )}
    </>
  );
}
