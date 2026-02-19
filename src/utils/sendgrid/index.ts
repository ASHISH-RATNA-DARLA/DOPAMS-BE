import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
const { SENDGRID_API_KEY, SENDGRID_EMAIL_ID } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY || '');

export const templates = {
  INVITE_USER_TO_REPOSITORY: 'd-954849e9e1c14949bc44b07962897a0f',
  FORGOT_PASSWORD: 'd-954849e9e1c14949bc44b07962897a0f',
};

export const sendEmail = async (data: {
  receiver: string;
  sender?: string;
  format: string;
  templateData?;
}): Promise<{ success: boolean }> => {
  const message: any = {
    to: data.receiver,
    from: data.sender || SENDGRID_EMAIL_ID,
    // templateId: templates[data.format],
    templateId: data.format,
    dynamic_template_data: data.templateData,
  };

  // Send the email
  const result = await sgMail
    .send(message)
    .then(() => ({ success: true }))
    .catch(err => {
      console.log('Error occurred: ', err.response.body.errors);
      return { success: false };
    });

  return result;
};
