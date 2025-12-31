'use client'

import { useQuery } from "@tanstack/react-query"
import Link from 'next/link'
import { MessageSquare } from "lucide-react"

interface SidebarConversationListProps {
  initialConversations?: any[]
}

export default function SidebarConversationList({ initialConversations = [] }: SidebarConversationListProps) {
  const { data: conversations } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await fetch('/api/conversations')
      if (!res.ok) throw new Error('Failed to fetch conversations')
      return res.json()
    },
    initialData: initialConversations,
  })

  return (
    <>
      <div className="text-xs font-semibold text-gray-500 px-2 mb-2 uppercase tracking-wider">Recent</div>
      <div className="space-y-1">
          {conversations.map((conv: any) => (
              <Link 
                key={conv.id} 
                href={`/c/${conv.id}`}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-800 text-sm text-gray-300 hover:text-white group"
              >
                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
                <span className="truncate">{conv.title || 'New Conversation'}</span>
              </Link>
          ))}
          {conversations.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-600 italic">No history yet</div>
          )}
      </div>
    </>
  )
}
