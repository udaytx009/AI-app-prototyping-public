import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area"; // Replaced with plain div

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  text: string;
  source: string | null; // e.g., 'cache', 'processed', or null if not applicable
  videoTitle?: string;
}

export function ProcessedTextDialog({
  isOpen,
  onOpenChange,
  text,
  source,
  videoTitle,
}: Props) {
  const renderSimpleMarkdown = (markdownText: string) => {
    let htmlText = markdownText;

    // Escape HTML characters first to prevent XSS if any HTML is in the markdown
    htmlText = htmlText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Headings (###, ##, #)
    htmlText = htmlText.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    htmlText = htmlText.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    htmlText = htmlText.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold (**text** or __text__)
    htmlText = htmlText.replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>");
    htmlText = htmlText.replace(/__(.*?)__/gim, "<strong>$1</strong>");

    // Italic (*text* or _text_)
    htmlText = htmlText.replace(/\*(.*?)\*/gim, "<em>$1</em>");
    htmlText = htmlText.replace(/_(.*?)_/gim, "<em>$1</em>");
    
    // Links [text](url)
    htmlText = htmlText.replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank">$1</a>');

    // Paragraphs (convert newlines to <p> tags, very basic)
    // Split by double newlines, then wrap each part in <p>, then join
    // This is a simplification; real paragraph handling is more complex
    htmlText = htmlText
      .split(/\n\s*\n/)
      .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
      .join("");

    return htmlText;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] lg:max-w-[1000px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{videoTitle || "Processed Video Text"}</DialogTitle>
          {source && (
            <DialogDescription>
              Source: <span className="font-semibold">{source}</span>
            </DialogDescription>
          )}
        </DialogHeader>
        {/* Wrapper div to handle flex sizing */}
        <div className="flex-grow min-h-0 my-4 overflow-hidden">
          {/* Replaced ScrollArea with a plain div and manual overflow control */}
          <div className="h-full w-full rounded-md overflow-y-auto bg-background text-foreground">
            {/* Restoring prose classes as scrolling is abandoned for new tab approach */}
            <div className="prose dark:prose-invert max-w-none">
              <div className="p-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {text || "No text to display."}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              const newWindow = window.open();
              if (newWindow) {
                const newTabText = text || "No text to display.";
                const htmlDoc = `
                  <html>
                    <head>
                      <title>Full Text - ${videoTitle || "Processed Video"}</title>
                      <style>
                        body {
                          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                          line-height: 1.6;
                          padding: 20px;
                          margin: 0;
                          background-color: #fdfdfd; /* Light background */
                          color: #333; /* Dark text */
                        }
                        pre, div /* Apply to div now instead of pre */ {
                          white-space: normal; /* Allow normal wrapping */
                          word-wrap: break-word;
                          font-family: inherit;
                          font-size: 1rem;
                          margin: 0 auto;
                          max-width: 800px;
                          background-color: #fff;
                          padding: 20px;
                          border-radius: 8px;
                          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        }
                        h1, h2, h3, h4, h5, h6 {
                          margin-top: 1.5em;
                          margin-bottom: 0.5em;
                          line-height: 1.2;
                        }
                        p {
                          margin-bottom: 1em;
                        }
                        strong { font-weight: bold; }
                        em { font-style: italic; }
                        a { color: #007bff; text-decoration: none; }
                        a:hover { text-decoration: underline; }

                        @media (prefers-color-scheme: dark) {
                          body {
                            background-color: #1a1a1a;
                            color: #e0e0e0;
                          }
                          pre, div /* And here */ {
                            background-color: #2c2c2c;
                            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                          }
                          a { color: #6bbaff; }
                        }
                      </style>
                    </head>
                    <body>
                      <div>${renderSimpleMarkdown(newTabText)}</div>
                    </body>
                  </html>
                `;
                newWindow.document.write(htmlDoc);
                newWindow.document.close(); // Important for some browsers
              }
            }}
            className="mr-2"
          >
            Read Full Text
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
