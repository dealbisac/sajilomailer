'use client'

import { useState } from "react";
import Papa from "papaparse";
import { sendBulkEmails } from "@/app/actions";

export default function EmailEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recipients, setRecipients] = useState<any[]>([]);
  const [variables, setVariables] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState("");

  // 1. Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      // Add this line to handle "Email", "EMAIL", " email " automatically
      transformHeader: (header) => header.toLowerCase().trim().replace(/[\ufeff]/g, ''), 
      
      complete: (results) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = results.data as any[];
        
        // Debugging: Log what we actually found
        console.log("Parsed CSV Data:", data);

        if (data.length === 0) {
          alert("CSV is empty!");
          return;
        }

        // distinct check for 'email' column
        const firstRow = data[0];
        if (!("email" in firstRow)) {
          alert(`Error: Could not find an 'email' column.\nFound headers: ${Object.keys(firstRow).join(", ")}`);
          return;
        }

        setRecipients(data);
        setVariables(Object.keys(firstRow));
      },
    });
  };

  // 2. Handle Send Click
  const handleSend = async () => {
    if (recipients.length === 0) return alert("Please upload a CSV first!");
    if (!recipients[0].email) return alert("CSV must have an 'email' column!");
    
    setIsSending(true);
    setStatus("Sending...");

    try {
      const result = await sendBulkEmails(recipients, subject, body);
      setStatus(`Done! Sent: ${result.sent}, Failed: ${result.failed}`);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setStatus("Error sending emails. Check your SMTP settings.");
    }
    
    setIsSending(false);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md w-full">
      <h2 className="text-xl font-bold mb-4">Compose Campaign</h2>

      {/* Step 1: Upload CSV */}
      <div className="mb-6 p-4 border-2 border-dashed rounded-lg bg-gray-50">
        <label className="block text-sm font-medium mb-2">1. Upload Recipient List (CSV)</label>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"/>
        
        {recipients.length > 0 && (
          <p className="text-sm text-green-600 mt-2">
            Loaded {recipients.length} recipients.
          </p>
        )}
      </div>

      {/* Step 2: Detected Variables */}
      {variables.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Detected Variables (Click to copy):</p>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <span 
                key={v} 
                className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded cursor-pointer hover:bg-blue-200"
                onClick={() => {
                    navigator.clipboard.writeText(`%${v}%`);
                    alert(`Copied %${v}% to clipboard!`);
                }}
              >
                %{v}%
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Subject & Body */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Subject Line</label>
          <input 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Hello %name%!" 
            className="w-full border p-2 rounded" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email Body (HTML supported)</label>
          <textarea 
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="<p>Dear %name%,</p><p>You are invited...</p>" 
            className="w-full border p-2 rounded h-40 font-mono text-sm"
          />
        </div>

        <button 
          onClick={handleSend} 
          disabled={isSending}
          className={`w-full text-white p-3 rounded font-bold ${isSending ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
        >
          {isSending ? "Sending..." : "Send Campaign 🚀"}
        </button>

        {status && <p className="text-center font-bold mt-4">{status}</p>}
      </div>
    </div>
  );
}