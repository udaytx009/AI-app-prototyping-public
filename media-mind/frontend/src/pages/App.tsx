import React, { useState } from "react"; // Removed useEffect
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import { VideoInputDialog } from "components/VideoInputDialog";
// Removed VideoTile import as it's not directly used here anymore
import brain from "brain"; 
import type { VideoData } from "types"; // Removed VideoEntry import

export default function App() {
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  // Removed videos state and useEffect for fetching videos - this logic is now in VideoLibraryPage.tsx


  const handleAddVideoSubmit = async (name: string, link: string) => {
    console.log("New Video Submitted to App.tsx:", { name, link });
    try {
      const videoData: VideoData = { name, link };
      // The actual function name might be different (e.g., addVideoVideoCollection) 
      // based on OpenAPI generation. We'll assume 'add_video' for now from inspect_api output.
      // It's crucial to check the generated brain client if this fails.
      const response = await brain.proxy_add_video(videoData); // Using proxy // Call the backend API
      
      if (response.ok) {
        const result = await response.json();
        // Toast is already handled in VideoInputDialog upon successful validation and local submit
        // We might want to move toast to here based on API response later.
        console.log("API Response:", result);
        // Potentially refresh video list or give further user feedback here
      } else {
        // Handle API errors (e.g., display a toast notification)
        const errorResult = await response.text(); // or response.json() if error is structured
        console.error("API Error:", response.status, errorResult);
        // Re-enable toast in VideoInputDialog or add a new one here for API errors
        // toast.error(`Failed to add video: ${errorResult || response.statusText}`);
      }
    } catch (error) {
      console.error("Error submitting video to API:", error);
      // toast.error("An unexpected error occurred while adding the video.");
    }
  };

  // Removed handleScrollToLibrary function as it's no longer needed


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4 md:p-8">
      <nav className="w-full max-w-5xl mx-auto flex justify-between items-center py-4 mb-10">
        <h1 className="text-3xl font-bold">SocialReader</h1>
        <div className="space-x-4">
          {/* Placeholder for future navigation links */}
          {/* <a href="#" className="text-lg hover:text-primary">Features</a>
          <a href="#" className="text-lg hover:text-primary">Pricing</a>
          <a href="#" className="text-lg hover:text-primary">Login</a> */}
        </div>
      </nav>

      <main className="container mx-auto px-4 flex-grow flex flex-col items-center justify-center text-center">
        <section className="mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Unlock the Power of Your Video Content
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            SocialReader helps you collect, organize, and transform your social media videos into structured, readable text. Turn your video library into a knowledge base.
          </p>
          {/* Updated onClick to navigate to VideoLibraryPage */}
          <Button size="lg" className="group" onClick={() => navigate("/VideoLibraryPage")}>
            Enter Your Library
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          {/* Button to open the Add Video Dialog */}
          <Button variant="outline" size="lg" onClick={() => setIsVideoDialogOpen(true)} className="mt-4 md:mt-0 md:ml-4">
            Add New Video
          </Button>
        </section>

        {/* Video Input Dialog Component - rendered here but appears as a modal */}
        <VideoInputDialog
          open={isVideoDialogOpen}
          onOpenChange={setIsVideoDialogOpen}
          onSubmit={handleAddVideoSubmit}
        />

        {/* Video Collections section - Simplified for landing page. Grid is on VideoLibraryPage.tsx */}
        <section className="w-full max-w-4xl pt-10 pb-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-6 text-center">Your Video Collections, Reimagined</h3>
          <div className="bg-card p-8 rounded-lg shadow-lg flex flex-col items-center justify-center text-muted-foreground">
            <p className="text-center mb-4">
              Dive into your curated video library, or add new content to expand your collection.
            </p>
            {/* Buttons removed as per MYA-17 - they are duplicates of the main CTA buttons above */}
          </div>
        </section>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center py-8 mt-10">
        <p className="text-muted-foreground">&copy; 2025 SocialReader by ATX Tech</p>
      </footer>
    </div>
  );
}
