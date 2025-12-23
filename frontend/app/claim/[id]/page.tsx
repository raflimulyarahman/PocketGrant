'use client'

import { use } from 'react'
import { ClaimCard } from '@/components/claim-card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ClaimPageProps {
  params: Promise<{ id: string }>
}

export default function ClaimPage({ params }: ClaimPageProps) {
  const { id } = use(params)
  const programId = BigInt(id || '1')

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </Link>
      </header>

      {/* Main content - centered claim card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <ClaimCard programId={programId} />
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-400 text-xs">
        Powered by PocketGrant on Base
      </footer>
    </div>
  )
}
