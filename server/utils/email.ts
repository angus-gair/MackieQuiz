// Import removed to disable SendGrid functionality

// SendGrid is disabled as per user request
// No need for SENDGRID_API_KEY environment variable

const ADMIN_EMAILS = ["angus@gair.com.au", "belinda.mackie26@gmail.com"];

/**
 * Dummy implementation of the sendFeedbackNotification function
 * This simply logs the feedback to the console and returns true
 * without actually sending any emails, removing the SendGrid dependency
 */
export async function sendFeedbackNotification(feedback: {
  category: string;
  content: string;
  rating: number;
  username?: string;
}) {
  console.log('SendGrid disabled - Feedback would have been sent:'); 
  console.log(`
    New Feedback Received

    Category: ${feedback.category}
    Rating: ${feedback.rating}/5
    User: ${feedback.username || 'Anonymous'}

    Message:
    ${feedback.content}
  `);
  
  console.log('To admins:', ADMIN_EMAILS);
  
  // Return true to indicate success even though no email was sent
  return true;
}