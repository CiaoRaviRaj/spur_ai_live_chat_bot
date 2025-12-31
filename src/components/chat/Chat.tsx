'use client'

import { useChat, fetchServerSentEvents } from "@tanstack/ai-react"
import { useQueryClient } from "@tanstack/react-query"
import { Send, User as UserIcon, Bot, Loader2 } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"

interface ChatProps {
  conversationId?: string
  initialMessages?: any[]
}

export default function Chat({ conversationId, initialMessages = [] }: ChatProps) {
  const [activeConversationId, setActiveConversationId] = useState(conversationId)
  const searchParams = useSearchParams()
  const ts = searchParams.get("ts")
   const historyRetchNeededRef = useRef(false);
   const activeConversationIdRef = useRef(activeConversationId);


  useEffect(() => {
    setActiveConversationId(conversationId || crypto.randomUUID())
    if(conversationId) {
      historyRetchNeededRef.current = false;
    } else {
      historyRetchNeededRef.current = true;
    }
  },[conversationId, ts])
  
 
  useEffect(() => {
    activeConversationIdRef.current = activeConversationId;
  }, [activeConversationId]);

  const queryClient = useQueryClient()
  const { messages, sendMessage, isLoading, error } = useChat({
    
    connection: fetchServerSentEvents("/api/ai/chat", () => ({
       body: conversationId ? { conversationId: conversationId } : {
        createConversationId: activeConversationIdRef.current
      }
    })),
    initialMessages,
  
    onFinish : async (chunk) => {
      // console.log("onFinish", chunk);
      //// store final ai response to db
      if (activeConversationIdRef.current && chunk) {
         try {
            const firstPart = chunk?.parts?.[0]
            const content = (firstPart as any)?.content || (firstPart as any)?.text || ""

            if(content) {

              await fetch("/api/ai/chat/save", {
                  method: "POST",
                  headers: {
                      "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                      conversationId: activeConversationIdRef.current,
                      content: content,
                      role: "assistant"
                  })
              })
            }
            // Invalidate conversations to update sidebar

          } catch (e) {
            console.error("Failed to save message", e)
          }
          if(!historyRetchNeededRef.current) {
            queryClient.invalidateQueries({ queryKey: ['conversations'] })
          }
      }
    }
  })
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages?.length, isLoading])

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
             <Bot className="w-12 h-12 mb-4 text-indigo-200" />
             <p>How can I help you regarding our store policies today?</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.role !== 'user' && (
                  <div className="mr-2 mt-1">
                      <Bot className="w-4 h-4" />
                  </div>
              )}
              <div className="flex-1">
                 {/* 
                   In TanStack AI, 'message.content' might be a string or parts.
                   If using the latest SDK as per docs, we look at 'parts' or text.
                   The docs example map message.parts. 
                  */}
                 {message.parts && message.parts.map((part, i) => {
                        if (part.type === 'text') {
                          return <span key={i}>{(part as any).content || (part as any).text || ''}</span>
                        }
                       return null
                 })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
            <div className="flex justify-start">
                 <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span className="text-xs text-gray-400">Thinking...</span>
                 </div>
            </div>
        )}
        {error && (
             <div className="p-4 rounded-md bg-red-50 text-red-500 text-sm">
                 An error occurred. Please try again.
             </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            const form = e.target as HTMLFormElement
            const input = form.elements.namedItem('message') as HTMLInputElement
            if (input.value.trim()) {
              sendMessage(input.value)
              input.value = ''
            }
          }}
          className="flex gap-2"
        >
          <input
            name="message"
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-full bg-indigo-600 p-2 text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  )
}
