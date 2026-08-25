import * as nodemailer from 'nodemailer';
import { EmailService } from './email.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

describe('EmailService order email templates', () => {
  it('sends a received message with order details for placed orders', async () => {
    const sendMail = jest.fn().mockResolvedValue({});
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail,
    } as any);

    process.env.EMAIL_USER = 'test@example.com';
    process.env.EMAIL_PASSWORD = 'password';
    const service = new EmailService({} as any);

    await service.sendOrderStatusEmail(
      {
        id: 101,
        status: 'Placed',
        subtotal: '1200',
        discount: '100',
        deliveryFee: '50',
        shippingFee: '0',
        codFee: '0',
        total: '1150',
        shippingAddress: {
          fullName: 'Test User',
          addressLine1: '10 Market Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          pincode: '560001',
        },
        items: [
          {
            name: 'Cotton Kurta',
            price: '600',
            quantity: 2,
          },
        ],
        user: {
          email: 'customer@example.com',
          name: 'Test User',
        },
      },
      'Placed',
    );

    expect(sendMail).toHaveBeenCalledTimes(1);
    expect(sendMail.mock.calls[0][0]).toMatchObject({
      to: 'customer@example.com',
      subject: expect.stringMatching(/received|placed/i),
    });
    expect(sendMail.mock.calls[0][0].html).toContain('Cotton Kurta');
    expect(sendMail.mock.calls[0][0].html).toContain('₹1,150.00');
  });
});
