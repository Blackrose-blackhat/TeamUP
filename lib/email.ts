import nodemailer from "nodemailer";

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  throw new Error("GMAIL_USER or GMAIL_PASS not set in .env");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

type EmailType = "welcome" | "gig_applied" | "gig_accepted";

export async function sendEmail(
  type: EmailType,
  to: string,
  data?: Record<string, any>
) {
  let subject = "";
  let html = "";

  const baseStyle = `
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
  `;

  const buttonStyle = `
    display: inline-block;
    padding: 10px 20px;
    margin-top: 15px;
    background-color: #4f46e5;
    color: #fff !important;
    text-decoration: none;
    border-radius: 6px;
    font-weight: bold;
  `;

  switch (type) {
    case "welcome":
      subject = "Welcome to Our Platform! 🎉";
      html = `
        <div style="${baseStyle}">
          <h1 style="color:#4f46e5;">Welcome ${data?.username || "User"}!</h1>
          <p>Thanks for completing your profile. We’re thrilled to have you onboard 🚀</p>
          <p>Explore gigs, connect with creators, and start building your journey today!</p>
          <a href="${process.env.APP_URL}" style="${buttonStyle}">Go to Dashboard</a>
          <p style="margin-top:20px; font-size:12px; color:#888;">
            If you did not create an account, you can safely ignore this email.
          </p>
        </div>
      `;
      break;

    case "gig_applied":
      subject = "Application Received ✅";
      html = `
        <div style="${baseStyle}">
          <h2 style="color:#4f46e5;">Hi ${data?.username || "there"},</h2>
          <p>Your application for <strong>${data?.gigTitle || "a gig"}</strong> has been successfully received.</p>
          <p>The creator will review your application and contact you soon. Stay tuned!</p>
          <a href="${process.env.APP_URL}/dashboard/gigs" style="${buttonStyle}">View Your Applications</a>
          <p style="margin-top:20px; font-size:12px; color:#888;">
            If you did not apply, please ignore this email.
          </p>
        </div>
      `;
      break;

    case "gig_accepted":
      subject = "Congrats! You’ve Been Accepted 🎉";
      html = `
        <div style="${baseStyle}">
          <h2 style="color:#4f46e5;">Hi ${data?.username || "there"},</h2>
          <p>Great news! You’ve been accepted for the gig <strong>${data?.gigTitle || "a gig"}</strong>.</p>
          <p>Get ready to collaborate and make an impact 🚀</p>
          <a href="${process.env.APP_URL}/dashboard/gigs" style="${buttonStyle}">View Gig Details</a>
          <p style="margin-top:20px; font-size:12px; color:#888;">
            If you did not apply, please ignore this email.
          </p>
        </div>
      `;
      break;
  }

  await transporter.sendMail({
    from: `"Mushraf from TeamUp.dev" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
