import React, { useState } from 'react'
import { SendIcon, BotIcon, UserIcon } from 'lucide-react'
interface Message {
    type: 'user' | 'ai'
    content: string
}
export const ChatInterface = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            type: 'ai',
            content:
                "Hello! I’m here to help you assess a customer's financial profile based on their bank statement. You can ask questions related to their financial data."
        },
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return
        const userMessage = {
            type: 'user' as const,
            content: input,
        }

        const question = input;
        setMessages((prev) => [...prev, userMessage])
        setInput('')
        setIsLoading(true)
        try {
            const response = await fetch('http://localhost:8000/ask-question-in-thread', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question }),
            })

            if (!response.ok) {
                throw new Error('Failed to fetch response')
            }

            const data = await response.json()

            setMessages((prev) => [
                ...prev,
                {
                    type: 'ai',
                    content: data.answer,
                },
            ])
        } catch (error) {
            console.error('Error:', error)
            setMessages((prev) => [
                ...prev,
                {
                    type: 'ai',
                    content: 'Sorry, something went wrong while processing your request.',
                },
            ])
        } finally {
            setIsLoading(false)
        }
    }
    return (
        <div className="w-full bg-white rounded-xl shadow-sm p-5 mt-6">
            <div className="flex items-center gap-3 mb-6">
                <BotIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-800">
                    Financial Assistant
                </h2>
            </div>
            <div className="space-y-4 mb-4 max-h-[400px] overflow-y-auto">
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        {message.type === 'ai' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                <BotIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                        )}
                        <div
                            className={`rounded-lg p-3 max-w-[80%] ${message.type === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}
                        >
                            {message.content}
                        </div>
                        {message.type === 'user' && (
                            <div className="flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-white" />
                            </div>
                        )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                            <BotIcon className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="bg-gray-100 rounded-lg p-3">
                            <div className="flex gap-1">
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: '0ms',
                                    }}
                                />
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: '150ms',
                                    }}
                                />
                                <div
                                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                    style={{
                                        animationDelay: '300ms',
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask a question about their finances..."
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="bg-indigo-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon className="h-4 w-4" />
                    Send
                </button>
            </form>
        </div>
    )
}
