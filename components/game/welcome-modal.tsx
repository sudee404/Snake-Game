"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, HelpCircle } from "lucide-react"
import { motion } from "framer-motion"

interface WelcomeModalProps {
  navigateToPage: (page: string) => void
  onClose: () => void
}

export function WelcomeModal({ navigateToPage, onClose }: WelcomeModalProps) {
  const handlePlay = () => {
    onClose()
    navigateToPage("levelSelect")
  }

  const handleHelp = () => {
    onClose()
    navigateToPage("help")
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-6 bg-slate-800 border-slate-700 text-slate-100 shadow-lg">
          <h2 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
            Welcome to Serpentine Odyssey!
          </h2>
          <p className="text-center text-slate-300 mb-6">
            Embark on an epic journey of skill and reflexes. Guide your snake, eat food, grow, and conquer challenging
            levels!
          </p>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handlePlay}
              size="lg"
              className="h-12 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 transition-all shadow-md"
            >
              <Play className="w-6 h-6 mr-3" />
              Start Your Adventure
            </Button>
            <Button
              onClick={handleHelp}
              size="lg"
              variant="outline"
              className="h-12 text-lg border-2 border-slate-600 text-slate-100 bg-slate-800 hover:bg-slate-700/50 hover:scale-105 transition-all shadow-md"
            >
              <HelpCircle className="w-6 h-6 mr-3" />
              How to Play
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  )
}
