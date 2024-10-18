'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button'; // ShadCN Button
import { Input } from '@/components/ui/input'; // ShadCN Input
import { Textarea } from '@/components/ui/textarea'; // ShadCN Textarea
import { Loader2, Upload } from 'lucide-react'; // Loader and Upload icon
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'; // ShadCN Dialog components

interface FileUploadProps {
  onUploadSuccess: (data: any) => void;
  isEditView?: boolean;
}

const FileUploadDialog: React.FC<FileUploadProps> = ({
  onUploadSuccess,
  isEditView,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [htmlCode, setHtmlCode] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFileUploadMode, setIsFileUploadMode] = useState(true);
  const [open, setOpen] = useState(false); // State to track dialog open/close

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;

    if (selectedFile) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExtension === 'html') {
        setFile(selectedFile);
        setErrorMessage(null);
        await handleUpload(selectedFile);
      } else {
        setFile(null);
        setErrorMessage('Only .html files are allowed.');
      }
    }
  };

  const handleUpload = async (file: File) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/validator-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHtmlSubmit = async () => {
    if (!htmlCode.trim().startsWith('<') || !htmlCode.trim().endsWith('>')) {
      setErrorMessage('Invalid HTML code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        '/api/validator-upload',
        { html: htmlCode },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      onUploadSuccess(response.data);
    } catch (error) {
      console.error('Error uploading HTML:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset all states
  const resetStates = () => {
    setFile(null);
    setHtmlCode('');
    setErrorMessage(null);
    setIsFileUploadMode(true);
    setIsLoading(false);
  };

  // Handle dialog open/close
  const handleDialogChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      resetStates(); // Reset states when dialog is closed
    }
  };

  return (
    <div>
      {/* Button to open the dialog */}
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button
            variant="default"
            size="lg"
            className="m-4 flex items-center justify-center space-x-2"
          >
            <Upload className="h-5 w-5" />
            <span>Open File Upload Dialog</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="mx-auto max-w-md">
          <DialogHeader>
            <DialogTitle>Upload HTML File or Paste HTML Code</DialogTitle>
          </DialogHeader>

          {/* File upload and paste HTML form */}
          <div className="flex flex-col items-center space-y-6">
            <div className="mb-4 flex w-full justify-around">
              <Button
                variant={isFileUploadMode ? 'default' : 'outline'}
                onClick={() => setIsFileUploadMode(true)}
                className="w-1/2"
              >
                Upload File
              </Button>
              <Button
                variant={!isFileUploadMode ? 'default' : 'outline'}
                onClick={() => setIsFileUploadMode(false)}
                className="w-1/2"
              >
                Paste HTML Code
              </Button>
            </div>

            {isFileUploadMode ? (
              <>
                <label className="w-full">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    {isEditView ? 'Edit File' : 'Choose File'}
                  </span>
                  <Input
                    type="file"
                    onChange={handleFileChange}
                    className="file-input cursor-pointer"
                    accept=".html"
                    disabled={isLoading}
                  />
                </label>
              </>
            ) : (
              <>
                <label className="w-full">
                  <span className="mb-2 block text-sm font-medium text-gray-700">
                    Paste HTML Code
                  </span>
                  <Textarea
                    value={htmlCode}
                    onChange={(e) => setHtmlCode(e.target.value)}
                    rows={6}
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </label>
                <Button
                  onClick={handleHtmlSubmit}
                  disabled={isLoading || !htmlCode.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Uploading...
                    </>
                  ) : (
                    'Submit HTML Code'
                  )}
                </Button>
              </>
            )}

            {isLoading && (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </div>
            )}

            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
          <DialogClose asChild>
            <Button variant="secondary" className="mt-4">
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FileUploadDialog;
