'use client'

import { HamburgerMenu } from '@/components/hamburger-menu'
import { WalletButton } from '@/components/wallet-button'
import { UnderConstruction } from '@/components/under-construction'

export default function GiftConstructionPage() {
  return (
    <div className="min-h-screen bg-background">
      <HamburgerMenu />
      
      <header className="fixed top-0 right-0 z-50 p-4 flex items-center gap-3">
        <WalletButton />
      </header>

      <main className="min-h-screen flex items-center justify-center px-4">
        <UnderConstruction
          title="Gift Card"
          description="Fitur Gift Card sedang dalam pengembangan. Kamu akan bisa klaim hadiah menggunakan kode rahasia. Nantikan update selanjutnya!"
        />
      </main>
    </div>
  )
}
