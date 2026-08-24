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
            sender_email = "FootballPredict <onboarding@resend.dev>"
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
                if resp.status in (200, 201):
                    logger.info(f"✅ Email delivered via Resend HTTPS API to {to_email} ('{subject}')")
                    return True
        except urllib.error.HTTPError as he:
            err_body = he.read().decode("utf-8", errors="ignore")
            _LAST_EMAIL_ERROR = f"Resend API HTTP {he.code}: {err_body}"
            logger.error(f"❌ Resend API HTTP error sending to {to_email}: {he.code} - {err_body}")
            return False
        except Exception as e:
            _LAST_EMAIL_ERROR = f"Resend API error: {e}"
            logger.error(f"❌ Resend API delivery failed to {to_email}: {e}")
            return False

    # 2. Secondary Cloud Dispatch: Brevo REST HTTPS API (Port 443 - 100% unblocked)
    brevo_key = getattr(settings, "BREVO_API_KEY", "")
    if brevo_key and len(brevo_key.strip()) > 5:
        try:
            brevo_payload = {
                "sender": {"name": settings.SMTP_FROM_NAME, "email": from_addr if "@" in from_addr else "admin@footballpredict.com"},
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

    # 3. Traditional SMTP Dispatch
    if not settings.SMTP_HOST or not settings.SMTP_USER:
        logger.info(f"📧 [DEV EMAIL MODE] Email to: {to_email} | Subject: '{subject}'")
        logger.info(f"📧 [DEV EMAIL CONTENT Preview]:\n{text_content or html_content[:300]}...")
        return True

    clean_host = settings.SMTP_HOST.strip()
    clean_password = (settings.SMTP_PASSWORD or "").replace(" ", "").strip()
    clean_port = int(settings.SMTP_PORT or 587)

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = from_header
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain", "utf-8"))
        msg.attach(MIMEText(html_content, "html", "utf-8"))

        context = ssl.create_default_context()

        if clean_port == 465:
            with smtplib.SMTP_SSL(clean_host, clean_port, context=context, timeout=20) as server:
                server.ehlo()
                if clean_password:
                    server.login(clean_user, clean_password)
                server.sendmail(from_addr, [to_email], msg.as_string())
        else:
            with smtplib.SMTP(clean_host, clean_port, timeout=20) as server:
                server.ehlo()
                if settings.SMTP_TLS:
                    server.starttls(context=context)
                    server.ehlo()
                if clean_password:
                    server.login(clean_user, clean_password)
                server.sendmail(from_addr, [to_email], msg.as_string())

        logger.info(f"✅ Email successfully delivered to {to_email} with subject: '{subject}'")
        return True
    except Exception as e:
        _LAST_EMAIL_ERROR = str(e)
        logger.error(f"❌ Failed to deliver email to {to_email} via {clean_host}:{clean_port}: {e}")
        return False


def send_password_reset_email(to_email: str, reset_token: str, username: str = "") -> bool:
    """
    Sends a styled Password Reset email with a direct recovery link.
    """
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base and "vercel.app" not in frontend_base:
        frontend_base = "https://footballprediction-vertex-digital3.vercel.app"

    reset_url = f"{frontend_base}/forgot-password?token={reset_token}"
    greeting = f"Hello {username}," if username else "Hello,"

    subject = "🔑 Reset Your FootballPredict Password"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #131b2e 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.2); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 32px; margin-bottom: 8px;">⚽</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">FootballPredict</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 16px 0; font-size: 20px; font-weight: 700; color: #ffffff;">Password Reset Request</h2>
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                {greeting} We received a request to reset the password for your FootballPredict account.
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Click the button below to choose a new secure password. This link is valid for <strong style="color: #60a5fa;">15 minutes</strong>.
              </p>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{reset_url}" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);">
                      Reset Password →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Reset Token Fallback -->
              <div style="background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 14px; margin-top: 24px;">
                <p style="margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Manual Reset Token</p>
                <code style="font-family: monospace; font-size: 12px; color: #60a5fa; word-break: break-all;">{reset_token}</code>
              </div>

              <p style="margin: 24px 0 0 0; font-size: 13px; line-height: 1.5; color: #64748b;">
                If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #090d16; border-top: 1px solid rgba(255,255,255,0.06); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © 2026 FootballPredict Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_content = f"""{greeting}

We received a request to reset the password for your FootballPredict account.

Click the link below to choose a new password (valid for 15 minutes):
{reset_url}

Your Reset Token:
{reset_token}

If you did not request this, please ignore this email.
"""

    return send_raw_email(to_email, subject, html_content, text_content)


def send_welcome_email(to_email: str, username: str) -> bool:
    """
    Sends a Welcome onboarding email when a new user registers.
    """
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base and "vercel.app" not in frontend_base:
        frontend_base = "https://footballprediction-vertex-digital3.vercel.app"

    subject = "🎉 Welcome to FootballPredict! Let's get predicting ⚽"

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to FootballPredict</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background: linear-gradient(180deg, #131b2e 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.2); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 32px; margin-bottom: 8px;">⚽🏆</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Welcome, {username}!</h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                Your account is ready. You now have full access to real-time football predictions, live match feeds, and statistical match projections.
              </p>

              <h3 style="margin: 24px 0 12px 0; font-size: 16px; color: #ffffff;">Quick Ways to Earn Points:</h3>
              <ul style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px; line-height: 1.8;">
                <li><strong style="color: #60a5fa;">+5 Points:</strong> Predict the Exact Score (e.g. 2-1)</li>
                <li><strong style="color: #60a5fa;">+3 Points:</strong> Predict the Match Winner (1X2)</li>
                <li><strong style="color: #60a5fa;">+2 Points:</strong> Predict Both Teams To Score (BTTS)</li>
                <li><strong style="color: #60a5fa;">+2 Points:</strong> Predict Over/Under 2.5 Goals</li>
              </ul>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{frontend_base}/fixtures" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; font-size: 16px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);">
                      Browse Upcoming Fixtures →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #090d16; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © 2026 FootballPredict Platform.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_content = f"""Welcome, {username}!

Your FootballPredict account is ready.
Start predicting matches and earning points:
{frontend_base}/fixtures

Scoring Rules:
• +5 pts: Exact Score
• +3 pts: Outcome Winner
• +2 pts: BTTS & Over/Under 2.5
"""

    return send_raw_email(to_email, subject, html_content, text_content)


def send_daily_match_reminder_email(to_email: str, username: str, featured_matches: list = None) -> bool:
    """
    Sends a Daily Match Digest & Reminder email with today's featured fixtures.
    """
    frontend_base = settings.FRONTEND_URL.rstrip("/")
    if "localhost" in frontend_base and "vercel.app" not in frontend_base:
        frontend_base = "https://footballprediction-lovat.vercel.app"

    subject = "⚽ Today's Big Matches & AI Projections — Make Your Picks!"

    match_rows_html = ""
    if featured_matches:
        for m in featured_matches[:5]:
            home_name = getattr(m.home_team, 'name', 'Home Team') if hasattr(m, 'home_team') else (m.get('home_team', 'Home') if isinstance(m, dict) else 'Home')
            away_name = getattr(m.away_team, 'name', 'Away Team') if hasattr(m, 'away_team') else (m.get('away_team', 'Away') if isinstance(m, dict) else 'Away')
            league_name = getattr(m.league, 'name', 'League') if hasattr(m, 'league') else (m.get('league', 'League') if isinstance(m, dict) else 'League')
            time_str = str(getattr(m, 'utc_date', 'Today'))[:16].replace('T', ' ')
            match_rows_html += f"""
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
              <td style="padding: 12px 8px; color: #60a5fa; font-size: 13px; font-weight: 700;">{league_name}</td>
              <td style="padding: 12px 8px; color: #ffffff; font-size: 14px; font-weight: 600;">{home_name} vs {away_name}</td>
              <td style="padding: 12px 8px; color: #94a3b8; font-size: 12px; text-align: right;">{time_str}</td>
            </tr>
            """
    else:
        match_rows_html = """
        <tr>
          <td colspan="3" style="padding: 16px; text-align: center; color: #94a3b8; font-size: 14px;">
            Exciting games are scheduled across the Premier League, La Liga, Serie A and Champions League!
          </td>
        </tr>
        """

    html_content = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Daily Match Reminder</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background: linear-gradient(180deg, #131b2e 0%, #0f172a 100%); border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.25); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.06);">
              <div style="font-size: 32px; margin-bottom: 8px;">⚽🔥</div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff;">Today's Match Predictions</h1>
              <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 14px;">Daily Digest for {username}</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 18px 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Hello <strong>{username}</strong>! Don&apos;t miss today&apos;s matches. Lock in your predictions before kickoff to climb the community leaderboard!
              </p>

              <!-- Featured Matches Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: rgba(15, 23, 42, 0.6); border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); margin: 16px 0;">
                <thead>
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(59, 130, 246, 0.1);">
                    <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #60a5fa; text-transform: uppercase;">League</th>
                    <th style="padding: 10px 8px; text-align: left; font-size: 12px; color: #60a5fa; text-transform: uppercase;">Match</th>
                    <th style="padding: 10px 8px; text-align: right; font-size: 12px; color: #60a5fa; text-transform: uppercase;">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {match_rows_html}
                </tbody>
              </table>

              <!-- CTA Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="{frontend_base}/" style="display: inline-block; background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; font-size: 16px; font-weight: 700; border-radius: 10px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);">
                      Place Predictions &amp; View Stats →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0; font-size: 13px; color: #64748b; text-align: center;">
                Need tactical advice? Chat with <strong>Coach AI</strong> directly on the platform!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #090d16; text-align: center; border-top: 1px solid rgba(255,255,255,0.06);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                © 2026 FootballPredict Platform. You are receiving this because you registered for daily reminders.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    text_content = f"""Hello {username}!

Here are today's top football matches. Don't forget to submit your predictions and earn leaderboard points:
{frontend_base}/

© 2026 FootballPredict
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
        ).limit(10).all()

        sent_count = 0
        for u in users:
            if u.email and "@" in u.email:
                success = send_daily_match_reminder_email(u.email, u.username, today_matches)
                if success:
                    sent_count += 1

        logger.info(f"📧 Dispatched {sent_count} daily match reminders to active users.")
        return {"users_total": len(users), "sent_count": sent_count, "matches_count": len(today_matches)}
    except Exception as e:
        logger.error(f"Error in dispatch_daily_reminders_to_all_users: {e}")
        return {"error": str(e)}
    finally:
        db.close()

