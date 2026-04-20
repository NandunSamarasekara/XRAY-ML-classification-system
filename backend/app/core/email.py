import smtplib
import base64
from email.message import EmailMessage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from app.config import settings


def send_otp_email(to_email: str, otp: str, patient_name: str) -> None:
    sender_email = settings.MAIL_USERNAME
    sender_password = settings.MAIL_PASSWORD
    mail_server = settings.MAIL_SERVER
    mail_port = settings.MAIL_PORT
    mail_from = settings.MAIL_FROM
    mail_from_name = settings.MAIL_FROM_NAME

    if not sender_email or not sender_password:
        print(f"Warning: MAIL_USERNAME or MAIL_PASSWORD not set in .env. Skipping email. OTP={otp}")
        return

    print(f"\n==========================================")
    print(f"DEVELOPMENT OTP LOG: {otp}")
    print(f"==========================================\n")

    sender_email = str(sender_email).strip().strip('"').strip("'")
    sender_password = str(sender_password).strip().strip('"').strip("'").replace(" ", "")
    from_address = f"{mail_from_name} <{mail_from}>" if mail_from_name else mail_from

    msg = EmailMessage()
    msg.set_content(
        f"Hello {patient_name},\n\n"
        f"Your patient profile has been created in the Wedakam system.\n\n"
        f"Your verification code is: {otp}\n\n"
        f"Please provide this code to your doctor to activate your profile.\n\n"
        f"Thank you!"
    )
    msg['Subject'] = "Your Wedakam Patient Profile Verification Code"
    msg['From'] = from_address
    msg['To'] = to_email

    try:
        with smtplib.SMTP(mail_server, mail_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.send_message(msg)
        print(f"Successfully sent OTP email to {to_email}")
    except Exception as e:
        print(f"Failed to send email to {to_email}: {e}")


def send_report_email(to_email: str, report: dict) -> None:
    """Send a finalized medical report email with all patient/clinical fields and embedded X-ray images."""
    sender_email = settings.MAIL_USERNAME
    sender_password = settings.MAIL_PASSWORD
    mail_server = settings.MAIL_SERVER
    mail_port = settings.MAIL_PORT
    mail_from = settings.MAIL_FROM
    mail_from_name = settings.MAIL_FROM_NAME

    if not sender_email or not sender_password:
        raise RuntimeError("MAIL_USERNAME or MAIL_PASSWORD not configured in .env")

    sender_email = str(sender_email).strip().strip('"').strip("'")
    sender_password = str(sender_password).strip().strip('"').strip("'").replace(" ", "")
    from_address = f"{mail_from_name} <{mail_from}>" if mail_from_name else mail_from

    patient_name  = report.get('patient_name', 'Patient')
    report_id     = report.get('report_id', '')
    diagnosis     = report.get('diagnosis') or 'Not specified'
    observations  = report.get('clinical_observations') or 'Not specified'
    treatment     = report.get('treatment_plan') or 'Not specified'
    comments      = report.get('additional_comments') or 'Not specified'
    date          = str(report.get('created_date', ''))
    normal_image  = report.get('normal_image')   # base64 data URI or None
    heatmap_image = report.get('heatmap_image')  # base64 data URI or None
    ctx           = report.get('patient_context', {}) or {}
    gender        = ctx.get('gender', 'N/A')
    age           = ctx.get('age', 'N/A')
    pat_email     = ctx.get('email', 'N/A')

    # Build image note in HTML (actual images will be file attachments)
    if normal_image or heatmap_image:
        images_section = """
        <div style="margin-bottom:28px;padding:16px;background:#f0fdfa;border-radius:8px;border:1px solid #99f6e4;">
          <h3 style="color:#14b8a6;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">X-Ray Images Attached</h3>
          <p style="color:#475569;font-size:13px;margin:0;">The Normal X-Ray and Grad-CAM analysis images are attached to this email as image files.</p>
        </div>"""
    else:
        images_section = ""

    html_body = f"""
    <html><body style="font-family:Arial,sans-serif;color:#1e293b;margin:0;padding:0;">
      <div style="max-width:640px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
        <div style="background:#14b8a6;padding:28px 32px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">Wedakam Health AI</h1>
          <p style="color:#ccfbf1;margin:6px 0 0;font-size:14px;">Clinical X-Ray Medical Report</p>
        </div>
        <div style="padding:32px;">

          <!-- Patient & Report Info -->
          <table style="width:100%;border-collapse:collapse;background:#f1f5f9;border-radius:8px;margin-bottom:24px;">
            <tr>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Patient Name</span><br/><strong>{patient_name}</strong></td>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Report ID</span><br/><strong>#{report_id}</strong></td>
            </tr>
            <tr>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Gender</span><br/><strong>{gender}</strong></td>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Age</span><br/><strong>{age}</strong></td>
            </tr>
            <tr>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Email</span><br/><strong>{pat_email}</strong></td>
              <td style="padding:12px 16px;"><span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Date Generated</span><br/><strong>{date}</strong></td>
            </tr>
            <tr>
              <td colspan="2" style="padding:12px 16px;background:#e6fffa;border-top:1px solid #99f6e4;">
                <span style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;">Status</span><br/>
                <strong style="color:#14b8a6;">&#10003; Finalized &amp; Approved</strong>
              </td>
            </tr>
          </table>

          {images_section}

          <!-- Clinical Sections -->
          <h3 style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">Final Diagnosis</h3>
          <p style="color:#334155;margin-bottom:20px;">{diagnosis}</p>

          <h3 style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">Clinical Observations</h3>
          <p style="color:#334155;margin-bottom:20px;">{observations}</p>

          <h3 style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">Treatment Plan</h3>
          <p style="color:#334155;margin-bottom:20px;">{treatment}</p>

          <h3 style="color:#475569;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid #e2e8f0;padding-bottom:6px;">Additional Comments</h3>
          <p style="color:#334155;margin-bottom:20px;">{comments}</p>

        </div>
        <div style="background:#f8fafc;padding:16px 32px;text-align:center;color:#94a3b8;font-size:12px;">
          Wedakam Health AI &mdash; Confidential Medical Document
        </div>
      </div>
    </body></html>
    """

    # ── Build and send email with HTML body + image attachments ──
    # Outer container is 'mixed' to support both HTML content and file attachments
    msg = MIMEMultipart('mixed')
    msg['Subject'] = f"Medical Report #{report_id} — {patient_name} | Wedakam Health AI"
    msg['From']    = from_address
    msg['To']      = to_email

    # Attach HTML body inside an 'alternative' wrapper
    html_part = MIMEMultipart('alternative')
    html_part.attach(MIMEText(html_body, 'html'))
    msg.attach(html_part)

    # Attach Normal X-Ray image if provided
    def attach_image(msg, data_uri, filename):
        """Decode a base64 data URI and attach it as an image file."""
        if not data_uri:
            return
        try:
            # Strip the data URI prefix: "data:image/jpeg;base64," → raw base64
            if ',' in data_uri:
                header, b64data = data_uri.split(',', 1)
            else:
                b64data = data_uri
            img_bytes = base64.b64decode(b64data)
            img = MIMEImage(img_bytes)
            img.add_header('Content-Disposition', 'attachment', filename=filename)
            msg.attach(img)
        except Exception as e:
            print(f"Warning: Could not attach image '{filename}': {e}")

    attach_image(msg, normal_image,  'Normal_XRay.jpg')
    attach_image(msg, heatmap_image, 'GradCAM_Analysis.jpg')

    with smtplib.SMTP(mail_server, mail_port) as server:
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
    print(f"Report email sent to {to_email}")
