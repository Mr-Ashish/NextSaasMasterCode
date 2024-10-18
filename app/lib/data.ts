import { randomUUID } from 'crypto';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoiceRaw,
  User,
  Revenue,
} from './definitions';
import { formatCurrency } from './utils';
import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';
import { auth } from '@/auth';

const prisma = new PrismaClient();

export async function fetchRevenue() {
  noStore();
  try {
    const data = await prisma.revenue.findMany();
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  noStore();
  try {
    const data: LatestInvoiceRaw[] = await prisma.$queryRaw`
      SELECT 
        i.amount, 
        c.name, 
        c.image_url, 
        c.email, 
        i.id
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      ORDER BY i.date DESC
      LIMIT 5`;
    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));

    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  noStore();
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise: Promise<number> = prisma.invoice.count();
    const customerCountPromise: Promise<number> = prisma.customer.count();
    const invoiceStatusPromise: Promise<any> = prisma.$queryRaw`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM "Invoice"`;

    const [invoiceCount, customerCount, invoiceStatus] = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(invoiceCount ?? '0');
    const numberOfCustomers = Number(customerCount ?? '0');
    const totalPaidInvoices = formatCurrency(
      Number(invoiceStatus[0].paid) ?? '0'
    );
    const totalPendingInvoices = formatCurrency(
      Number(invoiceStatus[0].pending) ?? '0'
    );

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices: InvoicesTable[] = await prisma.$queryRaw`
      SELECT
        i.id,
        i.amount,
        i.date,
        i.status,
        c.name,
        c.email,
        c.image_url
      FROM "Invoice" i
      JOIN "Customer" c ON i.customer_id = c.id
      WHERE
        c.name ILIKE ${`%${query}%`} OR
        c.email ILIKE ${`%${query}%`} OR
        i.amount::text ILIKE ${`%${query}%`} OR
        i.date::text ILIKE ${`%${query}%`} OR
        i.status ILIKE ${`%${query}%`}
      ORDER BY i.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  try {
    const count = await prisma.$queryRaw`SELECT COUNT(*)
    FROM "Invoice" i
    JOIN "Customer" c ON i.customer_id = c.id
    WHERE
      c.name ILIKE ${`%${query}%`} OR
      c.email ILIKE ${`%${query}%`} OR
      i.amount::text ILIKE ${`%${query}%`} OR
      i.date::text ILIKE ${`%${query}%`} OR
      i.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data: InvoiceForm[] = await prisma.$queryRaw`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM "Invoice" invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.map((invoice: any) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data: CustomerField[] = await prisma.$queryRaw`
      SELECT
        id,
        name
      FROM "Customer" 
      ORDER BY name ASC
    `;

    const customers = data;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data: CustomersTableType[] = await prisma.$queryRaw`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email, active: true },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createInvoice(
  customerId: string,
  amountInCents: number,
  status: string,
  date: string
) {
  try {
    const newInvoice = await prisma.invoice.create({
      data: {
        amount: amountInCents,
        status: status,
        date: new Date(date),
        Customer: {
          connect: { id: customerId }, // Connect to an existing customer by ID
        },
      },
    });

    return newInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to create invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function updateInvoice(
  id: string,
  customerId: string,
  amountInCents: number,
  status: string
) {
  try {
    const updatedInvoice = await prisma.invoice.update({
      where: { id: id },
      data: {
        customer_id: customerId,
        amount: amountInCents,
        status: status,
      },
    });

    return updatedInvoice;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to update invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function deleteInvoice(id: string) {
  try {
    await prisma.invoice.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    throw new Error('Failed to update invoice.');
  } finally {
    await prisma.$disconnect();
  }
}

export async function createUser(
  name: string,
  email: string,
  hashedPassword: string,
  verificationToken: string
) {
  try {
    const verificationTokenExpiry = verificationToken
      ? new Date(Date.now() + 24 * 60 * 60 * 1000)
      : null;
    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiry,
      },
    });
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export function getAllHtmlTemplatesForUser(userId: string) {
  try {
    return prisma.$queryRaw`SELECT * FROM "EmailTemplates" WHERE "userId"=${userId} and active=true`;
  } catch (error) {
    console.error('Error getting templates:', error);
    throw error;
  }
}

export async function insertHtmlTemplate(name: string, description?: string) {
  try {
    const session = await auth();
    const currentSignedInUser = session.userId;
    if (!currentSignedInUser) {
      return { success: false, error: 'User not found' };
    }
    const newTemplate = await prisma.emailTemplates.create({
      data: {
        name,
        description,
        userId: currentSignedInUser,
        externalId: randomUUID(),
      },
    });
    return { success: true, template: newTemplate };
  } catch (error) {
    console.error('Failed to insert template:', error);
    return { success: false, error: 'Failed to insert template' };
  }
}

export async function updateTemplateContent(
  templateExternalId: string,
  newContent: string
) {
  try {
    const updatedTemplate = await prisma.emailTemplates.update({
      where: {
        externalId: templateExternalId,
      },
      data: {
        content: newContent,
      },
    });
    return { success: true, template: updatedTemplate };
  } catch (error) {
    console.error('Error updating template content:', error);
    return { success: false, error: 'Failed to update template content.' };
  }
}

export async function deleteHtmlTemplate(templateId: string) {
  try {
    const deletedTemplate = await prisma.emailTemplates.update({
      where: {
        externalId: templateId,
      },
      data: {
        active: false,
      },
    });
    return { success: true, template: deletedTemplate };
  } catch (error) {
    console.error('Error deleting template:', error);
    return { success: false, error: 'Failed to delete template.' };
  }
}

export async function getHtmlTemplateById(templateId: string) {
  try {
    const template = await prisma.emailTemplates.findUnique({
      where: { externalId: templateId },
    });

    if (template) {
      return { success: true, template };
    } else {
      return { success: false, error: 'Template not found' };
    }
  } catch (error) {
    console.error('Error fetching template:', error);
    return { success: false, error: 'Failed to fetch template' };
  }
}

export async function getUserSubscriptions() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized');
  }

  const userEmail = session.user.email;

  try {
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { subscriptions: true },
    });

    if (!user || !user.subscriptions.length) {
      throw new Error('Subscription not found');
    }

    return user.subscriptions;
  } catch (error) {
    throw new Error(`Failed to get subscriptions: ${error.message}`);
  }
}

export async function saveSubscription({
  userId,
  plan,
  paymentId,
  amount,
}: {
  userId: string;
  plan: any;
  paymentId: string;
  amount: number;
}) {
  try {
    // You can add logic to map the plan to its corresponding module
    const subscriptionModule = await prisma.module.findUnique({
      where: { id: plan.moduleId }, // Assuming your plan maps to moduleId
    });
    if (!subscriptionModule) {
      throw new Error('Module not found for the selected plan');
    }

    // Calculate the subscription duration based on the plan (example: 1 month for Basic, etc.)
    // const durationInMonths = plan === 'Basic Plan' ? 1 : 12;
    const durationInMonths = 12; // Assuming 12 month for all plans

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + durationInMonths);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        moduleId: subscriptionModule.id,
        subscriptionType: 'FULL', // Adjust based on the plan
        price: amount, // Convert from cents/paise if necessary
        durationInMonths,
        startDate,
        endDate,
        createdAt: new Date(),
        metadata: { plan, paymentId },
      },
    });
    return {
      success: true,
    };
  } catch (error) {
    console.error('Error saving subscription: ', error);
    return {
      success: false,
      message: error.message || 'Failed to save subscription',
    };
  }
}

export async function getUserForResetToken(token: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date().toISOString(),
        },
      },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user for reset token:', error);
    throw new Error('Failed to fetch user for reset token');
  }
}

export async function getUserForVerificationToken(
  token: string,
  email: string
) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: token,
      },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    return user;
  } catch (error) {
    console.error('Error fetching user for verification token:', error);
    throw new Error('Failed to fetch user for verification token');
  }
}

export async function resetNewPasswordForUser({
  userId,
  hashedPassword,
}: {
  userId: string;
  hashedPassword: string;
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw new Error('Failed to reset password');
  }
}

export async function setResetTokenForUser({
  email,
  resetToken,
  resetTokenExpiry,
}: {
  email: string;
  resetToken: string;
  resetTokenExpiry: any;
}) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error setting reset token:', error);
    throw new Error('Failed to set reset token');
  }
}

export async function updateVerificationStatusForEmail(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return user;
  } catch (error) {
    console.error('Error updating verification status:', error);
    throw new Error('Failed to update verification status');
  }
}

export async function updateUserVerificationToken(
  email: string,
  verificationToken: string
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        verificationToken,
        verificationTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating verification token:', error);
    throw new Error('Failed to update verification token');
  }
}

export async function updateEmailVerificationStatus(
  email: string,
  isVerified: boolean
) {
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        isVerified,
      },
    });

    return updatedUser;
  } catch (error) {
    console.error('Error updating email verification status:', error);
    throw new Error('Failed to update email verification status');
  }
}
