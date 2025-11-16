import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Added for Play button
import { PlayCircle, Loader2 } from "lucide-react"; // Added PlayCircle & Loader2 icons
import type { VideoEntry } from "types";
import { useState } from "react";
import brain from "brain";
import { toast } from "sonner";
import { ProcessedTextDialog } from "./ProcessedTextDialog"; // Corrected import path

interface Props {
  video: VideoEntry;
}

export function VideoTile({ video }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [processedText, setProcessedText] = useState<string | null>(null);
  const [textSource, setTextSource] = useState<string | null>(null);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);

  const handleProcessVideo = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setProcessedText(null); // Clear previous text
    setTextSource(null);

    try {
      console.log(`Processing video: ${video.name}, Link: ${video.link}`);
      const response = await brain.proxy_process_video({ video_link: video.link.toString() }); // Using proxy
      
      if (response.ok) {
        const responseData = await response.json(); // Correctly parse JSON data
        if (responseData) { // Check if responseData is not null/undefined
          const { structured_text, source, error_message } = responseData;
          if (error_message) { // Backend might return 200 but with an error message in payload
            console.error("API processed with an error:", error_message);
            toast.error(`Processing error for "${video.name}": ${error_message}`);
            // Optionally, still show the (potentially partial) text if available
            // setProcessedText(structured_text || "Partial content due to error."); 
            // setTextSource(source || "error");
            // setIsTextDialogOpen(true);
          } else {
            setProcessedText(structured_text);
            setTextSource(source);
            setIsTextDialogOpen(true);
            toast.success(`Successfully processed "${video.name}". Source: ${source}`);
          }
        } else {
          console.error("API Error: Response data is null or undefined after successful response.", response);
          toast.error(`Failed to process "${video.name}". Received empty data.`);
        }
      } else {
        let errorDetail = `HTTP error ${response.status}`;
        try {
          // Try to parse error message from the body if backend sends one
          const errorData = await response.json(); 
          if (errorData && errorData.error_message) {
            errorDetail = errorData.error_message;
          } else if (errorData && errorData.detail) { // FastAPI default error structure
            errorDetail = errorData.detail;
          } else {
            const rawText = await response.text(); // Fallback to raw text
            errorDetail = rawText || errorDetail; 
          }
        } catch (e) {
          console.warn("Could not parse error response JSON:", e);
          // Stick with the HTTP status if JSON parsing fails
          const rawText = await response.text(); 
          errorDetail = rawText || errorDetail; 
        }
        console.error("API Error - Response not OK:", response, "Detail:", errorDetail);
        toast.error(`Failed to process "${video.name}". ${errorDetail}`);
      }
    } catch (error: any) {
      console.error("Error processing video:", error);
      const message = error.message || "An unexpected error occurred.";
      toast.error(`Error processing "${video.name}": ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="bg-card text-card-foreground shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col justify-between">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="truncate text-lg" title={video.name}>{video.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center relative">
          <div className="aspect-video bg-muted rounded-md flex items-center justify-center w-full relative group">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute inset-0 m-auto h-16 w-16 text-primary opacity-70 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50"
              onClick={handleProcessVideo}
              disabled={isLoading}
              aria-label={`Play video ${video.name}`}
            >
              {isLoading ? (
                <Loader2 className="h-full w-full animate-spin" />
              ) : (
                <PlayCircle className="h-full w-full" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      {processedText !== null && (
        <ProcessedTextDialog 
          isOpen={isTextDialogOpen} 
          onOpenChange={setIsTextDialogOpen} 
          text={processedText} 
          source={textSource}
          videoTitle={video.name} 
        />
      )}
    </>
  );
}
