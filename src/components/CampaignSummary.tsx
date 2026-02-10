'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, Download, RotateCcw } from "lucide-react";
import Papa from "papaparse";

interface SummaryProps {
  total: number;
  success: number;
  failed: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logs: any[];
  onReset: () => void;
}

export default function CampaignSummary({ total, success, failed, logs, onReset }: SummaryProps) {
  
  const downloadReport = () => {
    const csv = Papa.unparse(logs);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `campaign_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-300">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Campaign Complete! 🎉</h2>
        <p className="text-gray-500">Here is how your email blast performed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recipients</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
          </CardContent>
        </Card>

        {/* Success Card */}
        <Card className="border-green-100 bg-green-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{success}</div>
            <p className="text-xs text-green-600">
              {((success / total) * 100).toFixed(1)}% Success Rate
            </p>
          </CardContent>
        </Card>

        {/* Failed Card */}
        <Card className={failed > 0 ? "border-red-100 bg-red-50/50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${failed > 0 ? "text-red-700" : ""}`}>Failed</CardTitle>
            <XCircle className={`h-4 w-4 ${failed > 0 ? "text-red-600" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${failed > 0 ? "text-red-700" : ""}`}>{failed}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button onClick={downloadReport} className="flex-1" variant="outline">
          <Download className="mr-2 h-4 w-4" /> Download Detailed Report
        </Button>
        <Button onClick={onReset} className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" /> Start New Campaign
        </Button>
      </div>
    </div>
  );
}