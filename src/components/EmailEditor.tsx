'use client'

import { useState } from "react";
import Papa from "papaparse";
import { sendBulkEmails } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Send } from "lucide-react";
import TiptapEditor from "./TiptapEditor";
import CampaignSummary from "./CampaignSummary"; 

export default function EmailEditor() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recipients, setRecipients] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // States
  const [isSending, setIsSending] = useState(false);
  const [isComplete, setIsComplete] = useState(false); // state for showing summary
  const [progress, setProgress] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [logs, setLogs] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (Keep existing file upload logic same as before) ...
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().trim().replace(/[\ufeff]/g, ''), 
      complete: (results) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = results.data as any[];
        if (!data[0]?.email) {
          toast.error("CSV must have an 'email' column!");
          return;
        }
        setRecipients(data);
        toast.success(`Loaded ${data.length} recipients`);
      },
    });
  };

  const handleSend = async () => {
    if (!recipients.length) return toast.error("Upload CSV first");
    
    setIsSending(true);
    setIsComplete(false);
    setProgress(0);
    setLogs([]);
    
    const BATCH_SIZE = 5; 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allResults: any[] = [];

    try {
      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);
        
        // Use the new detailed server action
        const batchResults = await sendBulkEmails(batch, subject, body);
        
        allResults = [...allResults, batchResults]; // Assuming batchResults is an object, not an array
        setLogs(prev => [...prev, batchResults]);

        // Update Progress
        const currentProgress = Math.min(100, Math.round(((i + batch.length) / recipients.length) * 100));
        setProgress(currentProgress);
      }
      toast.success("Campaign finished!");
      setIsComplete(true); // Switch view
    } catch (e) {
      toast.error("Campaign stopped due to error.");
      console.error(e);
    }

    setIsSending(false);
  };

  const resetCampaign = () => {
    setIsComplete(false);
    setRecipients([]);
    setSubject("");
    setBody("");
    setLogs([]);
    setProgress(0);
  };

  // --- RENDER ---

  // 1. If Campaign is Complete, show Analytics
  if (isComplete) {
    const successCount = logs.filter(l => l.status === 'success').length;
    const failedCount = logs.filter(l => l.status === 'failed').length;
    
    return (
      <div className="max-w-4xl mx-auto">
        <CampaignSummary 
          total={logs.length}
          success={successCount}
          failed={failedCount}
          logs={logs}
          onReset={resetCampaign}
        />
      </div>
    );
  }

  // 2. Otherwise, show Editor
  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
      <h2 className="text-2xl font-bold mb-6">New Campaign</h2>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          {/* File Upload */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
             <label className="text-sm font-medium">Recipients (CSV)</label>
             <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"/>
          </div>

          <input 
            className="w-full border p-2 rounded" 
            placeholder="Subject Line" 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
          />
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Message Body</label>
            <TiptapEditor 
              value={body} 
              onChange={setBody} 
              variables={recipients.length > 0 ? Object.keys(recipients[0]) : []}
            />
          </div>

          {isSending ? (
            <div className="space-y-2 py-4">
              <div className="flex justify-between text-sm font-medium">
                 <span>Sending... {progress}%</span>
                 <span className="text-gray-500">Do not close this tab</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
            </div>
          ) : (
             <Button onClick={handleSend} className="w-full" disabled={!recipients.length || !subject}>
               <Send className="mr-2 h-4 w-4" /> Send Campaign
             </Button>
          )}
        </TabsContent>

        <TabsContent value="preview">
          <div className="border rounded p-4 min-h-75 bg-gray-50">
             <div className="mb-2 text-sm text-gray-500 border-b pb-2">
               <strong>To:</strong> {recipients[0]?.email || "example@mail.com"} <br/>
               <strong>Subject:</strong> {subject.replace(/%(\w+)%/g, (_, k) => recipients[0]?.[k] || "")}
             </div>
             {/* Simple preview that replaces variables for the first user */}
             <div 
               dangerouslySetInnerHTML={{ 
                 __html: recipients.length > 0 
                   ? body.replace(/%(\w+)%/g, (_, k) => recipients[0][k] || "") 
                   : "<p class='text-gray-400'>Upload a CSV to see a live preview of the first recipient.</p>" 
               }} 
               className="prose max-w-none" 
             />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}