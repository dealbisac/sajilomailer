'use client'

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings } from "lucide-react";
import SettingsForm from "./SettingsForm"; // Reuse your existing form!

export function SettingsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>SMTP Configuration</DialogTitle>
          <DialogDescription>
            Update your email server details here. These are encrypted safely.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
           {/* We reuse the form you already built, just wrapped nicely */}
           <SettingsForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}