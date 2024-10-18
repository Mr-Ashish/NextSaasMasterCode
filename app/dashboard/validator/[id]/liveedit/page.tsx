'use client';

import React, { useState, useEffect } from 'react';
import Editor from 'react-simple-code-editor';
import { usePathname, useRouter } from 'next/navigation';
import { highlight, languages } from 'prismjs'; // Syntax highlighting
import 'prismjs/themes/prism.css'; // Import PrismJS CSS for code highlighting
import 'prismjs/components/prism-markup'; // HTML syntax highlighting for PrismJS
import DOMPurify from 'dompurify'; // Import DOMPurify to sanitize the HTML
import { getTemplateByIdAction } from '@/app/lib/actions';
import { html as beautifyHtml } from 'js-beautify'; // Import js-beautify for formatting
import { Button } from '@/components/ui/button'; // Assuming you are using ShadCN or another button component

const LiveHtmlEditor: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter(); // Use Next.js router to navigate back
  const [htmlCode, setHtmlCode] = useState<string>(
    '<p>Edit your HTML here!</p>'
  ); // Default HTML code
  const [templateId, setTemplateId] = useState<string | null>(null);

  // Extract template ID from the URL
  useEffect(() => {
    const parts = pathname?.split('/');
    const id = parts?.[3] || null;
    setTemplateId(id);
  }, [pathname]);

  // Fetch and format the template content
  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const result = await getTemplateByIdAction(templateId); // Call the server-side action to get the template
          if (result.success && result.template && result.template.content) {
            // Format the fetched HTML content
            const formattedHtml = beautifyHtml(
              JSON.parse(result.template.content).transformedHtml,
              {
                indent_size: 2, // Set indentation size to 2 spaces
                wrap_line_length: 80, // Set max line width for wrapping
              }
            );
            setHtmlCode(formattedHtml);
          }
        } catch (error) {
          console.error('Failed to fetch template:', error);
        }
      }
    };

    fetchTemplate();
  }, [templateId]);

  // Format HTML code on every change
  const handleCodeChange = (newCode: string) => {
    const formattedHtml = beautifyHtml(newCode, {
      indent_size: 2, // Set indentation size to 2 spaces
      wrap_line_length: 80, // Set max line width for wrapping
    });
    setHtmlCode(formattedHtml);
  };

  // Sanitize the HTML before displaying the preview
  const sanitizedHtml = DOMPurify.sanitize(htmlCode, {
    ALLOWED_TAGS: [
      'a',
      'b',
      'i',
      'em',
      'strong',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'span',
      'div',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'img',
      'table',
      'tr',
      'td',
      'th',
      'tbody',
      'thead',
      'tfoot',
      'blockquote',
      'pre',
      'code',
    ],
    ALLOWED_ATTR: [
      'href',
      'src',
      'alt',
      'title',
      'width',
      'height',
      'align',
      'style',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'], // Forbid executable tags
    FORBID_ATTR: ['onclick', 'onerror', 'onload'], // Disallow event handlers
  });

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Back Button */}
      <div className="p-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          Go Back
        </Button>
      </div>

      {/* Main Editor and Preview Section */}
      <div className="flex h-full w-full">
        {/* Left Side - HTML Editor */}
        <div className="w-1/2 overflow-auto border-r p-4">
          <h2 className="mb-2 text-lg font-semibold">HTML Code Editor</h2>
          <div className="rounded-lg border p-2">
            <Editor
              value={htmlCode}
              onValueChange={handleCodeChange}
              highlight={(code) => highlight(code, languages.markup, 'html')} // PrismJS highlighting
              padding={10}
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '400px',
                overflow: 'auto',
              }}
            />
          </div>
        </div>

        {/* Right Side - Live Preview */}
        <div className="w-1/2 p-4">
          <h2 className="mb-2 text-lg font-semibold">Live HTML Preview</h2>
          <iframe
            sandbox="allow-same-origin allow-scripts"
            srcDoc={sanitizedHtml}
            style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
          ></iframe>
          {/* <div
            className="sticky top-4 rounded-lg border bg-gray-50 p-4"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }} // Inject sanitized HTML
            style={{ maxHeight: '90vh', overflowY: 'auto' }} // Ensure the preview area stays scrollable if needed
          /> */}
        </div>
      </div>
    </div>
  );
};

export default LiveHtmlEditor;
