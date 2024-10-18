import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const CreateTemplateDialog = ({ handleCreateTemplate }) => {
  const [name, setName] = useState<String>('');
  const [description, setDescription] = useState<String>('');
  const handleCreate = () => {
    handleCreateTemplate(name, description);
  };
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Create Template</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-lg font-semibold">
          Create New Template
        </DialogTitle>
        <DialogDescription className="text-sm text-gray-500">
          Please provide a name and description for your new template.
        </DialogDescription>
        <div className="mt-4">
          <Input
            placeholder="Template Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mb-4"
          />
          <Input
            placeholder="Template Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mb-4"
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <div className="flex justify-end space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTemplateDialog;
