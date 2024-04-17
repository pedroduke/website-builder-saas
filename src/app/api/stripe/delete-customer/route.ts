import { db } from '@/lib/db';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function DELETE(req: Request) {
  const { custId } = await req.json();
  if (!custId)
    return new NextResponse('Customer Id is missing', {
      status: 400,
    });

  const customerExists = await db.agency.findFirst({
    where: { customerId: custId },
  });

  try {
    if (customerExists?.customerId) {
      if (!customerExists.customerId) {
        throw new Error('Could not find the customer Id to delete.');
      }
      console.log('Deleting cutomer');

      const customer = await stripe.customers.del(customerExists.customerId);

      return NextResponse.json({
        customerId: customer.id,
      });
    }
  } catch (error) {
    console.log('🔴 Error', error);
    return new NextResponse('Internal Server Error', {
      status: 500,
    });
  }
}
