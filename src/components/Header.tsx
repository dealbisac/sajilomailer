import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { SettingsDialog } from "./SettingsDialog";

export default function Header() {
  return (
    <header className="flex justify-between items-center p-4 border-b">
      <h1 className="text-xl font-bold">Email Sender</h1>
      <SettingsDialog />
      
      <div>
        {/* Show this if the user is NOT logged in */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="bg-black text-white px-4 py-2 rounded text-sm">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>

        {/* Show this if the user IS logged in */}
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </header>
  );
}