from __future__ import annotations

import asyncio
import smtplib
import ssl
from email.message import EmailMessage
from email.utils import formataddr
from pathlib import Path

from backend.app.config import Settings
from backend.app.schemas import ContactRequest, ResumeEmailRequest


class EmailConfigurationError(RuntimeError):
    pass


class EmailDeliveryError(RuntimeError):
    pass


class EmailService:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def configured(self) -> bool:
        return self.settings.email_configured

    def _require_smtp_configuration(self) -> None:
        if not self.configured:
            raise EmailConfigurationError("Email delivery is not configured")
        if self.settings.smtp_use_ssl and self.settings.smtp_use_starttls:
            raise EmailConfigurationError("Choose either SMTP SSL or STARTTLS, not both")

    async def send_resume(self, request: ResumeEmailRequest) -> None:
        self._require_smtp_configuration()
        resume_path = Path(self.settings.resume_path).resolve()
        if not resume_path.is_file():
            raise EmailConfigurationError("The configured resume attachment is unavailable")

        greeting = f"Hi {request.recipient_name}," if request.recipient_name else "Hello,"
        company_line = f" regarding opportunities at {request.company}" if request.company else ""
        message = self._new_message(
            subject="Omkar Mahabdi — Resume",
            recipient=request.recipient_email,
            body=(
                f"{greeting}\n\n"
                f"Thank you for your interest{company_line}. Attached is Omkar Mahabdi's resume.\n\n"
                f"Portfolio: {self.settings.portfolio_url}\n"
                "LinkedIn: https://www.linkedin.com/in/omkar-mahabdi\n"
                "GitHub: https://github.com/starboy1101\n\n"
                "Regards,\nOmkar Mahabdi"
            ),
        )
        message.add_attachment(
            resume_path.read_bytes(),
            maintype="application",
            subtype="pdf",
            filename="Omkar_Mahabdi_Resume.pdf",
        )
        await asyncio.to_thread(self._deliver, message)

    async def send_contact_notification(self, request: ContactRequest) -> None:
        self._require_smtp_configuration()
        if not self.settings.contact_recipient_email:
            raise EmailConfigurationError("Contact recipient is not configured")
        clean_subject = " ".join((request.subject or "Portfolio inquiry").split())[:120]
        message = self._new_message(
            subject=f"Portfolio contact: {clean_subject}",
            recipient=str(self.settings.contact_recipient_email),
            body=(
                "A visitor submitted a portfolio contact request.\n\n"
                f"Name: {request.name}\n"
                f"Company: {request.company or 'Not provided'}\n"
                f"Email: {request.email}\n"
                f"Role: {request.role or 'Not provided'}\n"
                f"Subject: {request.subject or 'Not provided'}\n\n"
                f"Message:\n{request.message}"
            ),
        )
        message["Reply-To"] = request.email
        await asyncio.to_thread(self._deliver, message)

    def _new_message(self, subject: str, recipient: str, body: str) -> EmailMessage:
        message = EmailMessage()
        message["Subject"] = subject
        message["From"] = formataddr(
            (self.settings.smtp_sender_name, str(self.settings.smtp_sender_email))
        )
        message["To"] = recipient
        message.set_content(body)
        return message

    def _deliver(self, message: EmailMessage) -> None:
        self._require_smtp_configuration()
        smtp_host = self.settings.smtp_host
        if not smtp_host:
            raise EmailConfigurationError("SMTP host is not configured")
        password = self.settings.smtp_password.get_secret_value() if self.settings.smtp_password else None
        try:
            if self.settings.smtp_use_ssl:
                with smtplib.SMTP_SSL(
                    smtp_host,
                    self.settings.smtp_port,
                    timeout=self.settings.smtp_timeout_seconds,
                    context=ssl.create_default_context(),
                ) as client:
                    if self.settings.smtp_username:
                        client.login(self.settings.smtp_username, password or "")
                    client.send_message(message)
                return

            with smtplib.SMTP(
                smtp_host,
                self.settings.smtp_port,
                timeout=self.settings.smtp_timeout_seconds,
            ) as client:
                client.ehlo()
                if self.settings.smtp_use_starttls:
                    client.starttls(context=ssl.create_default_context())
                    client.ehlo()
                if self.settings.smtp_username:
                    client.login(self.settings.smtp_username, password or "")
                client.send_message(message)
        except (OSError, smtplib.SMTPException) as exc:
            raise EmailDeliveryError("SMTP delivery failed") from exc
