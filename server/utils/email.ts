import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

const ADMIN_EMAILS = ["angus@gair.com.au", "belinda.mackie26@gmail.com"];

export async function sendFeedbackNotification(feedback: {
  category: string;
  content: string;
  rating: number;
  username?: string;
}) {
  const emailContent = `
    New Feedback Received
    
    Category: ${feedback.category}
    Rating: ${feedback.rating}/5
    User: ${feedback.username || 'Anonymous'}
    
    Message:
    ${feedback.content}
  `;

  try {
    await mailService.send({
      to: ADMIN_EMAILS,
      from: 'no-reply@projectroundtable.com',
      subject: `New Feedback: ${feedback.category}`,
      text: emailContent,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}
