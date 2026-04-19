import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

def send_otp_email(to_email: str, otp_code: str):
    """Sends a 6-digit OTP to the specified email using Gmail SMTP."""
    
    # Create message
    msg = MIMEMultipart()
    msg['From'] = settings.MAIL_FROM
    msg['To'] = to_email
    msg['Subject'] = "Your Wedakam Registration OTP"
    
    body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px;">
            <h2 style="color: #7c3aed; text-align: center;">Wedakam Registration</h2>
            <p>Hello,</p>
            <p>Thank you for registering with Wedakam. To complete your registration, please use the following One-Time Password (OTP):</p>
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #7c3aed; padding: 10px 20px; border: 2px dashed #7c3aed; border-radius: 5px;">{otp_code}</span>
            </div>
            <p>This OTP is valid for {settings.OTP_EXPIRE_MINUTES} minutes. If you did not request this, please ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #777; text-align: center;">&copy; 2026 Wedakam ML System. All rights reserved.</p>
        </div>
    </body>
    </html>
    """
    
    msg.attach(MIMEText(body, 'html'))
    
    try:
        # Connect to server
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        if settings.MAIL_STARTTLS:
            server.starttls()
        
        # Login
        server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        
        # Send
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False
