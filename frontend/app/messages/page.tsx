'use client'

import { Footer } from '@/components/footer'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Search, Info } from 'lucide-react'
import { messageAPI, userAPI } from '@/lib/api'
import { useSocket } from '@/hooks/useSocket'
import { AIMessageComposer } from '@/components/ai-message-composer'

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Get current user ID from localStorage
  const userId = typeof window !== 'undefined' ? localStorage.getItem('neighbornet_user_id') : null

  // Initialize Socket.io
  const { socket, isConnected, sendMessage: socketSendMessage, on, off } = useSocket(userId || undefined)

  // Load conversations on mount
  useEffect(() => {
    async function loadConversations() {
      if (!userId) {
        setLoading(false)
        return
      }

      try {
        const response = await messageAPI.getConversations(userId)
        setConversations(response.data || [])
        
        // Check if we should auto-select a conversation from URL parameter
        const targetUserId = searchParams.get('userId')
        if (targetUserId && response.data) {
          // Find existing conversation with this user
          const existingConvo = response.data.find((convo: any) => 
            convo.participants.some((p: any) => p._id === targetUserId)
          )
          
          if (existingConvo) {
            setSelectedConversation(existingConvo)
          } else {
            // Create new conversation by fetching the user and setting up a pseudo-conversation
            try {
              const userResponse = await userAPI.getUser(targetUserId)
              const targetUser = userResponse.data
              
              // Create a temporary conversation object
              const newConvo = {
                _id: `temp-${targetUserId}`,
                participants: [targetUser],
                lastMessage: null,
                unreadCount: {}
              }
              setSelectedConversation(newConvo)
            } catch (err) {
              console.error('Error loading target user:', err)
            }
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    loadConversations()
  }, [userId, searchParams])

  // Load messages when conversation is selected
  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) return

      try {
        const response = await messageAPI.getMessages(selectedConversation._id)
        setMessages(response.data || [])
        
        // Mark as read
        if (userId) {
          await messageAPI.markAsRead(selectedConversation._id, userId)
        }
      } catch (err) {
        console.error('Error loading messages:', err)
      }
    }

    loadMessages()
  }, [selectedConversation, userId])

  // Listen for new messages via Socket.io
  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data: any) => {
      const message = data.data
      
      // Add message to list if it's for current conversation
      if (selectedConversation && message.conversation === selectedConversation._id) {
        setMessages(prev => [...prev, message])
        
        // Mark as read immediately
        if (userId) {
          messageAPI.markAsRead(selectedConversation._id, userId)
        }
      }

      // Update conversations list
      setConversations(prev => {
        const updated = [...prev]
        const convIndex = updated.findIndex(c => c._id === message.conversation)
        if (convIndex >= 0) {
          updated[convIndex].lastMessage = message
          updated[convIndex].lastMessageAt = message.createdAt
        }
        return updated
      })
    }

    on('new_message', handleNewMessage)
    on('message_sent', (data: any) => {
      if (data.success && selectedConversation) {
        setMessages(prev => [...prev, data.data])
      }
    })

    return () => {
      off('new_message', handleNewMessage)
      off('message_sent')
    }
  }, [socket, selectedConversation, userId, on, off])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format timestamp
  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-bold">Create a Profile First</h2>
            <p className="text-muted-foreground">You need to create a profile to start messaging neighbors.</p>
            <a href="/profile" className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              Create Profile
            </a>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 overflow-hidden">
        <div className="flex h-[calc(100vh-4rem)]">
          {/* Conversations List */}
          <div className="w-80 border-r border-border bg-card/50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-border space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground">Messages</h1>
                {isConnected && (
                  <span className="flex items-center gap-2 text-xs text-green-500">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Live
                  </span>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 rounded-full bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto space-y-1 p-2">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-10 px-4">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">No conversations yet</p>
                  <p className="text-xs text-muted-foreground mt-2">Start chatting with neighbors from the Discover page</p>
                </div>
              ) : (
                conversations.map((conversation: any) => {
                  const otherUser = conversation.participants.find((p: any) => p._id !== userId)
                  const unreadCount = conversation.unreadCount?.[userId] || 0
                  
                  return (
                    <motion.button
                      key={conversation._id}
                      onClick={() => setSelectedConversation(conversation)}
                      whileHover={{ x: 4 }}
                      className={`w-full p-3 rounded-xl text-left transition-all duration-200 ${
                        selectedConversation?._id === conversation._id
                          ? 'bg-primary/10 border-2 border-primary/30'
                          : 'bg-card hover:bg-accent/50 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                            {otherUser?.name?.[0] || '?'}
                          </div>
                          {otherUser?.isOnline && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-foreground truncate">
                              {otherUser?.name || 'Unknown User'}
                            </p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">
                              {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content || 'No messages yet'}
                            </p>
                            {unreadCount > 0 && (
                              <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  )
                })
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 flex flex-col bg-background">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const otherUser = selectedConversation.participants.find((p: any) => p._id !== userId)
                      return (
                        <>
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                              {otherUser?.name?.[0] || '?'}
                            </div>
                            {otherUser?.isOnline && (
                              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{otherUser?.name || 'Unknown User'}</p>
                            <p className="text-xs text-muted-foreground">
                              {otherUser?.isOnline ? 'Online' : 'Offline'}
                            </p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                  <button className="p-2 hover:bg-accent rounded-lg transition-colors">
                    <Info className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message: any, index) => {
                    const isOwn = message.sender._id === userId || message.sender === userId
                    const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id

                    return (
                      <motion.div
                        key={message._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {showAvatar ? (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {isOwn ? 'You'[0] : (message.sender?.name?.[0] || '?')}
                          </div>
                        ) : (
                          <div className="w-8" />
                        )}
                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                : 'bg-accent text-accent-foreground rounded-tl-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 px-1">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input with AI */}
                <div className="p-4 border-t border-border bg-card/50">
                  <AIMessageComposer
                    currentUserId={userId}
                    targetUserId={selectedConversation.participants.find((p: any) => p._id !== userId)?._id || selectedConversation.participants[0]?._id}
                    targetUserName={selectedConversation.participants.find((p: any) => p._id !== userId)?.name || selectedConversation.participants[0]?.name}
                    onSend={async (message) => {
                      setSendingMessage(true)
                      try {
                        const otherUser = selectedConversation.participants.find((p: any) => p._id !== userId) || 
                                          selectedConversation.participants[0]
                        
                        if (!otherUser) return

                        const response = await messageAPI.sendMessage({
                          senderId: userId,
                          receiverId: otherUser._id,
                          content: message
                        })
                        
                        setMessages(prev => [...prev, response.data])
                        
                        if (isConnected && socket) {
                          socketSendMessage({
                            senderId: userId,
                            receiverId: otherUser._id,
                            content: message,
                            conversationId: response.data.conversation
                          })
                        }
                      } catch (err) {
                        console.error('Error sending message:', err)
                        alert('Failed to send message. Please try again.')
                      } finally {
                        setSendingMessage(false)
                      }
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center p-8">
                <div className="space-y-3">
                  <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
