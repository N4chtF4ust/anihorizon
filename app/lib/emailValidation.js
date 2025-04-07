import validator from 'validator';
import disposableDomains from 'disposable-email-domains';

export async function emailValidation(email) {
  const emailDomain = email?.split('@')[1]?.toLowerCase();

  // Additional disposable domains you want to add
  const additionalDisposableDomains = [
    'mailinator.com', 'guerrillamail.com', '10minutemail.com', 'throwawaymail.com',
    'temp-mail.org', 'maildrop.cc', 'trashmail.com', 'disposablemail.com', 'exclussi.com', 'polkaroad.net',
  ];

  // Combine the package's list with your custom domains
  const allDisposableDomains = [...disposableDomains, ...additionalDisposableDomains];

  // Check for valid email format
  if (!email || !validator.isEmail(email)) {
    return new Response(
      JSON.stringify({ message: 'Invalid email format' }),
      { status: 400 }
    );
  }

  // Check if the email domain is in the combined list of disposable domains
  if (allDisposableDomains.includes(emailDomain)) {
    return new Response(
      JSON.stringify({ message: 'Disposable email addresses are not allowed' }),
      { status: 400 }
    );
  }

  // Return a success message if the email is valid and not disposable
  return new Response(
    JSON.stringify({ message: 'Email is valid' }),
    { status: 200 }
  );
}
