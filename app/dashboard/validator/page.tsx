'use client';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useState, useEffect } from 'react';
import {
  createHtmlTemplateAction,
  getHtmlTemplates,
  deleteTemplateAction,
} from '@/app/lib/actions';
import { useSession } from 'next-auth/react';
import { Trash2, Pencil, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreateTemplateDialog from '@/components/ui/Validator/CreateTemplateDialog';
import { useRouter } from 'next/navigation';
import { useSubscription } from '@/app/lib/subscriptionContext';

const ValidatorDashboard = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const subscription = useSubscription();
  const [templates, setTemplates] = useState<EmailTemplateType[]>([]);
  const [message, setMessage] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchTemplates = async () => {
      const result = await getHtmlTemplates(session?.userId);
      if (result.success && result?.templates) {
        setTemplates(result?.templates);
      } else {
        setMessage('Failed to fetch templates.');
      }
    };

    fetchTemplates();
  }, [session?.userId]);

  const handleCreateTemplate = async (name: string, description: string) => {
    const result = await createHtmlTemplateAction(name, description);
    if (result.success && result.template) {
      router.push(`/dashboard/validator/${result.template.externalId}/edit`);
    } else {
      setMessage('Failed to create template.');
    }
  };

  const handleEditClick = (templateId: string) => {
    router.push(`/dashboard/validator/${templateId}/edit`);
  };

  const handleDeleteClick = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowConfirmDialog(true); // Show the confirmation dialog
  };

  const confirmDelete = async () => {
    if (selectedTemplateId) {
      const result = await deleteTemplateAction(selectedTemplateId);
      if (result.success) {
        setTemplates((prevTemplates) =>
          prevTemplates.filter(
            (template) => template.externalId !== selectedTemplateId
          )
        );
        setMessage('Template deleted successfully.');
      } else {
        setMessage(result.error || 'Failed to delete template.');
      }
    }
    setShowConfirmDialog(false); // Close the confirmation dialog
  };

  const getCreateTemplateDialog = () => {
    return <CreateTemplateDialog handleCreateTemplate={handleCreateTemplate} />;
  };

  return (
    <div>
      {templates.length === 0 ? (
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="mb-4 text-xl font-semibold text-gray-700">
              No templates found. Start creating your first template now!
            </div>
            {getCreateTemplateDialog()}
          </div>
        </div>
      ) : (
        <div>
          <div className="font mb-8 flex justify-between text-lg font-bold">
            <span>Templates</span>
            {getCreateTemplateDialog()}
          </div>
          <Table>
            <TableCaption>A list of your created templates.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Id</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((template) => {
                return (
                  <TableRow key={template.id}>
                    <TableCell>{template.id}</TableCell>
                    <TableCell>{template.name}</TableCell>
                    <TableCell>{template.description}</TableCell>
                    <TableCell>
                      {new Date(template.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="flex flex-row justify-end text-right">
                      <Button
                        className="mr-4"
                        size="sm"
                        onClick={() => handleEditClick(template.externalId)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(template.externalId)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <p className="mb-4">
              Are you sure you want to delete this template?
            </p>
            <div className="flex justify-end space-x-2">
              <Button onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidatorDashboard;
