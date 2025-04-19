"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

type Message = {
  role: "system" | "user" | "assistant"
  content: string
}

export async function generateStory(worldPrompt: string): Promise<string> {
  try {
    const systemPrompt = `You are the Game Master of a solo RPG. You create immersive, detailed, and engaging narratives based on the player's world description. Always end your responses with a question or prompt about what the player wants to do next.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `The player has described their world as: "${worldPrompt}". Begin an immersive story. Narrate the first scene vividly and ask "What do you do?" at the end. Keep your response under 400 words.`,
    })

    return text
  } catch (error) {
    console.error("Error generating story:", error)
    throw new Error("Failed to generate story. Please try again.")
  }
}

export async function continueStory(messages: Message[]): Promise<string> {
  try {
    // Extract just the conversation without system messages for the context
    const conversationHistory = messages
      .filter((msg) => msg.role !== "system")
      .map((msg) => `${msg.role === "user" ? "Player" : "Game Master"}: ${msg.content}`)
      .join("\n\n")

    // Get the world description from the system message
    const worldDescription = messages.find((msg) => msg.role === "system")?.content || ""

    const systemPrompt = `You are the Game Master of a solo RPG. The world is described as: ${worldDescription}
    
Rules:
1. Create immersive, detailed, and engaging narratives
2. Respond to the player's actions realistically within the world's context
3. Introduce challenges, NPCs, and plot developments to keep the story interesting
4. Always end your responses with a question or prompt about what the player wants to do next
5. Keep your responses under 400 words
6. Never break character or acknowledge that you are an AI`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: systemPrompt,
      prompt: `Here is the conversation history so far:\n\n${conversationHistory}\n\nContinue the story based on the player's last action. Be descriptive and engaging. End with a question about what they do next.`,
    })

    return text
  } catch (error) {
    console.error("Error continuing story:", error)
    throw new Error("Failed to continue the story. Please try again.")
  }
}
