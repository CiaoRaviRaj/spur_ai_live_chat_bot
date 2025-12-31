import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
  }

  try {
    const { conversationId, content, role } = await request.json()

    if (!conversationId || !content || !role) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 })
    }

    // Verify conversation belongs to user
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    })

    if (!conversation || conversation.userId !== user.id) {
       return new Response(JSON.stringify({ error: "Conversation not found or access denied" }), { status: 404 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        role,
        content,
      },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error("Error saving message:", error)
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 })
  }
}
