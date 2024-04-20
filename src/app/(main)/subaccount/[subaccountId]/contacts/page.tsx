import { db } from '@/lib/db';
import { SubAccountWithContacts } from '@/lib/types';
import { Ticket } from '@prisma/client';
import format from 'date-fns/format';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import CreateContactButton from './_components/create-contact-btn';

type ContactsPageProps = {
  params: {
    subaccountId: string;
  };
};

const ContactsPage = async ({ params }: ContactsPageProps) => {
  const contacts = (await db.subAccount.findUnique({
    where: {
      id: params.subaccountId,
    },
    include: {
      Contact: {
        include: {
          Ticket: {
            select: {
              value: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })) as SubAccountWithContacts;

  const allContacts = contacts.Contact;

  const formatTotal = (tickets: Ticket[]) => {
    if (!tickets || !tickets.length) return '$0.00';

    const amt = new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
    });

    const laneAmt = tickets.reduce((sum, ticket) => sum + (Number(ticket?.value) || 0), 0);

    return amt.format(laneAmt);
  };

  return (
    <>
      <div className="flex justify-between">
        <h1 className="text-4xl p-4">Contacts</h1>
        <CreateContactButton subaccountId={params.subaccountId} />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[300px]">Email</TableHead>
            <TableHead className="w-[200px]">Active</TableHead>
            <TableHead>Created Date</TableHead>
            <TableHead className="text-right">Total Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="fonr-medium truncate">
          {allContacts.map((contact) => (
            <TableRow key={contact.id}>
              <TableCell>
                <Avatar>
                  <AvatarImage alt="avatar image" />
                  <AvatarFallback className="bg-primary text-white">
                    {contact.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                {formatTotal(contact.Ticket) === '$0.00' ? (
                  <Badge className="bg-destructive hover:bg-destructive text-white">Inactive</Badge>
                ) : (
                  <Badge className="bg-teal-600 hover:bg-teal-600 text-white">Active</Badge>
                )}
              </TableCell>
              <TableCell>{format(contact.createdAt, 'dd/MM/yyyy')}</TableCell>
              <TableCell className="text-right">{formatTotal(contact.Ticket)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
};

export default ContactsPage;
