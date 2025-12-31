import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import Link from 'next/link'
import { Plus, MessageSquare } from "lucide-react"
import SidebarConversationList from './SidebarConversationList'

export default async function Sidebar() {
  const user = await getCurrentUser()
  if (!user) return null

  const conversations = await prisma.conversation.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 20
  })

  return (
    <div className="w-64 bg-gray-900 h-full flex flex-col text-white">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3 mb-6">
           {/* Spur Logo Placeholder */}
           <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold">S</div>
           <span className="font-semibold text-lg">Spur AI</span>
        </div>
        
        <Link 
            href={`/?ts=${Date.now().toString()}`}
            className="flex items-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-md transition-colors text-sm font-medium"
        >
            <Plus className="w-4 h-4" />
            New Chat
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
         <SidebarConversationList initialConversations={conversations} /> 
      </div>
      
      <div className="p-4 border-t border-gray-800">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center text-xs font-bold">
                 {user.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
         </div>
         {/* Logout would be a client component or form action, keeping simple for now */}
         <form action="/api/auth/logout" method="POST" className="mt-2">
             <button type="submit" className="text-xs text-gray-500 hover:text-white">Sign out</button>
         </form>
      </div>
    </div>
  )
}
