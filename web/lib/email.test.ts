import { describe, it, expect, vi } from 'vitest';
import { sendVerificationEmail } from './email';
import nodemailer from 'nodemailer';

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
    }),
  },
}));

describe('sendVerificationEmail', () => {
  it('should return success true when email is sent successfully', async () => {
    const result = await sendVerificationEmail('test@example.com', 'testuser', 'test-token');
    expect(result.success).toBe(true);
  });

  it('should return success false and error when email sending fails', async () => {
    const mockTransporter = nodemailer.createTransport();
    vi.mocked(mockTransporter.sendMail).mockRejectedValueOnce(new Error('SMTP Error'));

    const result = await sendVerificationEmail('test@example.com', 'testuser', 'test-token');
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
  });
});
