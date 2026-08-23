"""
Professional PDF Generator for FootballPredict Platform Architecture & Full Documentation.
Uses ReportLab to generate a clean, executive-ready PDF document.
"""

import os
import sys
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            super().showPage()
        super().save()

    def draw_header_footer(self, page_count):
        if self._pageNumber == 1:
            return  # Suppress on cover page
        
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748b"))
        
        # Header
        self.drawString(54, 750, "FootballPredict — System Architecture & Technical Documentation")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 744, 558, 744)
        
        # Footer
        self.line(54, 48, 558, 48)
        self.drawString(54, 36, "Confidential & Proprietary — Vertex Digital")
        self.drawRightString(558, 36, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()


def build_pdf(filename="Football_Prediction_System_Architecture_and_Documentation.pdf"):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=60,
        bottomMargin=60
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#1e3a8a")     # Deep Blue
    accent_color = colors.HexColor("#2563eb")      # Royal Blue
    dark_neutral = colors.HexColor("#0f172a")      # Slate 900
    body_color = colors.HexColor("#334155")        # Slate 700
    bg_light = colors.HexColor("#f8fafc")          # Slate 50
    border_color = colors.HexColor("#e2e8f0")      # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=primary_color,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=20,
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=primary_color,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True,
    )

    h2_style = ParagraphStyle(
        'Heading2_Custom',
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=accent_color,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True,
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6,
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=body_color,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3,
    )

    code_style = ParagraphStyle(
        'Code_Custom',
        fontName='Courier',
        fontSize=8,
        leading=10.5,
        textColor=colors.HexColor("#0f172a"),
        backColor=colors.HexColor("#f1f5f9"),
        borderColor=colors.HexColor("#cbd5e1"),
        borderWidth=0.5,
        borderPadding=6,
        spaceBefore=4,
        spaceAfter=8,
    )

    story = []

    # ==========================================
    # COVER / TITLE BLOCK
    # ==========================================
    story.append(Spacer(1, 20))
    story.append(Paragraph("⚽ FootballPredict Platform", title_style))
    story.append(Paragraph("Full System Architecture, Technical Specification & Engineering Documentation", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=accent_color, spaceBefore=0, spaceAfter=15))

    meta_table_data = [
        [Paragraph("<b>System Release:</b>", body_style), Paragraph("v2.4 Enterprise Production", body_style)],
        [Paragraph("<b>Production Frontend:</b>", body_style), Paragraph("https://footballprediction-lovat.vercel.app", body_style)],
        [Paragraph("<b>Production Backend API:</b>", body_style), Paragraph("https://football-prediction-api-mmet.onrender.com", body_style)],
        [Paragraph("<b>AdSense Publisher ID:</b>", body_style), Paragraph("pub-3089881788835574", body_style)],
        [Paragraph("<b>Admin Account:</b>", body_style), Paragraph("Wes@254 (davidwesonga776@gmail.com)", body_style)],
        [Paragraph("<b>Classification:</b>", body_style), Paragraph("Technical & Architecture Blueprint", body_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[130, 374])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 15))

    # ==========================================
    # 1. EXECUTIVE SUMMARY & PLATFORM VISION
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Platform Overview", h1_style))
    story.append(Paragraph(
        "<b>FootballPredict</b> is a full-stack, enterprise-grade football intelligence and multi-market prediction "
        "ecosystem. The platform provides global football supporters with real-time match fixture schedules, live scores, "
        "head-to-head tactical metrics, expected goals (xG) projections, and statistical probabilities across 4 betting markets "
        "(1X2 Match Outcome, Over/Under 2.5 Goals, Both Teams to Score, and Double Chance).",
        body_style
    ))
    story.append(Paragraph(
        "Additionally, the platform incorporates an AI conversational assistant (<b>Coach AI</b>), a competitive community leaderboard "
        "with automated scoring rules, transactional email notifications (welcome & daily match digests), a secure administrative "
        "telemetry dashboard, and integrated <b>Google AdSense</b> monetization with GDPR-compliant privacy management.",
        body_style
    ))

    # ==========================================
    # 2. SYSTEM ARCHITECTURE & TOPOLOGY
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("2. System Architecture & Topology", h1_style))
    story.append(Paragraph(
        "The system employs a decoupled, cloud-native client-server architecture with high availability and automated CI/CD pipelines.",
        body_style
    ))

    arch_rows = [
        [Paragraph("<b>Layer</b>", body_style), Paragraph("<b>Technology Stack</b>", body_style), Paragraph("<b>Key Responsibilities</b>", body_style)],
        [
            Paragraph("<b>Frontend Client</b>", body_style),
            Paragraph("Next.js 16 (App Router), React 19, TypeScript, Turbopack, Tailwind CSS", body_style),
            Paragraph("Server & Client Components, responsive UI, date grouping, universal search, AdSense units, Coach AI modal, theme provider.", body_style)
        ],
        [
            Paragraph("<b>Backend API</b>", body_style),
            Paragraph("FastAPI, Python 3.14, Pydantic v2, Uvicorn, BackgroundTasks", body_style),
            Paragraph("RESTful endpoints, JWT security, Poisson ML engine, email dispatchers, rate limiters, admin telemetry.", body_style)
        ],
        [
            Paragraph("<b>Persistence Layer</b>", body_style),
            Paragraph("PostgreSQL / SQLite, SQLAlchemy ORM", body_style),
            Paragraph("Users, Matches, Leagues, Teams, Predictions, and Leaderboard aggregation schemas.", body_style)
        ],
        [
            Paragraph("<b>External Integrations</b>", body_style),
            Paragraph("football-data.org, The Odds API, Google AdSense, SMTP Server", body_style),
            Paragraph("Live match schedules, bookmaker odds feeds, ad serving, and transactional email deliverability.", body_style)
        ],
    ]
    arch_table = Table(arch_rows, colWidths=[95, 175, 234])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(arch_table)

    story.append(PageBreak())

    # ==========================================
    # 3. STATISTICAL & ML PREDICTION ENGINE
    # ==========================================
    story.append(Paragraph("3. Mathematical Modeling & ML Prediction Engine", h1_style))
    story.append(Paragraph(
        "Match probabilities are computed using a bivariate <b>Double Poisson Goal Model</b> combined with dynamic team attacking/defending "
        "ratings, recent 5-game form factors, and home-field advantage weighting.",
        body_style
    ))

    story.append(Paragraph("3.1 Poisson Goal Expectancy Equation", h2_style))
    story.append(Paragraph(
        "For a home team with expected goals &lambda;<sub>home</sub> and an away team with expected goals &mu;<sub>away</sub>, "
        "the joint probability of an exact scoreline (x, y) is defined as:",
        body_style
    ))
    story.append(Paragraph(
        "<b>P(Home = x, Away = y) = [ (&lambda;<sup>x</sup> e<sup>-&lambda;</sup>) / x! ] &times; [ (&mu;<sup>y</sup> e<sup>-&mu;</sup>) / y! ]</b>",
        code_style
    ))

    story.append(Paragraph("3.2 Multi-Market Derivations", h2_style))
    story.append(Paragraph("• <b>1X2 Match Winner:</b> Evaluated across a matrix of scorelines up to 7-7 (Home Win: x > y, Draw: x = y, Away Win: x < y).", bullet_style))
    story.append(Paragraph("• <b>Over / Under 2.5 Goals:</b> Probability that total match goals (x + y) &ge; 3 vs (x + y) &le; 2.", bullet_style))
    story.append(Paragraph("• <b>Both Teams to Score (BTTS):</b> Probability that both x &ge; 1 and y &ge; 1.", bullet_style))
    story.append(Paragraph("• <b>Double Chance:</b> P(1X) = P(Home) + P(Draw), P(X2) = P(Away) + P(Draw), P(12) = P(Home) + P(Away).", bullet_style))

    # ==========================================
    # 4. DATABASE ENTITY-RELATIONSHIP SCHEMA
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("4. Database Architecture & Data Models", h1_style))

    db_rows = [
        [Paragraph("<b>Model</b>", body_style), Paragraph("<b>Primary Fields</b>", body_style), Paragraph("<b>Relationships & Indexes</b>", body_style)],
        [
            Paragraph("<b>User</b>", body_style),
            Paragraph("id, username, email, hashed_password, is_admin, is_active, total_points, accuracy", body_style),
            Paragraph("One-to-Many with Prediction. Unique indexes on username and email (case-insensitive).", body_style)
        ],
        [
            Paragraph("<b>League</b>", body_style),
            Paragraph("id, code, name, country, flag, is_active", body_style),
            Paragraph("One-to-Many with Match and Team. Key codes: PL, CL, PD, BL1, SA, FL1, ELC, DED.", body_style)
        ],
        [
            Paragraph("<b>Team</b>", body_style),
            Paragraph("id, external_id, name, short_name, tla, crest_url, form", body_style),
            Paragraph("Associated with home and away fixtures. Attack and defense ratings.", body_style)
        ],
        [
            Paragraph("<b>Match</b>", body_style),
            Paragraph("id, external_id, utc_date, status, home_score, away_score, odds_*, prob_*", body_style),
            Paragraph("Foreign keys to League, Home Team, and Away Team. Indexed by utc_date & status.", body_style)
        ],
        [
            Paragraph("<b>Prediction</b>", body_style),
            Paragraph("id, user_id, match_id, predicted_home, predicted_away, points_awarded, is_scored", body_style),
            Paragraph("Composite unique constraint on (user_id, match_id). Foreign keys to User and Match.", body_style)
        ],
    ]
    db_table = Table(db_rows, colWidths=[80, 204, 220])
    db_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(db_table)

    # ==========================================
    # 5. RESTFUL API ENDPOINT CATALOGUE
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("5. API Directory & Integration Specifications", h1_style))

    api_rows = [
        [Paragraph("<b>Route</b>", body_style), Paragraph("<b>Method</b>", body_style), Paragraph("<b>Access</b>", body_style), Paragraph("<b>Functionality</b>", body_style)],
        [Paragraph("<code>/api/auth/register</code>", body_style), Paragraph("POST", body_style), Paragraph("Public", body_style), Paragraph("Registers user, checks uniqueness, sends welcome email.", body_style)],
        [Paragraph("<code>/api/auth/login</code>", body_style), Paragraph("POST", body_style), Paragraph("Public", body_style), Paragraph("Authenticates credentials, issues JWT bearer token.", body_style)],
        [Paragraph("<code>/api/matches</code>", body_style), Paragraph("GET", body_style), Paragraph("Public", body_style), Paragraph("Fetches matches filtered by status, date, and league.", body_style)],
        [Paragraph("<code>/api/predictions</code>", body_style), Paragraph("POST", body_style), Paragraph("User", body_style), Paragraph("Submits exact scoreline prediction before kickoff.", body_style)],
        [Paragraph("<code>/api/leaderboard</code>", body_style), Paragraph("GET", body_style), Paragraph("Public", body_style), Paragraph("Returns ranked leaderboard entries by points and accuracy.", body_style)],
        [Paragraph("<code>/api/chat</code>", body_style), Paragraph("POST", body_style), Paragraph("Public", body_style), Paragraph("Processes Coach AI conversational football reasoning.", body_style)],
        [Paragraph("<code>/api/admin/stats</code>", body_style), Paragraph("GET", body_style), Paragraph("Admin", body_style), Paragraph("Returns telemetry counts for matches, users, and SMTP.", body_style)],
        [Paragraph("<code>/api/admin/sync</code>", body_style), Paragraph("POST", body_style), Paragraph("Admin", body_style), Paragraph("Triggers asynchronous full competition data sync.", body_style)],
        [Paragraph("<code>/api/admin/score</code>", body_style), Paragraph("POST", body_style), Paragraph("Admin", body_style), Paragraph("Calculates leaderboard points for finished matches.", body_style)],
    ]
    api_table = Table(api_rows, colWidths=[120, 50, 50, 284])
    api_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(api_table)

    story.append(PageBreak())

    # ==========================================
    # 6. SECURITY, SESSION & ADMIN CONTROLS
    # ==========================================
    story.append(Paragraph("6. Security Architecture & Administration Controls", h1_style))
    story.append(Paragraph(
        "The system enforces a zero-trust, defense-in-depth security model across authentication, session management, and administrative privileges.",
        body_style
    ))

    story.append(Paragraph("6.1 Authentication & Password Security", h2_style))
    story.append(Paragraph("• <b>Bcrypt Password Hashing:</b> Passwords are cryptographically salted and hashed using PassLib Bcrypt.", bullet_style))
    story.append(Paragraph("• <b>JWT Tokenization:</b> HS256 algorithm generates digitally signed JSON Web Tokens for stateless API calls.", bullet_style))
    story.append(Paragraph("• <b>Case-Insensitive Duplicate Validation:</b> Prevents spoofing or dual registration by enforcing lowercase email & username validation.", bullet_style))

    story.append(Paragraph("6.2 Admin Inactivity Auto-Logout Timer", h2_style))
    story.append(Paragraph(
        "To protect elevated controls, the Admin Dashboard implements a <b>5-minute (300-second) inactivity detector</b>. "
        "Continuous listener monitors user interaction events (<code>mousemove</code>, <code>keydown</code>, <code>mousedown</code>, <code>touchstart</code>, <code>scroll</code>, <code>click</code>). "
        "If idle for 300 seconds, the admin session is revoked, tokens are purged, and the admin is safely logged out.",
        body_style
    ))

    # ==========================================
    # 7. MONETIZATION & GOOGLE ADSENSE INTEGRATION
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Monetization Engine & Google AdSense Setup", h1_style))
    story.append(Paragraph(
        "The monetization architecture incorporates a dual-mode strategy designed for maximum CPM yields and compliance.",
        body_style
    ))

    story.append(Paragraph("7.1 Ad Unit Topology & Layout Locations", h2_style))
    story.append(Paragraph("1. <b>Hero Top Banner:</b> High-visibility placement above the daily match feed.", bullet_style))
    story.append(Paragraph("2. <b>In-Feed Match Break Banner:</b> Embedded between date clusters in the fixture schedule.", bullet_style))
    story.append(Paragraph("3. <b>VIP Tool & Forecaster Banner:</b> Embedded within secondary match blocks.", bullet_style))
    story.append(Paragraph("4. <b>Merchandise & Gear Banner:</b> Positioned below the match listings.", bullet_style))
    story.append(Paragraph("5. <b>Leaderboard & Rewards Footer:</b> Placed on the competitive rankings page.", bullet_style))

    story.append(Paragraph("7.2 Verification & Compliance Specification", h2_style))
    story.append(Paragraph("• <b>Publisher ID:</b> <code>pub-3089881788835574</code> (Client ID: <code>ca-pub-3089881788835574</code>)", bullet_style))
    story.append(Paragraph("• <b>Authorized Digital Sellers:</b> Hosted at <code>/ads.txt</code> with DIRECT reseller authorization.", bullet_style))
    story.append(Paragraph("• <b>GDPR & European Privacy:</b> Google Certified CMP integration for EEA, UK, and Swiss user consent management.", bullet_style))

    # ==========================================
    # 8. SCORING RULES & COMMUNITY LEADERBOARD
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("8. Gamification & Prediction Scoring Matrix", h1_style))

    scoring_rows = [
        [Paragraph("<b>Prediction Outcome</b>", body_style), Paragraph("<b>Points Awarded</b>", body_style), Paragraph("<b>Example Scenario</b>", body_style)],
        [
            Paragraph("<b>Exact Scoreline Hit</b>", body_style),
            Paragraph("<b>+3 Points</b>", body_style),
            Paragraph("User predicted 2 - 1; Final Result: 2 - 1.", body_style)
        ],
        [
            Paragraph("<b>Correct Match Winner / Draw</b>", body_style),
            Paragraph("<b>+1 Point</b>", body_style),
            Paragraph("User predicted 3 - 0 (Home Win); Final Result: 1 - 0 (Home Win).", body_style)
        ],
        [
            Paragraph("<b>Incorrect Result</b>", body_style),
            Paragraph("<b>0 Points</b>", body_style),
            Paragraph("User predicted 2 - 0 (Home Win); Final Result: 1 - 2 (Away Win).", body_style)
        ],
    ]
    scoring_table = Table(scoring_rows, colWidths=[150, 100, 254])
    scoring_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, border_color),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(scoring_table)

    story.append(Spacer(1, 15))
    story.append(Paragraph("9. Verification & Sign-off", h1_style))
    story.append(Paragraph(
        "This document confirms that all components of the <b>FootballPredict Platform</b> have been engineered, "
        "tested, and validated against production benchmarks. Continuous deployments are monitored via Vercel Edge "
        "and Render Cloud Infrastructure.",
        body_style
    ))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"SUCCESS: PDF generated at: {filename}")


if __name__ == "__main__":
    out_pdf = os.path.join(os.getcwd(), "Football_Prediction_System_Architecture_and_Documentation.pdf")
    build_pdf(out_pdf)
