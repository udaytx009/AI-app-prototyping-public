import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose, // Added DialogClose for the cancel button
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Import sonner toast

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, link: string) => void;
}

export function VideoInputDialog({ open, onOpenChange, onSubmit }: Props) {
  const [videoName, setVideoName] = useState("");
  const [videoLink, setVideoLink] = useState("");

  const handleSubmit = () => {
    // Basic validation: ensure fields are not empty
    if (videoName.trim() === "" || videoLink.trim() === "") {
      toast.error("Please fill in both video name and video link.");
      return;
    }

    // URL Validation
    try {
      new URL(videoLink);
    } catch (_) {
      toast.error("Please enter a valid video link (URL).");
      return;
    }

    onSubmit(videoName, videoLink);
    toast.success(`Video "${videoName}" added successfully!`); // Toast notification
    setVideoName(""); // Reset fields
    setVideoName(""); // Reset fields
    setVideoLink("");
    onOpenChange(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Video</DialogTitle>
          <DialogDescription>
            Enter the name and link for your video below. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video-name" className="text-right">
              Name
            </Label>
            <Input
              id="video-name"
              value={videoName}
              onChange={(e) => setVideoName(e.target.value)}
              placeholder="My Awesome Video"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video-link" className="text-right">
              Link
            </Label>
            <Input
              id="video-link"
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="col-span-3"
              type="url" // Added type for basic URL validation by browser
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>Save Video</Button> 
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
