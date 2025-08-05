"use client"

import { Card } from "@/components/ui/card"
import type { Achievement, ThemePalette } from "@/lib/game-constants"
import { useRef } from "react"
import { useEffect } from "react"

interface AchievementNotificationProps {
  achievement: Achievement
  fireworks: any[] // Using any for simplicity
  canvasWidth: number
  canvasHeight: number
  currentTheme: ThemePalette
}

export function AchievementNotification({
  achievement,
  fireworks,
  canvasWidth,
  canvasHeight,
  currentTheme,
}: AchievementNotificationProps) {
  const fireworkCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    let animationFrame: number
    const canvas = fireworkCanvasRef.current
    const ctx = canvas?.getContext("2d")

    const animateFireworks = () => {
      if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        fireworks.forEach((firework) => {
          firework.particles.forEach((particle: any) => {
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
              particle.trail.forEach((point: any) => ctx.lineTo(point.x, point.y))
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
      animationFrame = requestAnimationFrame(animateFireworks)
    }

    if (fireworks.length > 0) {
      animationFrame = requestAnimationFrame(animateFireworks)
    }

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [fireworks])

  return (
    <>
      {/* Fireworks Canvas */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <canvas width={canvasWidth} height={canvasHeight} className="absolute inset-0" ref={fireworkCanvasRef} />
      </div>

      {/* Achievement Card */}
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300 fade-out-1000">
        <Card className={`p-4 ${currentTheme.warningGradient} bg-inherit text-black border-0 shadow-sm`}>
          {" "}
          {/* Reduced shadow further */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-full flex items-center justify-center text-xl">
              {achievement.icon}
            </div>
            <div>
              <h3 className="font-bold">Achievement Unlocked!</h3>
              <p className="text-sm">{achievement.name}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
