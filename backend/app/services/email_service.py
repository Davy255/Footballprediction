"""
Email service for transactional emails:
- Password reset emails
- Welcome / Account creation emails
- Prediction points settlement notifications
"""
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("email.service")


_LAST_EMAIL_ERROR: str = ""


def get_last_email_error() -> str:
    return _LAST_EMAIL_ERROR


def send_raw_email(to_email: str, subject: str, html_content: str, text_content: str = "") -> bool:
    """
    Sends an HTML email using configured HTTPS APIs (Resend, Brevo) or traditional SMTP.
    HTTPS APIs (Port 443) are prioritized as cloud providers (like Render) block outbound SMTP ports.
    """
    global _LAST_EMAIL_ERROR
    _LAST_EMAIL_ERROR = ""
    import json
    import urllib.request
    import urllib.error
    import ssl

    clean_user = (settings.SMTP_USER or "").strip()
    from_addr = (settings.SMTP_FROM_EMAIL or clean_user or "no-reply@footballpredict.com").strip()
    from_header = f"{settings.SMTP_FROM_NAME} <{from_addr}>"

    # 1. Primary Cloud Dispatch: Resend REST HTTPS API (Port 443 - 100% unblocked)
    import os
    resend_key = os.environ.get("RESEND_API_KEY", "").strip() or getattr(settings, "RESEND_API_KEY", "").strip()
    if resend_key and len(resend_key) > 5:
        try:
            # Use the configured FROM email, or fall back to the Resend onboarding address
            # IMPORTANT: onboarding@resend.dev only delivers to the Resend account owner's email.
            # To deliver to ALL users you need either:
            #   a) A Resend-verified domain (e.g. noreply@footballpredict.com), OR
            #   b) A Resend-verified email address (e.g. footballlpredict@gmail.com).
            # We use the SMTP_FROM_EMAIL setting so it's configurable via Render env vars.
            configured_from = (os.environ.get("SMTP_FROM_EMAIL", "") or getattr(settings, "SMTP_FROM_EMAIL", "")).strip()
            from_name = (os.environ.get("SMTP_FROM_NAME", "") or getattr(settings, "SMTP_FROM_NAME", "FootballPredict âš½")).strip()

            if configured_from and "@" in configured_from and "footballpredict.com" not in configured_from:
                # Use the admin's verified email address as sender (e.g. footballlpredict@gmail.com)
                sender_email = f"{from_name} <{configured_from}>"
            else:
                # Fallback: Resend sandbox â€” NOTE: only delivers to resend account owner!
                sender_email = f"{from_name} <onboarding@resend.dev>"
                logger.warning(
                    "âš ï¸  Using Resend sandbox sender (onboarding@resend.dev). "
                    "Emails will ONLY reach the Resend account owner. "
                    "Set SMTP_FROM_EMAIL=footballlpredict@gmail.com in Render env vars and verify it in Resend dashboard."
                )

            resend_payload = {
                "from": sender_email,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if text_content:
                resend_payload["text"] = text_content

            req = urllib.request.Request(
                "https://api.resend.com/emails",
                data=json.dumps(resend_payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {resend_key.strip()}",
                    "Content-Type": "application/json",
                    "User-Agent": "FootballPredict-Mailer/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_body = resp.read().decode("utf-8", errors="ignore")
                if resp.status in (200, 201):
                    logger.info(f"âœ… Email delivered via Resend HTTPS API to {to_email} ('{subject}') from '{sender_email}'")
                    return True
                else:
                    _LAST_EMAIL_ERROR = f"Resend API returned status {resp.status}: {resp_body}"
                    logger.error(f"âŒ Resend API non-success {resp.status} for {to_email}: {resp_body} â€” falling back to SMTP")
                    # Fall through to SMTP below
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            _LAST_EMAIL_ERROR = f"Resend API HTTP {he.code}: {err_body}"
            logger.error(f"âŒ Resend API HTTP {he.code} for {to_email}: {err_body} â€” falling back to SMTP")
            # Fall through to SMTP below
        except Exception as e:
            _LAST_EMAIL_ERROR = f"Resend API error: {e}"
            logger.error(f"âŒ Resend API error for {to_email}: {e} â€” falling back to SMTP")
      # 2. Secondary Cloud Dispatch: Brevo REST HTTPS API (Port 443 - 100% unblocked)
    brevo_key = os.environ.get("BREVO_API_KEY", "").strip() or getattr(settings, "BREVO_API_KEY", "").strip()
    if brevo_key and len(brevo_key.strip()) > 5:
        try:
            brevo_from = (os.environ.get("SMTP_FROM_EMAIL", "") or getattr(settings, "SMTP_FROM_EMAIL", "")).strip() or from_addr
            brevo_payload = {
                "sender": {"name": settings.SMTP_FROM_NAME, "email": brevo_from if "@" in brevo_from else "admin@footballpredict.com"},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content,
            }
            if text_content:
                brevo_payload["textContent"] = text_content

            req = urllib.request.Request(
                "https://api.brevo.com/v3/smtp/email",
                data=json.dumps(brevo_payload).encode("utf-8"),
                headers={
                    "api-key": brevo_key.strip(),
                    "Content-Type": "application/json",
                    "User-Agent": "FootballPredict-Mailer/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 201):
                    logger.info(f"✅ Email delivered via Brevo HTTPS API to {to_email} ('{subject}')")
                    return True
        except Exception as e:
            _LAST_EMAIL_ERROR = f"Brevo API error: {e}"
            logger.error(f"❌ Brevo API delivery failed to {to_email}: {e}")

    # 3. Tertiary Cloud Dispatch: SendGrid REST HTTPS API (Port 443 - 100% unblocked)
    sendgrid_key = os.environ.get("SENDGRID_API_KEY", "").strip() or getattr(settings, "SENDGRID_API_KEY", "").strip()
    if sendgrid_key and len(sendgrid_key) > 5:
        try:
            sg_from = (os.environ.get("SMTP_FROM_EMAIL", "") or getattr(settings, "SMTP_FROM_EMAIL", "")).strip() or from_addr
            sendgrid_payload = {
                "personalizations": [{"to": [{"email": to_email}]}],
                "from": {"email": sg_from, "name": settings.SMTP_FROM_NAME},
                "subject": subject,
                "content": [{"type": "text/html", "value": html_content}],
            }
            if text_content:
                sendgrid_payload["content"].insert(0, {"type": "text/plain", "value": text_content})

            req = urllib.request.Request(
                "https://api.sendgrid.com/v3/mail/send",
                data=json.dumps(sendgrid_payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {sendgrid_key.strip()}",
                    "Content-Type": "application/json",
                    "User-Agent": "FootballPredict-Mailer/1.0",
                },
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                if resp.status in (200, 202):
                    logger.info(f"✅ Email delivered via SendGrid HTTPS API to {to_email} ('{subject}')")
                    return True
        except Exception as e:
            _LAST_EMAIL_ERROR = f"SendGrid API error: {e}"
            logger.error(f"❌ SendGrid API delivery failed to {to_email}: {e}")

    # 4. Traditional SMTP Dispatch
    # Read directly from os.environ to get Render env vars (settings object may be cached from startup)
    import os as _os
    smtp_host_env  = _os.environ.get("SMTP_HOST",       "").strip() or (settings.SMTP_HOST       or "").strip()
    smtp_user_env  = _os.environ.get("SMTP_USER",       "").strip() or (settings.SMTP_USER       or "").strip()
    smtp_port_env  = int(_os.environ.get("SMTP_PORT",   str(settings.SMTP_PORT or 587)))
    smtp_from_env  = _os.environ.get("SMTP_FROM_EMAIL", "").strip() or (settings.SMTP_FROM_EMAIL or "").strip()
    smtp_name_env  = _os.environ.get("SMTP_FROM_NAME",  "").strip() or (settings.SMTP_FROM_NAME  or "FootballPredict âš½").strip()
    smtp_tls_env   = _os.environ.get("SMTP_TLS", "true").strip().lower() not in ("false", "0", "no")

    logger.info(
        f"ðŸ“§ SMTP config check â†’ host={smtp_host_env!r} port={smtp_port_env} "
        f"user={smtp_user_env!r} from={smtp_from_env!r} tls={smtp_tls_env} "
        f"password_set={'yes' if smtp_pass_env else 'NO'}"
    )

    if not smtp_host_env or not smtp_user_env:
        logger.warning(
            f"âš ï¸  SMTP not configured (SMTP_HOST={smtp_host_env!r}, SMTP_USER={smtp_user_env!r}). "
            "No email dispatched. Add SMTP_HOST, SMTP_USER, SMTP_PASSWORD to Render env vars."
        )
        _LAST_EMAIL_ERROR = "SMTP not configured â€” SMTP_HOST or SMTP_USER missing"
        return False

    effective_from = smtp_from_env or smtp_user_env
    from_header_smtp = f"{smtp_name_env} <{effective_from}>"
    clean_password = smtp_pass_env.replace(" ", "")

    try:
        import ssl
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_header_smtp
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        context = ssl.create_default_context()

        if smtp_port_env == 465:
            with smtplib.SMTP_SSL(smtp_host_env, smtp_port_env, context=context, timeout=20) as server:
                server.ehlo()
                if clean_password:
                    server.login(smtp_user_env, clean_password)
                server.sendmail(effective_from, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(smtp_host_env, smtp_port_env, timeout=20) as server:
                server.ehlo()
                if smtp_tls_env:
                    server.starttls(context=context)
                    server.ehlo()
                if clean_password:
                    server.login(smtp_user_env, clean_password)
                server.sendmail(effective_from, [to_email], msg.as_string())

        logger.info(f"âœ… Email delivered via SMTP ({smtp_host_env}:{smtp_port_env}) to {to_email} | subject: '{subject}'")
        return True
    except Exception as e:
        _LAST_EMAIL_ERROR = str(e)
        logger.error(f"âŒ SMTP delivery failed to {to_email} via {smtp_host_env}:{smtp_port_env}: {e}")
        return False



def send_password_reset_email(to_email: str, reset_token: str, username: str = "") -> bool:
    """
    Sends a styled Password Reset email with a direct link and visible reset code.
    """
    import os as _os
    frontend_base = _os.environ.get("FRONTEND_URL", "").strip() or settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base:
        frontend_base = "https://footballprediction-lovat.vercel.app"

    reset_url = f"{frontend_base}/forgot-password?token={reset_token}"
    greeting = f"Hello {username}," if username else "Hello,"

    subject = "ðŸ”‘ Reset Your FootballPredict Password"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f19;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background:linear-gradient(180deg,#131b2e 0%,#0f172a 100%);border-radius:16px;border:1px solid rgba(59,130,246,0.25);overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.5);">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.07);">
            <div style="font-size:28px;margin-bottom:6px;">âš½</div>
            <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.3px;">FootballPredict</h1>
            <p style="margin:4px 0 0;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">AI-Powered Match Intelligence</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:700;color:#fff;">Password Reset Request</h2>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#94a3b8;">
              {greeting} We received a request to reset the password on your FootballPredict account.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#94a3b8;">
              Click the button below to set a new password. This link expires in <strong style="color:#60a5fa;">15 minutes</strong>.
            </p>

            <!-- CTA -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:24px 0;">
              <tr><td align="center">
                <a href="{reset_url}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%);color:#fff;text-decoration:none;padding:14px 36px;font-size:16px;font-weight:700;border-radius:10px;box-shadow:0 4px 15px rgba(37,99,235,0.45);">
                  Reset My Password â†’
                </a>
              </td></tr>
            </table>

            <!-- Reset Code Box -->
            <div style="background:rgba(0,0,0,0.35);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:16px;margin-top:20px;">
              <p style="margin:0 0 8px;font-size:11px;color:#475569;text-transform:uppercase;font-weight:700;letter-spacing:0.8px;">Or use this reset code manually</p>
              <code style="font-family:monospace;font-size:13px;color:#38bdf8;word-break:break-all;line-height:1.6;">{reset_token}</code>
            </div>

            <p style="margin:20px 0 0;font-size:13px;line-height:1.6;color:#475569;">
              If you didn't request this, simply ignore this email â€” your password won't change.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;background-color:#070b14;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:#334155;">Â© 2026 FootballPredict Â· AI Match Intelligence Platform</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text_content = f"""{greeting}

We received a request to reset your FootballPredict password.

Reset link (valid 15 minutes):
{reset_url}

Or use this code manually:
{reset_token}

If you did not request this, ignore this email.

â€” FootballPredict Team
"""

    return send_raw_email(to_email, subject, html_content, text_content)


def send_welcome_email(to_email: str, username: str) -> bool:
    """
    Sends a Welcome email focused on AI betting analytics and match predictions.
    """
    import os as _os
    frontend_base = _os.environ.get("FRONTEND_URL", "").strip() or settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base:
        frontend_base = "https://footballprediction-lovat.vercel.app"

    subject = "âš½ Welcome to FootballPredict â€” Your AI Betting Edge Starts Here"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to FootballPredict</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f19;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background:linear-gradient(180deg,#0f1e38 0%,#0a1528 100%);border-radius:18px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.6);">

        <!-- Hero Header -->
        <tr>
          <td style="padding:36px 32px 28px;text-align:center;background:linear-gradient(135deg,#0f2347 0%,#0a1a35 100%);border-bottom:1px solid rgba(255,255,255,0.07);">
            <div style="font-size:36px;margin-bottom:10px;">âš½ ðŸ¤–</div>
            <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Welcome, {username}!</h1>
            <p style="margin:0;font-size:14px;color:#64748b;letter-spacing:0.5px;">Your AI-Powered Football Intelligence Platform</p>
          </td>
        </tr>

        <!-- Intro -->
        <tr>
          <td style="padding:28px 32px 0;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#cbd5e1;">
              You've joined <strong style="color:#60a5fa;">FootballPredict</strong> â€” the platform built to give you a <strong style="color:#fff;">real analytical edge</strong> before you place a bet on Betway, Sportpesa, 1xBet, or any other bookmaker.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#94a3b8;">
              We analyse hundreds of data points per match â€” form, head-to-head records, goal averages, home/away strength, and bookmaker odds â€” to deliver <strong style="color:#fff;">clear, data-backed predictions</strong> for every fixture.
            </p>
          </td>
        </tr>

        <!-- Feature Cards -->
        <tr>
          <td style="padding:0 32px 28px;">
            <h3 style="margin:0 0 14px;font-size:15px;font-weight:700;color:#fff;">What you get on every match:</h3>

            <!-- Card 1 -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.18);border-radius:10px;margin-bottom:10px;">
              <tr>
                <td style="padding:14px 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="36" style="font-size:22px;vertical-align:middle;">ðŸ“Š</td>
                      <td style="padding-left:10px;vertical-align:middle;">
                        <strong style="color:#93c5fd;font-size:14px;">Win Probability %</strong>
                        <p style="margin:3px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">AI-calculated Home Win / Draw / Away Win chances for every game</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Card 2 -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.18);border-radius:10px;margin-bottom:10px;">
              <tr>
                <td style="padding:14px 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="36" style="font-size:22px;vertical-align:middle;">ðŸŽ¯</td>
                      <td style="padding-left:10px;vertical-align:middle;">
                        <strong style="color:#6ee7b7;font-size:14px;">Projected Scoreline</strong>
                        <p style="margin:3px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">AI-predicted final score based on attack/defence strength and form</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Card 3 -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(139,92,246,0.08);border:1px solid rgba(139,92,246,0.18);border-radius:10px;margin-bottom:10px;">
              <tr>
                <td style="padding:14px 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="36" style="font-size:22px;vertical-align:middle;">âš¡</td>
                      <td style="padding-left:10px;vertical-align:middle;">
                        <strong style="color:#c4b5fd;font-size:14px;">BTTS &amp; Over/Under Tips</strong>
                        <p style="margin:3px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">Both Teams to Score and Over/Under 2.5 Goals insights per fixture</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- Card 4 -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.18);border-radius:10px;margin-bottom:0;">
              <tr>
                <td style="padding:14px 16px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td width="36" style="font-size:22px;vertical-align:middle;">ðŸ¤–</td>
                      <td style="padding-left:10px;vertical-align:middle;">
                        <strong style="color:#fcd34d;font-size:14px;">Coach AI â€” Your Personal Analyst</strong>
                        <p style="margin:3px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">Ask any match question and get instant AI analysis, team news, and betting advice</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- How to use -->
        <tr>
          <td style="padding:0 32px 28px;">
            <div style="background:rgba(0,0,0,0.3);border-radius:10px;padding:18px 20px;border-left:3px solid #3b82f6;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.5px;">ðŸ’¡ How to use FootballPredict</p>
              <ol style="margin:0;padding-left:18px;color:#94a3b8;font-size:14px;line-height:2;">
                <li>Browse today's fixtures and click any match</li>
                <li>Review the AI win probabilities and projected score</li>
                <li>Check the BTTS and Over/Under recommendations</li>
                <li>Use Coach AI to ask deeper questions about the match</li>
                <li>Place your bet on your bookmaker with confidence</li>
              </ol>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr><td align="center">
                <a href="{frontend_base}/" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff;text-decoration:none;padding:15px 40px;font-size:16px;font-weight:700;border-radius:11px;box-shadow:0 4px 20px rgba(37,99,235,0.45);">
                  View Today's Predictions â†’
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;background-color:#060b14;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;font-size:12px;color:#334155;">Â© 2026 FootballPredict Â· AI Match Intelligence Â· <a href="{frontend_base}/" style="color:#475569;text-decoration:none;">Visit Platform</a></p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text_content = f"""Welcome to FootballPredict, {username}!

Your AI-powered betting intelligence platform is ready.

What you get on every match:
â€¢ AI Win Probability % (Home / Draw / Away)
â€¢ Projected Final Scoreline
â€¢ BTTS & Over/Under 2.5 Tips
â€¢ Coach AI â€” ask any match question and get instant analysis

How to use it:
1. Browse today's fixtures
2. Check the AI predictions and win probabilities
3. Review BTTS / Over/Under tips
4. Use Coach AI for deeper analysis
5. Bet smarter on Betway, Sportpesa, 1xBet, or any bookmaker

View today's predictions: {frontend_base}/

â€” FootballPredict Team
"""

    return send_raw_email(to_email, subject, html_content, text_content)


def send_daily_match_reminder_email(to_email: str, username: str, featured_matches: list = None) -> bool:
    """
    Sends a Daily Match Digest with AI tips and predictions for today's top games.
    """
    import os as _os
    from datetime import datetime
    frontend_base = _os.environ.get("FRONTEND_URL", "").strip() or settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base:
        frontend_base = "https://footballprediction-lovat.vercel.app"

    today_str = datetime.now().strftime("%A, %d %B %Y")
    subject = f"âš½ Today's Betting Tips â€” {datetime.now().strftime('%d %b')} | FootballPredict AI"

    # Build match cards HTML
    match_cards_html = ""
    if featured_matches:
        tip_labels = ["Home Win", "Draw", "Away Win", "Both Teams Score", "Over 2.5 Goals", "Under 2.5 Goals"]
        for i, m in enumerate(featured_matches[:5]):
            # Extract match details (works for ORM objects or dicts)
            if hasattr(m, 'home_team'):
                home_name  = getattr(m.home_team, 'name', 'Home Team') if m.home_team else 'Home Team'
                away_name  = getattr(m.away_team, 'name', 'Away Team') if m.away_team else 'Away Team'
                league_name = getattr(m.league, 'name', 'League') if m.league else 'League'
            elif isinstance(m, dict):
                home_name   = m.get('home_team', 'Home Team')
                away_name   = m.get('away_team', 'Away Team')
                league_name = m.get('league', 'League')
            else:
                home_name = away_name = league_name = 'Match'

            time_str = str(getattr(m, 'utc_date', '') or '')[:16].replace('T', ' ') if not isinstance(m, dict) else str(m.get('utc_date', ''))[:16].replace('T', ' ')

            # AI probabilities
            ai_home = getattr(m, 'ai_home_prob', None) if not isinstance(m, dict) else m.get('ai_home_prob')
            ai_draw = getattr(m, 'ai_draw_prob', None) if not isinstance(m, dict) else m.get('ai_draw_prob')
            ai_away = getattr(m, 'ai_away_prob', None) if not isinstance(m, dict) else m.get('ai_away_prob')
            pred_h  = getattr(m, 'ai_predicted_home', None) if not isinstance(m, dict) else m.get('ai_predicted_home')
            pred_a  = getattr(m, 'ai_predicted_away', None) if not isinstance(m, dict) else m.get('ai_predicted_away')

            # Build probability bar
            if ai_home and ai_draw and ai_away:
                h_pct = int(round(ai_home * 100))
                d_pct = int(round(ai_draw * 100))
                a_pct = int(round(ai_away * 100))
                # Determine tip
                max_prob = max(ai_home, ai_draw, ai_away)
                if max_prob == ai_home:
                    tip_text = f"Home Win ({h_pct}%)"
                    tip_color = "#10b981"
                elif max_prob == ai_away:
                    tip_text = f"Away Win ({a_pct}%)"
                    tip_color = "#f59e0b"
                else:
                    tip_text = f"Draw ({d_pct}%)"
                    tip_color = "#8b5cf6"

                prob_html = f"""
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin:10px 0 8px;">
                  <tr>
                    <td width="{h_pct}%" style="background:#10b981;height:6px;border-radius:3px 0 0 3px;"></td>
                    <td width="{d_pct}%" style="background:#8b5cf6;height:6px;"></td>
                    <td width="{a_pct}%" style="background:#f59e0b;height:6px;border-radius:0 3px 3px 0;"></td>
                  </tr>
                </table>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-size:11px;color:#10b981;">H {h_pct}%</td>
                    <td align="center" style="font-size:11px;color:#8b5cf6;">D {d_pct}%</td>
                    <td align="right" style="font-size:11px;color:#f59e0b;">A {a_pct}%</td>
                  </tr>
                </table>"""
                tip_badge = f'<span style="display:inline-block;background:{tip_color};color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-top:6px;">ðŸŽ¯ Tip: {tip_text}</span>'
            else:
                prob_html = ""
                tip_badge = '<span style="display:inline-block;background:#1e3a5f;color:#60a5fa;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;margin-top:6px;">ðŸ“Š View Full Analysis</span>'

            score_html = f'<span style="color:#94a3b8;font-size:12px;">Projected: <strong style="color:#fff;">{int(pred_h)}-{int(pred_a)}</strong></span>' if pred_h is not None and pred_a is not None else ""

            match_cards_html += f"""
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:10px;margin-bottom:12px;">
              <tr>
                <td style="padding:14px 16px;">
                  <p style="margin:0 0 2px;font-size:11px;color:#60a5fa;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">{league_name} Â· {time_str} UTC</p>
                  <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#fff;">{home_name} <span style="color:#475569;">vs</span> {away_name}</p>
                  {prob_html}
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top:6px;">
                    <tr>
                      <td>{tip_badge}</td>
                      <td align="right">{score_html}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>"""
    else:
        match_cards_html = """
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background:rgba(15,23,42,0.6);border:1px solid rgba(59,130,246,0.15);border-radius:10px;">
          <tr><td style="padding:20px;text-align:center;">
            <div style="font-size:28px;margin-bottom:8px;">ðŸ“…</div>
            <p style="margin:0;font-size:14px;color:#94a3b8;line-height:1.6;">
              Top games are scheduled today across the Premier League, La Liga, Serie A, Bundesliga and Champions League.<br>
              <strong style="color:#60a5fa;">Visit the platform for full AI predictions and tips.</strong>
            </p>
          </td></tr>
        </table>"""

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Today's Betting Tips</title>
</head>
<body style="margin:0;padding:0;background-color:#0b0f19;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0b0f19;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background:linear-gradient(180deg,#0f1e38 0%,#0a1528 100%);border-radius:18px;border:1px solid rgba(59,130,246,0.2);overflow:hidden;box-shadow:0 24px 48px rgba(0,0,0,0.6);">

        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 22px;text-align:center;background:linear-gradient(135deg,#0f2347 0%,#0a1a35 100%);border-bottom:1px solid rgba(255,255,255,0.07);">
            <div style="font-size:30px;margin-bottom:8px;">âš½ ðŸ”¥</div>
            <h1 style="margin:0 0 4px;font-size:22px;font-weight:800;color:#fff;">Today's AI Betting Tips</h1>
            <p style="margin:0;font-size:13px;color:#64748b;">{today_str}</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 32px 16px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#cbd5e1;">
              Hey <strong style="color:#fff;">{username}</strong>! Here are today's top fixtures with AI-powered predictions to help you bet smarter. Analyse each match, check the win probabilities, and make your move before kickoff. ðŸŽ¯
            </p>
          </td>
        </tr>

        <!-- Match Cards -->
        <tr>
          <td style="padding:0 32px 20px;">
            {match_cards_html}
          </td>
        </tr>

        <!-- Tip Box -->
        <tr>
          <td style="padding:0 32px 24px;">
            <div style="background:rgba(37,99,235,0.1);border:1px solid rgba(59,130,246,0.2);border-radius:10px;padding:14px 16px;">
              <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#60a5fa;text-transform:uppercase;letter-spacing:0.5px;">ðŸ’¡ Today's Betting Reminder</p>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Always check our <strong style="color:#fff;">Coach AI</strong> before placing bets â€” ask about team news, injuries, or head-to-head history for any fixture.
                Combine our AI tips with your own research for the best results.
              </p>
            </div>
          </td>
        </tr>

        <!-- CTA -->
        <tr>
          <td style="padding:0 32px 32px;">
            <table width="100%" border="0" cellspacing="0" cellpadding="0">
              <tr><td align="center">
                <a href="{frontend_base}/" style="display:inline-block;background:linear-gradient(135deg,#2563eb 0%,#7c3aed 100%);color:#fff;text-decoration:none;padding:15px 40px;font-size:16px;font-weight:700;border-radius:11px;box-shadow:0 4px 20px rgba(37,99,235,0.45);">
                  View Full Predictions &amp; Analytics â†’
                </a>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:18px 32px;background-color:#060b14;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0 0 4px;font-size:12px;color:#334155;">Â© 2026 FootballPredict Â· AI Match Intelligence Platform</p>
            <p style="margin:0;font-size:11px;color:#1e293b;">You're receiving this because you have a FootballPredict account.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

    text_content = f"""Hey {username}! Today's AI Betting Tips â€” {today_str}

Here are today's top fixtures with AI predictions to help you bet smarter.

Visit FootballPredict for full match analysis, win probabilities, BTTS tips, Over/Under predictions and Coach AI:
{frontend_base}/

Remember to check Coach AI before placing any bet â€” ask about team news, injuries, or head-to-head records.

â€” FootballPredict Team
Â© 2026 FootballPredict Â· AI Match Intelligence
"""

    return send_raw_email(to_email, subject, html_content, text_content)


def dispatch_daily_reminders_to_all_users() -> dict:
    """
    Finds today's scheduled matches and sends the Daily Reminder to all active registered users.
    """
    from app.core.database import SessionLocal
    from app.models.user import User
    from app.models.match import Match
    from datetime import date, datetime, timedelta

    db = SessionLocal()
    try:
        users = db.query(User).filter(User.is_active == True).all()
        today = date.today()
        tomorrow = today + timedelta(days=1)

        today_matches = db.query(Match).filter(
            Match.utc_date >= datetime.combine(today, datetime.min.time()),
            Match.utc_date < datetime.combine(tomorrow, datetime.max.time()),
            Match.status.in_(["SCHEDULED", "TIMED"]),
        ).order_by(Match.utc_date).limit(5).all()

        sent_count = 0
        for u in users:
            if u.email and "@" in u.email:
                success = send_daily_match_reminder_email(u.email, u.username, today_matches)
                if success:
                    sent_count += 1

        logger.info(f"ðŸ“§ Dispatched {sent_count}/{len(users)} daily match reminders.")
        return {"users_total": len(users), "sent_count": sent_count, "matches_count": len(today_matches)}
    except Exception as e:
        logger.error(f"Error in dispatch_daily_reminders_to_all_users: {e}")
        return {"error": str(e)}
    finally:
        db.close()

