'use client'

import { saveSettings } from "@/app/actions";
import { useState } from "react";

export default function SettingsForm() {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    setStatus("Saving...");
    await saveSettings(formData);
    setStatus("Settings Saved! ✅");
  }

  return (
    <form action={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-4">SMTP Configuration</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">SMTP Host</label>
          <input name="host" placeholder="smtp.gmail.com" required className="w-full border p-2 rounded" />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Port</label>
            <input name="port" type="number" placeholder="587" required className="w-full border p-2 rounded" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username / Email</label>
          <input name="user" type="email" required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password / App Key</label>
          <input name="pass" type="password" required className="w-full border p-2 rounded" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From Email</label>
          <input name="from" type="email" placeholder="me@example.com" required className="w-full border p-2 rounded" />
        </div>

        <button type="submit" className="w-full bg-black text-white p-2 rounded hover:bg-gray-800">
          Save Settings
        </button>

        {status && <p className="text-center text-sm mt-2 text-green-600">{status}</p>}
      </div>
    </form>
  );
}