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

function line(label: string, value: string | null) {
  return `${label}: ${value || "Not provided"}`;
}

export async function sendReportRequestNotification(inquiry: InquiryRow) {
  const resend = getResendClient();

  if (!resend) {
    console.info("Skipping report request notification because RESEND_API_KEY is not configured.");
    return;
  }

  const notifyEmail = process.env.ALIGNED_INSIGHTS_NOTIFY_EMAIL || "ryan@alignedinsights.tech";
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Aligned Insights <reports@alignedinsights.tech>";
  const submittedAt = formatSubmittedAt(inquiry.created_at);
  const fullName = `${inquiry.first_name} ${inquiry.last_name}`.trim();
  const text = [
    "New Financial Insights Report request received.",
    "",
    line("Name", fullName),
    line("Email", inquiry.email),
    line("Phone", inquiry.phone),
    line("Organization name", inquiry.organization_name),
    line("Organization type", inquiry.organization_type),
    line("Annual revenue", inquiry.annual_revenue),
    line("Looking for", inquiry.looking_for),
    line("Message", inquiry.message),
    line("Submitted at", submittedAt),
  ].join("\n");

  const htmlRows = [
    ["Name", fullName],
    ["Email", inquiry.email],
    ["Phone", inquiry.phone],
    ["Organization name", inquiry.organization_name],
    ["Organization type", inquiry.organization_type],
    ["Annual revenue", inquiry.annual_revenue],
    ["Looking for", inquiry.looking_for],
    ["Message", inquiry.message],
    ["Submitted at", submittedAt],
  ];

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: notifyEmail,
    subject: "New Aligned Insights Report Request",
    text,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #0b1b34; line-height: 1.55;">
        <h1 style="font-size: 22px; margin: 0 0 12px;">New Financial Insights Report request received.</h1>
        <table style="border-collapse: collapse; width: 100%; max-width: 680px;">
          <tbody>
            ${htmlRows
              .map(
                ([label, value]) => `
                  <tr>
                    <td style="border-bottom: 1px solid #e4eaf2; color: #4a5b78; font-size: 13px; padding: 10px 12px 10px 0; vertical-align: top; width: 180px;">${escapeHtml(label)}</td>
                    <td style="border-bottom: 1px solid #e4eaf2; font-size: 14px; padding: 10px 0; vertical-align: top;">${escapeHtml(value)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend notification failed: ${JSON.stringify(error)}`);
  }
}
