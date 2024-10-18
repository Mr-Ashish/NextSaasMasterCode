'use client';

import FileUpload from '@/components/ui/Validator/FileUpload';
import PreviewComponent from '@/components/ui/Validator/PreviewComponent';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clipboard, Download, Lock } from 'lucide-react';

import { getTemplateByIdAction, updateTemplateAction } from '@/app/lib/actions';
import { useSubscription } from '@/app/lib/subscriptionContext';

// Import Tooltip components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ErrorDisplay from '@/components/ui/Validator/TemplateErrors';

export default function EmailValidator() {
  const [sanitizedData, setSanitizedData] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState<'original' | 'transformed'>(
    'original'
  );
  const pathname = usePathname();
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const subscription = useSubscription();

  // Extract the ID from the pathname
  useEffect(() => {
    const parts = pathname?.split('/');
    const id = parts?.[3] || null;
    setTemplateId(id);
  }, [pathname]);

  // Fetch the template data if templateId is present
  useEffect(() => {
    const fetchTemplate = async () => {
      if (templateId) {
        try {
          const result = await getTemplateByIdAction(templateId);
          if (result.success && result.template && result.template.content) {
            setSanitizedData(JSON.parse(result.template.content));
          }
        } catch (error) {
          console.error('Failed to fetch template:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleUpdateTemplate = useCallback(
    async (content: string) => {
      if (!templateId || !content) return;

      const result = await updateTemplateAction(templateId, content);
      if (!result.success) {
        console.error('Failed to update template:', result.error);
      }
    },
    [templateId]
  );

  useEffect(() => {
    if (!sanitizedData || !templateId) return;
    handleUpdateTemplate(JSON.stringify(sanitizedData));
  }, [sanitizedData, templateId, handleUpdateTemplate]);

  const handleFileUploadSuccess = (data: any) => {
    setSanitizedData(data);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
  };

  const handleLiveEdit = () => {
    router.push(`/dashboard/validator/${templateId}/liveedit`);
  };

  const hasSubscription = subscription?.length > 0;

  if (loading) {
    return <div>Loading...</div>;
  }

  // Function to handle when a subscription is required
  const handleSubscriptionRequired = () => {
    router.push('/dashboard'); // Redirect to pricing or subscription page
  };

  return (
    <div className="flex h-full w-full items-center justify-center">
      {!sanitizedData ? (
        // Show only FileUpload component in the center of the screen before the file is uploaded
        <div className="flex h-screen w-full flex-col items-center justify-center align-middle">
          <div className="text-xl font-semibold">
            Start by uploading your html template{' '}
          </div>
          <div className="flex w-full max-w-md justify-center">
            <FileUpload
              onUploadSuccess={handleFileUploadSuccess}
              isEditView={false}
            />
          </div>
        </div>
      ) : (
        // Show the sectional view once the file is uploaded
        <div className="flex h-full w-full flex-col space-y-4 md:flex-row md:space-y-0">
          {/* Left Section */}
          <div className="flex w-full flex-col space-y-6 border-r p-4 md:w-1/3">
            <Button
              onClick={() => router.push('/dashboard/validator')}
              variant="outline"
              className="mb-4 flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <h2 className="text-lg font-semibold">Preview Options</h2>

            {/* Preview Selection */}
            <div className="flex flex-col space-y-4">
              <Button
                variant={previewMode === 'original' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('original')}
                className="flex items-center justify-between"
              >
                Preview Original HTML
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant={previewMode === 'transformed' ? 'default' : 'outline'}
                onClick={() => setPreviewMode('transformed')}
                className="flex items-center justify-between"
              >
                Preview Transformed HTML
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full p-4 md:w-2/3">
            <h2 className="mb-4 text-lg font-semibold">
              {previewMode === 'original'
                ? 'Original HTML Preview'
                : 'Transformed HTML Preview'}
            </h2>

            {/* Preview Area */}
            <div className="rounded-lg border bg-gray-50 p-4">
              <PreviewComponent
                htmlContent={
                  previewMode === 'original'
                    ? sanitizedData?.sanitizedOriginal
                    : sanitizedData?.transformedHtml
                }
              />
            </div>

            {/* Action Buttons */}
            <TooltipProvider>
              <div className="mt-4 flex flex-wrap gap-4">
                {/* Copy Code Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (hasSubscription) {
                          handleCopyCode(
                            previewMode === 'original'
                              ? sanitizedData?.sanitizedOriginal
                              : sanitizedData?.transformedHtml
                          );
                        } else {
                          handleSubscriptionRequired();
                        }
                      }}
                      className="flex items-center"
                    >
                      <Clipboard className="mr-2 h-4 w-4" />
                      Copy Code
                      {!hasSubscription && <Lock className="ml-2 h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  {!hasSubscription && (
                    <TooltipContent>
                      <p>Subscribe to access this feature</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Download Minified Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (hasSubscription) {
                          handleDownloadFile(
                            'minified.html',
                            previewMode === 'original'
                              ? sanitizedData?.sanitizedOriginal
                              : sanitizedData?.transformedHtml
                          );
                        } else {
                          handleSubscriptionRequired();
                        }
                      }}
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Minified
                      {!hasSubscription && <Lock className="ml-2 h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  {!hasSubscription && (
                    <TooltipContent>
                      <p>Subscribe to access this feature</p>
                    </TooltipContent>
                  )}
                </Tooltip>

                {/* Download Original Button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (hasSubscription) {
                          handleDownloadFile(
                            'original.html',
                            previewMode === 'original'
                              ? sanitizedData?.sanitizedOriginal
                              : sanitizedData?.transformedHtml
                          );
                        } else {
                          handleSubscriptionRequired();
                        }
                      }}
                      className="flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Original
                      {!hasSubscription && <Lock className="ml-2 h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  {!hasSubscription && (
                    <TooltipContent>
                      <p>Subscribe to access this feature</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </div>
              {/* Warnings Section */}
              {previewMode === 'original' ? (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold">Warnings</h2>
                  <ErrorDisplay errors={sanitizedData.errors} />
                </div>
              ) : null}
            </TooltipProvider>

            {/* Live Edit Button for Transformed HTML */}
            {previewMode === 'transformed' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="mt-4 flex items-center"
                      variant="default"
                      onClick={() => {
                        if (hasSubscription) {
                          handleLiveEdit();
                        } else {
                          handleSubscriptionRequired();
                        }
                      }}
                    >
                      Live Edit Transformed HTML
                      {!hasSubscription && <Lock className="ml-2 h-4 w-4" />}
                    </Button>
                  </TooltipTrigger>
                  {!hasSubscription && (
                    <TooltipContent>
                      <p>Subscribe to access this feature</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            )}

            {/* Message about subscription */}
            {!hasSubscription && (
              <div className="mt-6 rounded-lg bg-yellow-100 p-4">
                <p className="text-yellow-800">
                  Some features are locked. Please{' '}
                  <span
                    className="cursor-pointer font-semibold text-yellow-900 underline"
                    onClick={handleSubscriptionRequired}
                  >
                    subscribe
                  </span>{' '}
                  to access all features.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
