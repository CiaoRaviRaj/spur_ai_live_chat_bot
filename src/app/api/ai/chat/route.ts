import { chat, toServerSentEventsStream, toStreamResponse } from "@tanstack/ai"
import { geminiText } from "@tanstack/ai-gemini"
import { GEMINI_MODEL, SYSTEM_PROMPT } from "@/lib/gemini"
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  // 1. Auth Check
  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const { messages, conversationId , createConversationId} = await request.json()

    
    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY is missing in environment variables")
        return new Response(JSON.stringify({ error: "Server Configuration Error: Missing API Key" }), { status: 500 })
    }

    // 2. Validate Input
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), { status: 400 })
    }

    // 3. Prepare Prompt (Inject System Prompt)
    // TanStack AI handles message history, but we prepend system prompt efficiently
    // Actually, usually we insert it as the first 'system' message if supported, 
    // or relying on the adapter. Gemini works well with system instruction.
    // For now, let's just make sure the model behavior is correct.
    // We can merge system prompt into messages or config if adapter supports 'system'.
    // @tanstack/ai-gemini geminiText might handle it via config, but simple approach:
    // Ensure the first message or context includes it.
    
    // 4. Persistence (User Message)
    // We should ideally create a conversation if it doesn't exist.
    let activeConversationId = conversationId
    if (!activeConversationId) {
      if(!createConversationId) {
        return new Response(JSON.stringify({ error: "Conversation ID required" }), { status: 400 })
      }
      const conv = await prisma.conversation.create({
        data: { userId: user.id, title: `New Chat ${Date.now()}`, id: createConversationId },
      })
      activeConversationId = conv.id
    }

    

    // Save the last user message to the DB
    const lastMessage = messages[messages.length - 1]
    if (lastMessage.role === 'user') {
       await prisma.message.create({
         data: {
           conversationId: activeConversationId,
           role: 'user',
           content: lastMessage.content
         }
       })
    }

    // 5. Stream Response
    const stream = chat({
      adapter: geminiText(GEMINI_MODEL),
      messages: [
         { role: 'system', content: SYSTEM_PROMPT },
        ...messages
      ],
      
    })

    // TODO: Persistence of AI response is tricky with pure streaming response return without a hook.
    // We will assume for this step getting the basic chat working is priority.
    // We can add a simple onFinish-like mechanic if TanStack AI exposes it or by tapping the stream.
    

    return toStreamResponse(stream)
  } catch (error) {
    console.error("AI Error:------------", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
