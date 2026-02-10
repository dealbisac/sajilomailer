import Header from '@/components/Header'
import EmailEditor from '@/components/EmailEditor'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Header contains the User Profile & SMTP Settings Button */}
      <Header />

      <div className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-10">
        
        {/* --- LOGGED OUT STATE --- */}
        <SignedOut>
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl">
                Personalized Bulk Emails,<br className="hidden md:block"/> Made Simple.
              </h1>
              <p className="mx-auto max-w-150 text-gray-500 md:text-xl">
                 Bring your own SMTP. Upload CSV. Send with confidence.
                 <br />Zero data storage on our servers.
              </p>
            </div>
            
            <SignInButton mode="modal">
              <button className="bg-black text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">
                Get Started
              </button>
            </SignInButton>
          </div>
        </SignedOut>

        {/* --- LOGGED IN STATE --- */}
        <SignedIn>
          <div className="w-full flex flex-col items-center pt-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* The Editor is now the main hero element */}
            <EmailEditor />
            
            <p className="text-xs text-gray-400 mt-4">
              Tip: Configure your SMTP server using the Settings icon in the header.
            </p>
          </div>
        </SignedIn>

      </div>
    </main>
  )
}