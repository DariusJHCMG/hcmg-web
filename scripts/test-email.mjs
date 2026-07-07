import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const { data, error } = await resend.emails.send({
  from: "HCMG <noreply@hcmgloans.com>",
  to: "darius@hcmgloans.com",
  subject: "HCMG Portal — Email is working",
  html: "<div style='font-family:sans-serif;padding:24px'><h2 style='color:#142850'>HCMG Email Test</h2><p>Lead notification emails are working from noreply@hcmgloans.com via Resend.</p><p style='color:#888;font-size:12px'>Harris Capital Mortgage Group · NMLS# 1918223</p></div>",
});

if (error) {
  console.log("ERROR:", JSON.stringify(error));
} else {
  console.log("SENT OK — ID:", data.id);
  console.log("Check darius@hcmgloans.com inbox now");
}
