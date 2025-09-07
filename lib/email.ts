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

type EmailType = "welcome" | "gig_applied" | "gig_accepted" | "contact_creator";

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
          <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="${buttonStyle}">Go to Dashboard</a>
        </div>
      `;
      break;

    case "gig_applied":
      subject = "Application Received ✅";
      html = `
        <div style="${baseStyle}">
          <h2 style="color:#4f46e5;">Hi there,</h2>
          <p>You have received a new application for <strong>${data?.gigTitle || "a gig"}</strong>.</p>
          <p><strong>Applicant Name:</strong> ${data?.username || "N/A"}</p>
          <p><strong>Applicant Email:</strong> ${data?.applicantEmail || "N/A"}</p>
          <p><strong>Applicant's Message:</strong></p>
          <p style="padding:10px; background:#f3f3f3; border-radius:6px;">${data?.message || "No message provided."}</p>
        </div>
      `;
      break;

    case "contact_creator":
      subject = `New Message from ${data?.applicantName || "an applicant"} 📩`;
      html = `
        <div style="${baseStyle}">
          <h2 style="color:#4f46e5;">Hi ${data?.creatorName || "Creator"},</h2>
          <p>You have received a message from <strong>${data?.applicantName || "an applicant"}</strong> regarding your gig <strong>${data?.gigTitle || ""}</strong>.</p>
          <p><strong>Applicant Email:</strong> ${data?.applicantEmail || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p style="padding:10px; background:#f3f3f3; border-radius:6px;">${data?.message || "No message provided."}</p>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/gigs" style="${buttonStyle}">View Gig</a>
        </div>
      `;
      break;

    case "gig_accepted":
      subject = "Congrats! You’ve Been Accepted 🎉";
      html = `
        <div style="${baseStyle}">
          <h2 style="color:#4f46e5;">Hi ${data?.username || "there"},</h2>
          <p>Great news! You’ve been accepted for the gig <strong>${data?.gigTitle || "a gig"}</strong>.</p>
        </div>
      `;
      break;
  }

  await transporter.sendMail({
    from: `"TeamUp.dev" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
