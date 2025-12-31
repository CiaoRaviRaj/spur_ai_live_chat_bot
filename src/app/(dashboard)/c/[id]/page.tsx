import Chat from '@/components/chat/Chat'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()
  
  if (!user) {
      redirect('/login')
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: { messages: { orderBy: { createdAt: 'asc' } } }
  })

  if (!conversation || conversation.userId !== user.id) {
    redirect('/')
  }

  console.log("conversation", conversation);
  

  return (
    <Chat 
      conversationId={conversation.id}
      initialMessages={conversation.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          parts: [
            {
              type: 'text',
              text: m.content
            }
          ]
      }))}
    />
  )
}
