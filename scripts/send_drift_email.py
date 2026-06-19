import os
import smtplib
import sys
from email.message import EmailMessage


def parse_recipients(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


def main() -> int:
    if len(sys.argv) < 3:
        print("Usage: python scripts/send_drift_email.py <subject> <body>")
        return 1

    smtp_host = os.getenv("SMTP_HOST")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_username = os.getenv("SMTP_USERNAME")
    smtp_password = os.getenv("SMTP_PASSWORD")
    email_from = os.getenv("EMAIL_FROM", smtp_username or "")
    recipients_raw = os.getenv("EMAIL_TO", "")

    if not all([smtp_host, smtp_username, smtp_password, email_from, recipients_raw]):
        print("Missing SMTP_HOST, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM, or EMAIL_TO.")
        return 1

    recipients = parse_recipients(recipients_raw)
    if not recipients:
        print("EMAIL_TO must contain at least one recipient.")
        return 1

    subject = sys.argv[1]
    body = sys.argv[2]

    message = EmailMessage()
    message["From"] = email_from
    message["To"] = ", ".join(recipients)
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(smtp_host, smtp_port, timeout=30) as server:
        server.starttls()
        server.login(smtp_username, smtp_password)
        server.send_message(message)

    print(f"Email sent to {', '.join(recipients)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())