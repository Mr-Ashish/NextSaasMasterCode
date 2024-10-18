'use server';
import { z } from 'zod';
import {
  createInvoice,
  deleteHtmlTemplate,
  deleteInvoice,
  getAllHtmlTemplatesForUser,
  getHtmlTemplateById,
  insertHtmlTemplate,
  updateInvoice,
  updateTemplateContent,
} from './data';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({
    invalid_type_error: 'Please select a customer.',
  }),
  amount: z.coerce
    .number()
    .gt(0, { message: 'Please enter an amount greater than $0.' }),
  status: z.enum(['pending', 'paid'], {
    invalid_type_error: 'Please select an invoice status.',
  }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoiceAction(
  prevState: State,
  formData: FormData
) {
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }
  const { customerId, amount, status } = validatedFields.data;

  const amountInCents = amount * 100;
  const date = new Date().toISOString().split('T')[0];
  await createInvoice(customerId, amountInCents, status, date);
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoiceAction(id: string, formData: FormData) {
  const { customerId, amount, status } = UpdateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  const amountInCents = amount * 100;

  await updateInvoice(id, customerId, amountInCents, status);

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoiceAction(id: string) {
  await deleteInvoice(id);
  revalidatePath('/dashboard/invoices');
}

export async function getHtmlTemplates(userId: string) {
  try {
    const templates = await getAllHtmlTemplatesForUser(userId);
    return { success: true, templates };
  } catch (error) {
    console.error('Failed to fetch templates:', error);
    return { success: false, error: 'Failed to fetch templates' };
  }
}

export async function createHtmlTemplateAction(
  name: string,
  description: string
) {
  try {
    const result = await insertHtmlTemplate(name, description);
    if (result.success) {
      return { success: true, template: result.template };
    }
    return { success: false, error: 'Failed to create template' };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export async function updateTemplateAction(
  templateId: string,
  newContent: string
) {
  try {
    const result = await updateTemplateContent(templateId, newContent);
    if (result.success) {
      return { success: true, template: result.template };
    }
    return { success: false, error: 'Failed to create template' };
  } catch (error) {
    console.error('Failed to create template:', error);
    return { success: false, error: 'Failed to create template' };
  }
}

export const deleteTemplateAction = async (templateId: string) => {
  const result = await deleteHtmlTemplate(templateId);
  if (result.success) {
    return { success: true };
  } else {
    console.error('Failed to delete template:', result.error);
  }
};

export const getTemplateByIdAction = async (templateId: string) => {
  const result = await getHtmlTemplateById(templateId);
  if (result.success) {
    return { success: true, template: result.template };
  } else {
    console.error('Failed to fetch template:', result.error);
    return { success: false, error: 'Failed to fetch template' };
  }
};
