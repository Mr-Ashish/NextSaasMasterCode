'use client';

import React, { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // Import a highlight.js CSS style
import beautifyHtml from './utils';
import { Button } from '@/components/ui/button'; // Assuming you are using Shadcn button component
import { Copy } from 'lucide-react'; // Icon for the copy button

const HtmlCodePreviewer = ({ transformedHtml }: { transformedHtml: any }) => {
  const [isCopied, setIsCopied] = useState(false); // State for copy feedback

  useEffect(() => {
    // Apply syntax highlighting to the transformed HTML code
    hljs.highlightAll();
  }, [transformedHtml]);

  const beautifiedHtml = beautifyHtml(transformedHtml);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(beautifiedHtml); // Copy to clipboard
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset copy state after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="rounded-md p-4">
      {' '}
      {/* Wrapper for spacing and clean look */}
      {/* Copy Button */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm">Code View</span>
        <Button
          onClick={handleCopy}
          variant="outline"
          className="flex items-center space-x-1"
        >
          <Copy className="h-4 w-4" /> {/* Copy icon */}
          <span>{isCopied ? 'Copied!' : 'Copy'}</span>{' '}
          {/* Show 'Copied!' when copied */}
        </Button>
      </div>
      <div className="max-h-64 overflow-y-auto rounded-md bg-black p-4">
        {' '}
        {/* Fixed height and scrollable */}
        <pre className="whitespace-pre-wrap text-xs">
          {' '}
          {/* Code block */}
          <code className="bg-black text-white">
            {' '}
            {/* Black background and white text for the <code> tag */}
            {beautifiedHtml}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default HtmlCodePreviewer;
