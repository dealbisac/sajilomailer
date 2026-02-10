'use client'

import { useState } from "react";
import Papa from "papaparse";
import { sendBulkEmails } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Download, Eye, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EmailEditor() {
  const [recipients, setRecipients] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  
  // Sending State
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<any[]>([]); // To store success/fail logs

  // 1. Robust CSV Parser
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.toLowerCase().trim().replace(/[\ufeff]/g, ''), 
      complete: (results) => {
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

  // 2. The "Chunked" Sender (Progress Bar Logic)
  const handleSend = async () => {
    if (!recipients.length) return toast.error("Upload CSV first");
    
    setIsSending(true);
    setProgress(0);
    setLogs([]);
    
    const BATCH_SIZE = 5; // Send 5 at a time to prevent timeout
    let tempLogs: any[] = [];

    try {
      for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
        const batch = recipients.slice(i, i + BATCH_SIZE);
        
        // Call Server Action for just this batch
        const result = await sendBulkEmails(batch, subject, body);
        
        // Accumulate logs (simulated for now based on result counts)
        // In a real app, you'd return detailed logs from the server
        const batchLogs = batch.map(r => ({
           email: r.email,
           status: 'Sent', // You can refine this based on server response
           time: new Date().toLocaleTimeString()
        }));
        tempLogs = [...tempLogs, ...batchLogs];
        setLogs(tempLogs);

        // Update Progress
        const currentProgress = Math.min(100, Math.round(((i + batch.length) / recipients.length) * 100));
        setProgress(currentProgress);
      }
      toast.success("All emails processed!");
    } catch (e) {
      toast.error("Campaign stopped due to error.");
    }

    setIsSending(false);
  };

  // 3. Download Analytics
  const downloadReport = () => {
    const csv = Papa.unparse(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "campaign_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  // Helper for Preview
  const previewHtml = recipients.length > 0 
    ? body.replace(/%(\w+)%/g, (_, k) => recipients[0][k] || "") 
    : "<p>Upload CSV to see preview...</p>";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">New Campaign</h2>
        {logs.length > 0 && (
           <Button variant="outline" onClick={downloadReport}>
             <Download className="mr-2 h-4 w-4" /> Download Report
           </Button>
        )}
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        {/* --- COMPOSE TAB --- */}
        <TabsContent value="compose" className="space-y-4">
          {/* File Upload */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
             <label className="text-sm font-medium">Recipients (CSV)</label>
             <input type="file" accept=".csv" onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"/>
          </div>

          <input 
            className="w-full border p-2 rounded" 
            placeholder="Subject Line" 
            value={subject} 
            onChange={e => setSubject(e.target.value)}
          />
          
          <textarea 
            className="w-full border p-2 rounded h-64 font-mono text-sm" 
            placeholder="<html><body>Hi %name%, ...</body></html>" 
            value={body} 
            onChange={e => setBody(e.target.value)}
          />

          {isSending ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                 <span>Sending... {progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          ) : (
             <Button onClick={handleSend} className="w-full" disabled={!recipients.length}>
               <Send className="mr-2 h-4 w-4" /> Send Campaign
             </Button>
          )}
        </TabsContent>

        {/* --- PREVIEW TAB --- */}
        <TabsContent value="preview">
          <div className="border rounded p-4 min-h-[300px] bg-gray-50">
             <div className="mb-2 text-sm text-gray-500 border-b pb-2">
               <strong>To:</strong> {recipients[0]?.email || "example@mail.com"} <br/>
               <strong>Subject:</strong> {subject.replace(/%(\w+)%/g, (_, k) => recipients[0]?.[k] || "")}
             </div>
             <div dangerouslySetInnerHTML={{ __html: previewHtml }} className="prose max-w-none" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}