"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, Sparkles } from "lucide-react"
import { generateStory, continueStory } from "@/app/actions"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export default function TextRPG() {
  const [worldPrompt, setWorldPrompt] = useState("")
  const [playerInput, setPlayerInput] = useState("")
  const [gameStarted, setGameStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load saved game state from localStorage if available
  useEffect(() => {
    const savedState = localStorage.getItem("rpgGameState")
    if (savedState) {
      const { savedMessages, savedGameStarted, savedWorldPrompt } = JSON.parse(savedState)
      setMessages(savedMessages)
      setGameStarted(savedGameStarted)
      setWorldPrompt(savedWorldPrompt)
    }
  }, [])

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0 || gameStarted) {
      localStorage.setItem(
        "rpgGameState",
        JSON.stringify({
          savedMessages: messages,
          savedGameStarted: gameStarted,
          savedWorldPrompt: worldPrompt,
        }),
      )
    }
  }, [messages, gameStarted, worldPrompt])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleStartGame = async () => {
    if (!worldPrompt.trim()) return

    setLoading(true)
    try {
      const initialStory = await generateStory(worldPrompt)
      setMessages([
        { role: "system", content: `World: ${worldPrompt}` },
        { role: "assistant", content: initialStory },
      ])
      setGameStarted(true)
    } catch (error) {
      console.error("Error starting game:", error)
      setMessages([{ role: "system", content: "Error starting game. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!playerInput.trim() || loading) return

    const userMessage = { role: "user", content: playerInput }
    setMessages((prev) => [...prev, userMessage])
    setPlayerInput("")
    setLoading(true)

    try {
      const response = await continueStory([...messages, userMessage])
      setMessages((prev) => [...prev, { role: "assistant", content: response }])
    } catch (error) {
      console.error("Error continuing story:", error)
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong. Please try again." }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (gameStarted) {
        handleSendMessage()
      } else {
        handleStartGame()
      }
    }
  }

  const handleReset = () => {
    if (window.confirm("Are you sure you want to start a new game? Your current progress will be lost.")) {
      setMessages([])
      setGameStarted(false)
      setWorldPrompt("")
      localStorage.removeItem("rpgGameState")
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-[url('/bg-texture.png')] bg-cover bg-center bg-black">
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <header className="text-center mb-4">
          <h1 className="text-5xl font-bold text-amber-400 mb-2 font-rpg tracking-wide drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
            Solo Text RPG
          </h1>
          <p className="text-amber-200 font-medieval">Worldbuilder Edition</p>
        </header>

        {!gameStarted ? (
          <div className="p-6 bg-black/70 border-2 border-amber-900/80 rounded-lg shadow-[0_0_15px_rgba(255,170,0,0.3)] backdrop-blur-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="h-px bg-amber-900/80 flex-grow"></div>
              <h2 className="text-2xl font-bold text-amber-400 mx-4 font-rpg flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                Create Your World
              </h2>
              <div className="h-px bg-amber-900/80 flex-grow"></div>
            </div>

            <p className="text-amber-200 mb-6 italic text-center">
              Describe your world in 1-2 sentences. Be as creative as you want!
            </p>

            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-red-900/20 rounded-md pointer-events-none"></div>
              <Textarea
                placeholder="Describe your world..."
                value={worldPrompt}
                onChange={(e) => setWorldPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                className="mb-2 bg-black/60 border-amber-900/50 text-amber-100 placeholder:text-amber-200/50 resize-none font-medieval"
                rows={3}
              />
              <p className="text-amber-200/70 text-xs italic">
                Example: "a post-apocalyptic desert ruled by talking cacti" or "a medieval fantasy kingdom where magic
                is powered by music"
              </p>
            </div>

            <Button
              onClick={handleStartGame}
              disabled={loading || !worldPrompt.trim()}
              className="w-full bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 text-amber-100 border border-amber-900/50 shadow-[0_0_10px_rgba(255,170,0,0.3)] font-medieval text-lg py-6"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Forging Your Realm...
                </>
              ) : (
                "Begin Your Epic Adventure"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-amber-400 font-medieval">Your Adventure</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-amber-200 border-amber-900/50 hover:bg-amber-900/30 font-medieval"
              >
                New Quest
              </Button>
            </div>

            <div className="flex-1 p-6 mb-4 bg-black/70 border-2 border-amber-900/80 rounded-lg shadow-[0_0_15px_rgba(255,170,0,0.3)] backdrop-blur-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 max-h-[60vh] scrollbar-fantasy">
                {messages.map(
                  (message, index) =>
                    message.role !== "system" && (
                      <div
                        key={index}
                        className={`mb-6 ${
                          message.role === "assistant" ? "text-amber-100" : "text-emerald-400 font-medium"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-amber prose-invert max-w-none">
                            {message.content.split("\n").map((paragraph, i) => (
                              <p key={i} className="font-medieval">
                                {paragraph}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="pl-3 border-l-2 border-emerald-500 font-medieval">{message.content}</div>
                        )}
                      </div>
                    ),
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-900/20 to-red-900/20 rounded-md pointer-events-none"></div>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="What do you do?"
                    value={playerInput}
                    onChange={(e) => setPlayerInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-black/60 border-amber-900/50 text-amber-100 placeholder:text-amber-200/50 font-medieval resize-none"
                    disabled={loading}
                    rows={2}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !playerInput.trim()}
                    className="self-end bg-gradient-to-r from-amber-700 to-red-800 hover:from-amber-600 hover:to-red-700 text-amber-100 border border-amber-900/50"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <footer className="text-center text-amber-400/60 text-sm mt-2 font-medieval">
          <p>Solo Text RPG — Worldbuilder Edition</p>
        </footer>
      </div>
    </main>
  )
}
