'use client'

import { useState } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import AIChat from '@/components/chat/AIChat'
import Button from '@/components/common/Button'
import Badge from '@/components/common/Badge'
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<'ai' | 'team'>('ai')

  const tabs = [
    {
      id: 'ai' as const,
      name: 'AI Assistant',
      icon: SparklesIcon,
      description: 'Chat med AI om bugs, features og viden',
      badge: 'Smart'
    },
    {
      id: 'team' as const,
      name: 'Team Chat',
      icon: UserGroupIcon,
      description: 'Chat med dine team medlemmer',
      badge: 'Kommer snart'
    }
  ]

  return (
    <AppLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chat</h1>
            <p className="mt-1 text-sm text-gray-500">
              Kommuniker med AI assistenten eller dit team
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
                <Badge
                  variant={tab.id === 'ai' ? 'success' : 'warning'}
                  size="sm"
                >
                  {tab.badge}
                </Badge>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'ai' ? (
            <AIChat className="h-full" />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Team Chat kommer snart
                </h3>
                <p className="text-gray-500 mb-6">
                  Vi arbejder på at implementere team chat funktionalitet.
                </p>
                <Button
                  onClick={() => setActiveTab('ai')}
                  variant="primary"
                  icon={<SparklesIcon className="h-5 w-5" />}
                >
                  Prøv AI Assistant
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )

