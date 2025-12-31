
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const user = await getCurrentUser()
  
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 20
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
