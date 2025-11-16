import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { VideoTile } from "components/VideoTile"; 
import brain from "brain";
import type { VideoEntry } from "types";
import { ArrowLeft } from "lucide-react"; // For back button

export default function VideoLibraryPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoadingVideos(true);
      try {
        const response = await brain.proxy_get_videos(); // Using proxy
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
        } else {
          console.error("Failed to fetch videos:", response.status, await response.text());
          setVideos([]);
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        setVideos([]);
      }
      setIsLoadingVideos(false);
    };

    fetchVideos();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/")} className="group">
          <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Button>
        <h1 className="text-3xl md:text-4xl font-bold text-center flex-grow">My Video Library</h1>
         {/* Optional: Add a spacer or right-align an element if needed */}
         <div style={{ width: "150px" }}></div> {/* Placeholder to help center title if Back button width is dynamic */}
      </header>
      
      <main>
        {isLoadingVideos ? (
          <p className="text-muted-foreground text-center">Loading videos...</p>
        ) : videos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videos.map((video, index) => (
              // Assuming video object has a unique 'id' property for the key
              // If not, and 'link' is unique, that could be an alternative. Index is a fallback.
              <VideoTile key={video.id || index} video={video} /> 
            ))}
          </div>
        ) : (
          <div className="bg-card p-8 rounded-lg shadow-lg h-60 flex flex-col items-center justify-center text-muted-foreground">
            <h2 className="text-2xl font-semibold mb-4">Your Video Library is Empty</h2>
            <p className="mb-6 text-center">Add some videos from the home page to see them here.</p>
            <Button onClick={() => navigate("/")}>Add Videos</Button>
          </div>
        )}
      </main>
    </div>
  );
}
