import Header from "@/components/Header";
import SettingsForm from "@/components/SettingsForm";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto p-10 flex justify-center">
        <SignedOut>
          <div className="text-center mt-20">
            <h2 className="text-3xl font-bold mb-4">Welcome to Email Sender</h2>
            <p className="text-gray-600">Please sign in to configure your server.</p>
          </div>
        </SignedOut>

        <SignedIn>
          <div className="w-full flex gap-10 items-start">
            {/* Left Side: Settings */}
            <div className="w-1/3">
               <SettingsForm />
            </div>

            {/* Right Side: We will put the Email Editor here next */}
            <div className="w-2/3 bg-white p-6 rounded shadow-md h-96 flex items-center justify-center text-gray-400">
               Email Editor & CSV Upload (Coming Next)
            </div>
          </div>
        </SignedIn>
      </div>
    </main>
  );
}