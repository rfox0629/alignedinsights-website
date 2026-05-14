import { Resend } from "resend";
import type { Database } from "@/lib/supabase/types";

type InquiryRow = Database["public"]["Tables"]["aligned_insights_inquiries"]["Row"];

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  resendClient ??= new Resend(apiKey);

  return resendClient;
}

function escapeHtml(value: string | null) {
  return (value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Chicago",
  }).format(new Date(value));
}

function displayValue(value: string | string[] | null) {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }

  return value || "Not provided";
}

function line(label: string, value: string | string[] | null) {
  return `${label}: ${displayValue(value)}`;
}

export async function sendReportRequestNotification(inquiry: InquiryRow) {
  const resend = getResendClient();

  if (!resend) {
    console.info("Skipping report request notification because RESEND_API_KEY is not configured.");
    return;
  }

  const notifyEmail = "ryan@alignedinsights.tech";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Aligned Insights <onboarding@resend.dev>";
  const submittedAt = formatSubmittedAt(inquiry.created_at);
  const fullName = `${inquiry.first_name} ${inquiry.last_name}`.trim();
  const adminUrl = "https://alignedinsights.tech/admin/inquiries";
  const text = [
    "New Financial Insights Inquiry",
    "",
    line("Contact name", fullName),
    line("Organization", inquiry.organization_name),
    line("Email", inquiry.email),
    line("Phone", inquiry.phone),
    line("Services requested", inquiry.looking_for),
    line("Message", inquiry.message),
    line("Submitted at", submittedAt),
    "",
    `Admin: ${adminUrl}`,
  ].join("\n");

  const htmlRows: Array<[string, string | string[] | null]> = [
    ["Contact name", fullName],
    ["Organization", inquiry.organization_name],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Services requested", inquiry.looking_for],
    ["Message", inquiry.message],
    ["Submitted at", submittedAt],
  ];

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: "New Financial Insights Inquiry",
    text,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0b1b34; line-height: 1.55;">
        <h1 style="font-size: 22px; margin: 0 0 8px;">New Financial Insights Inquiry</h1>
        <p style="color: #4a5b78; font-size: 14px; margin: 0 0 18px;">A new report request was submitted through alignedinsights.tech.</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
          <tbody>
            ${htmlRows
              .map(
                ([label, value]) => `
                  <tr>
                    <td style="border-bottom: 1px solid #e4eaf2; color: #4a5b78; font-size: 13px; padding: 10px 12px 10px 0; vertical-align: top; width: 180px;">${escapeHtml(label)}</td>
                    <td style="border-bottom: 1px solid #e4eaf2; font-size: 14px; padding: 10px 0; vertical-align: top;">${escapeHtml(displayValue(value))}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
        <p style="margin: 20px 0 0;">
          <a href="${adminUrl}" style="color: #1e6bff; font-size: 14px; font-weight: 600; text-decoration: none;">Open admin inquiries</a>
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend notification failed: ${JSON.stringify(error)}`);
  }
}
