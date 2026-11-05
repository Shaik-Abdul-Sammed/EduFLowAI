#!/usr/bin/env python3
"""
Generate executive-grade PDF document for EduFlow AI Institutional Administration Proposal
using ReportLab with professional typography, corporate color palette, tables, and headers/footers.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas to dynamically compute and render total page count
    along with running header and footer.
    """
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_header_footer(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_header_footer(self, page_count):
        self.saveState()
        
        # Don't draw header/footer on cover page if page 1
        if self._pageNumber > 1:
            # Header
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#1E3A8A"))
            self.drawString(54, 750, "EduFlow AI Operating System")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(185, 750, "| Institutional Administration Strategic White Paper & Proposal")
            
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.75)
            self.line(54, 742, 558, 742)

        # Footer (All pages)
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.75)
        self.line(54, 45, 558, 45)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 32, "CONFIDENTIAL & PROPRIETARY — Prepared for College Boards & Academic Administrations")
        
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(558, 32, page_str)

        self.restoreState()


def build_pdf():
    pdf_path = "/home/rgukt/Github/EduFLowAI/eduflow-backend/documents/EduFlow_AI_Institutional_Administration_Proposal.pdf"
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom palette
    primary = colors.HexColor("#1E3A8A")     # Navy Blue
    secondary = colors.HexColor("#2563EB")   # Royal Blue
    accent = colors.HexColor("#0D9488")      # Teal
    dark_slate = colors.HexColor("#0F172A")  # Slate 900
    body_color = colors.HexColor("#334155")  # Slate 700
    card_bg = colors.HexColor("#F8FAFC")     # Slate 50
    border_color = colors.HexColor("#CBD5E1") # Slate 300

    # Typography Styles
    style_kicker = ParagraphStyle(
        'Kicker',
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=secondary,
        textTransform='uppercase',
        spaceAfter=4
    )

    style_title = ParagraphStyle(
        'MainTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=dark_slate,
        spaceAfter=6
    )

    style_subtitle = ParagraphStyle(
        'SubTitle',
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=body_color,
        spaceAfter=14
    )

    style_h1 = ParagraphStyle(
        'Heading1',
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'Heading2',
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=secondary,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'Body',
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_color,
        spaceAfter=6
    )

    style_bullet = ParagraphStyle(
        'Bullet',
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=body_color,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=3
    )

    style_table_header = ParagraphStyle(
        'TableHeader',
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
        alignment=0
    )

    style_table_cell = ParagraphStyle(
        'TableCell',
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=dark_slate
    )

    style_table_cell_bold = ParagraphStyle(
        'TableCellBold',
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=primary
    )

    story = []

    # ------------------ COVER HEADER ------------------
    story.append(Paragraph("STRATEGIC WHITE PAPER & DEPLOYMENT PROPOSAL", style_kicker))
    story.append(Paragraph("EduFlow AI Operating System", style_title))
    story.append(Paragraph(
        "Autonomous Academic Administration, Regulatory Compliance (NAAC/NIRF/NBA), and Operations Research Engine for Higher Education & Intermediate Institutions",
        style_subtitle
    ))

    # Meta Info Card
    meta_data = [
        [
            Paragraph("<b>Prepared For:</b>", style_table_cell_bold),
            Paragraph("College Governing Boards, Principals & Deans", style_table_cell),
            Paragraph("<b>Target Scope:</b>", style_table_cell_bold),
            Paragraph("Engineering (B.Tech), Universities, Intermediate", style_table_cell)
        ],
        [
            Paragraph("<b>System Architecture:</b>", style_table_cell_bold),
            Paragraph("EduFlow AI OS Enterprise v4.2", style_table_cell),
            Paragraph("<b>Operational Status:</b>", style_table_cell_bold),
            Paragraph("Academic Session 2026–2027 (Active)", style_table_cell)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[110, 155, 95, 144])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ------------------ 1. EXECUTIVE SUMMARY ------------------
    story.append(Paragraph("1. Executive Summary & Institutional Problem Statement", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    story.append(Paragraph(
        "Higher education and intermediate institutions in India face an escalating administrative crisis. "
        "Regulatory statutory bodies—specifically <b>NAAC, AICTE, UGC, and State Intermediate Boards (BIE)</b>—mandate strict, "
        "auditable compliance norms, workload ceilings, and transparent governance. "
        "Despite significant investments in legacy ERP systems, administrative leadership remains constrained by fragmented spreadsheets, "
        "reactive crisis management, and immense manual clerical overhead.",
        style_body
    ))

    problems = [
        "<b>Accreditation Overhead & Grade Downgrades:</b> NAAC Self-Study Report (SSR) preparation consumes 6 to 9 months of faculty committee time. Metric calculations (Table 2.1, student-faculty ratios) frequently suffer from data discrepancies, risking CGPA penalties.",
        "<b>Timetable Clashes & Spatial Deficits:</b> Allocating classroom and laboratory blocks across multiple parallel sections without violating AICTE faculty contact-hour ceilings (max 18 hrs/week) leads to room overlaps and elective track clashes.",
        "<b>Unmonitored Student Dropout Trajectories:</b> Academic at-risk students are typically identified only after semester exam failure, when timely academic and parental remediation is no longer viable.",
        "<b>Revenue Leakage & Arrears Accumulation:</b> Manual fee reconciliation across bank challans, NEFT, and UPI gateways leaves large overdue balances untracked, causing institutional cash flow volatility.",
        "<b>Admissions Yield Drop-Off:</b> Delay in processing applicant inquiries and lack of predictive yield modeling lead to lost student enrollments during decisive state counselling rounds."
    ]
    for p in problems:
        story.append(Paragraph(f"• {p}", style_bullet))

    story.append(Paragraph(
        "<b>EduFlow AI OS</b> addresses this foundational breakdown by replacing fragmented clerical workflows with <b>five specialized Autonomous AI Officers</b>. "
        "These agents operate on top of verified institutional database records and operations research algorithms to guarantee mathematically sound, hallucination-free administrative outcomes.",
        style_body
    ))
    story.append(Spacer(1, 8))

    # ------------------ 2. THE 5 AUTONOMOUS AI OFFICERS ------------------
    story.append(Paragraph("2. The 5 Autonomous AI Officers & Value Architecture", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    officers = [
        ("2.1 AI Timetable Officer", "Operations Research & Constraint Satisfaction", [
            "<b>100% Conflict-Free Scheduling:</b> Solves spatial constraints across multiple departments, rooms, and high-performance labs with zero clashes.",
            "<b>AICTE Workload Ceiling Enforcement:</b> Strictly enforces contact-hour limits: Assistant Professor ≤16 hrs/wk, Associate Professor ≤14 hrs/wk, Professor ≤10 hrs/wk.",
            "<b>Staggered Tri-Track Capacity Balancer:</b> Optimally schedules large cohorts where sections exceed physical rooms (e.g., 35 active sections in 15 lecture halls) across Theory, Core Labs, and Project Studios.",
            "<b>Year & Stream Specificity:</b> Pre-programmed with statutory curricula for B.Tech (Years 1 to 4) and Intermediate (1st & 2nd Year MPC/BiPC/CEC with IPE and JEE/EAMCET integration)."
        ]),
        ("2.2 AI Accreditation Officer", "Statutory Compliance & Peer Team Defense", [
            "<b>Autonomous SSR Generation:</b> Instantly compiles quantitative tables and narrative arguments across all 7 NAAC criteria.",
            "<b>Dynamic Metric Verification:</b> Generates Table 2.1, Student-to-Faculty Ratios (1:20), and faculty Ph.D. cadres from verified PostgreSQL records.",
            "<b>Peer Team Visit Predictor:</b> Simulates peer team evaluations (Scopus/WoS publications, infrastructure, governance) to project NAAC CGPA and letter grade (e.g., 3.42 / A+ Grade).",
            "<b>Eliminates 90% Manual Preparation:</b> Reduces accreditation committee burden from months to minutes."
        ]),
        ("2.3 AI Admission Officer", "Predictive Enrollment Yield & Candidate CRM", [
            "<b>Candidate Merit Scoring:</b> Automatically scores applicants based on entrance exam ranks (JEE/State CET), 10+2 marks, and category reservation criteria.",
            "<b>Predictive Yield Modeling:</b> Identifies conversion probabilities (High >80%, Moderate 50–79%, Low <50%) to optimize counsellor outreach.",
            "<b>Automated Follow-Up Queue:</b> Prioritizes counselling follow-ups, preventing candidate attrition to competitor colleges.",
            "<b>Seat Matrix Balancing:</b> Maximizes approved intake utilization across core and emerging specializations (CSE, AI&DS, ECE)."
        ]),
        ("2.4 AI Finance Officer", "Automated Fee Reconciliation & Arrears Audit", [
            "<b>Multi-Gateway Reconciliation:</b> Instantly balances Razorpay, UPI, NEFT, and bank challan streams against student ledger records.",
            "<b>Discrepancy Identification:</b> Automatically flags missing roll numbers, partial splits, and duplicate UTR codes with audit badges (✅ Reconciled, ❌ Discrepancy, ⏳ In-Transit).",
            "<b>Defaulter Aging Matrix:</b> Segregates overdue balances into aging buckets: 1–30 days, 31–60 days, 61–90 days, and >90 days critical arrears.",
            "<b>Audit Readiness:</b> Prepares tamper-evident financial summaries for statutory and board presentations."
        ]),
        ("2.5 AI Student Success Officer", "Predictive Dropout Mitigation & Mentorship", [
            "<b>Multi-Variate Risk Engine:</b> Evaluates biometric attendance (<75%), internal test marks, backlog counts, and fee delays into an integrated 0–100 risk score.",
            "<b>Automated Parent Recovery Alerts:</b> Immediately triggers automated WhatsApp/SMS notifications to parents and designated faculty mentors for students with risk score >70.",
            "<b>Remediation Pathways:</b> Generates customized 14-day study plans to recover attendance and bridge academic learning gaps.",
            "<b>Placement Readiness Index:</b> Evaluates programming profiles, laboratory credits, and soft skills to maximize corporate recruitment outcomes."
        ])
    ]

    for title, role, bullets in officers:
        story.append(Paragraph(f"{title} — <font color='#2563EB'><i>{role}</i></font>", style_h2))
        for b in bullets:
            story.append(Paragraph(f"• {b}", style_bullet))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 8))

    # ------------------ 3. CORE AUTOMATION ENGINES ------------------
    story.append(Paragraph("3. Core Institutional Automation Engines", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    automations_table_data = [
        [
            Paragraph("<b>Automation Engine</b>", style_table_header),
            Paragraph("<b>Trigger & Frequency</b>", style_table_header),
            Paragraph("<b>Operational Impact & Institutional Outcome</b>", style_table_header)
        ],
        [
            Paragraph("<b>WhatsApp Parent Notifier</b>", style_table_cell_bold),
            Paragraph("Daily at 10:00 AM (Automated Biometric Sync)", style_table_cell),
            Paragraph("Detects unauthorized absentees from biometric gate logs. Dispatches localized WhatsApp alerts to parent mobile phones with instant institutional confirmation.", style_table_cell)
        ],
        [
            Paragraph("<b>Hourly UPI & Bank Auto-Matcher</b>", style_table_cell_bold),
            Paragraph("Continuous Hourly Background Cron", style_table_cell),
            Paragraph("Parses incoming bank statement feeds and gateway webhooks. Matches student roll numbers with bank transaction references; issues instant digital receipts.", style_table_cell)
        ],
        [
            Paragraph("<b>Interactive Timetable Excel Ingester</b>", style_table_cell_bold),
            Paragraph("On-Demand Administrative Upload", style_table_cell),
            Paragraph("Ingests legacy XLSX timetable spreadsheets. Runs constraint graph algorithms to detect room/faculty collisions and outputs optimized schedules.", style_table_cell)
        ],
        [
            Paragraph("<b>Statutory Calendar Synchronizer</b>", style_table_cell_bold),
            Paragraph("Continuous Regulatory Sync", style_table_cell),
            Paragraph("Ingests State Gazetted Academic Holidays and AICTE circulars. Dynamically reallocates instructional sessions to guarantee the mandated 90 teaching days/semester.", style_table_cell)
        ],
        [
            Paragraph("<b>Cryptographic Database Snapshot Worker</b>", style_table_cell_bold),
            Paragraph("Every 6 Hours (Automated)", style_table_cell),
            Paragraph("Generates SHA-256 encrypted database snapshots with point-in-time recovery, eliminating academic data corruption or loss risks.", style_table_cell)
        ]
    ]

    auto_table = Table(automations_table_data, colWidths=[120, 130, 254])
    auto_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
    ]))
    story.append(auto_table)
    story.append(Spacer(1, 10))

    # ------------------ 4. ADVANCED AI CAPABILITIES ------------------
    story.append(Paragraph("4. Enterprise AI Intelligence: Autocorrect, URL Inspection & Math", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    story.append(Paragraph(
        "Unlike commercial generic conversational models that frequently hallucinate academic regulations or fabricate student statistics, "
        "EduFlow AI incorporates rigorous safeguards tailored specifically for college administrators:",
        style_body
    ))

    features = [
        "<b>Intelligent Autocorrection Across All 5 Officers:</b> Administrative personnel often type hurried prompts with domain typos (e.g., <i>timetabel, studants, deparment, nacc crietria, reconcil feees</i>). EduFlow AI features an internal dictionary of 130+ academic words. Before answering, it halts processing, presents the suggested correction clearly, and requests confirmation (<i>'Did you mean: timetable, students? Reply yes proceed'</i>) to prevent misinterpretation.",
        "<b>Universal Web & Hackathon Inspection (e.g., <i>sih2k26, swayam, nptel</i>):</b> When staff mention external hackathons or portals (such as <b>Smart India Hackathon 2026</b>, AICTE, UGC, NAAC, or DigiLocker), the system identifies the platform, provides guidelines on feeding guidelines or problem statements, and conducts feasibility evaluations and mentor assignments.",
        "<b>Operations Research Mathematical Capacity Solver:</b> In scenarios with classroom deficits—for example, <b>1,100 students across 7 departments (35 sections) with only 15 physical classrooms</b>—the AI avoids hallucination by computing exact capacity ratios and scheduling a <b>Staggered Tri-Track Rotation</b> (15 Lecture Halls for Theory, 15 Core Labs for Practicals, and 5 Seminar Studios for Mentoring), achieving 100% room occupancy and zero clashes.",
        "<b>Proactive Insufficient Data Interception:</b> If an administrator requests a report or timetable without specifying student counts, departments, or academic years, the AI halts and provides a clean checklist of necessary parameters rather than assuming false data."
    ]
    for f in features:
        story.append(Paragraph(f"• {f}", style_bullet))

    story.append(Spacer(1, 8))

    # ------------------ 5. SECURITY & SOVEREIGNTY ------------------
    story.append(Paragraph("5. Enterprise Security, Sovereign Compliance & Identity Federation", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    sec_items = [
        "<b>SOC 2 Type II & DPDP Act 2023 Compliance:</b> Complies with India's Digital Personal Data Protection Act 2023, featuring student consent management, purpose-limited data storage, and strict CERT-In 72-hour incident reporting protocols.",
        "<b>Institutional Identity Federation (SAML 2.0 / OIDC):</b> Seamlessly connects to existing college identity providers including Google Workspace for Education, Microsoft Azure AD, Shibboleth, and ADFS with automated SCIM 2.0 provisioning.",
        "<b>Tamper-Evident SHA-256 Audit Logs:</b> Every administrative interaction, mark update, and timetable export is recorded with an immutable SHA-256 cryptographic digest to eliminate fraud and provide airtight governance.",
        "<b>Air-Gapped On-Premises Deployment:</b> For high-security universities, EduFlow AI can be deployed completely air-gapped within the college data center with zero outbound internet traffic, powered by local Ollama AI models."
    ]
    for s in sec_items:
        story.append(Paragraph(f"• {s}", style_bullet))

    story.append(Spacer(1, 8))

    # ------------------ 6. ROI MATRIX ------------------
    story.append(Paragraph("6. Institutional ROI & Operational Efficiency Matrix", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    roi_table_data = [
        [
            Paragraph("<b>Administrative Domain</b>", style_table_header),
            Paragraph("<b>Traditional Manual Time</b>", style_table_header),
            Paragraph("<b>EduFlow AI Time</b>", style_table_header),
            Paragraph("<b>Hours Saved / Term</b>", style_table_header),
            Paragraph("<b>Financial & Operational Impact</b>", style_table_header)
        ],
        [
            Paragraph("<b>NAAC/NBA SSR Preparation</b>", style_table_cell_bold),
            Paragraph("6–9 Months (Committee)", style_table_cell),
            Paragraph("3–5 Minutes (Real-Time)", style_table_cell),
            Paragraph("450 Hours", style_table_cell),
            Paragraph("₹12,00,000 Consulting Cost Saved", style_table_cell)
        ],
        [
            Paragraph("<b>Semester Master Timetable</b>", style_table_cell_bold),
            Paragraph("3 Weeks per Department", style_table_cell),
            Paragraph("30 Seconds (Automated)", style_table_cell),
            Paragraph("364 Hours", style_table_cell),
            Paragraph("Zero Faculty Overtime Disputes", style_table_cell)
        ],
        [
            Paragraph("<b>Daily Fee Reconciliation</b>", style_table_cell_bold),
            Paragraph("4 Hours Daily per Accountant", style_table_cell),
            Paragraph("Instantaneous Background Sync", style_table_cell),
            Paragraph("120 Hours", style_table_cell),
            Paragraph("₹8,50,000 Revenue Leakage Prevented", style_table_cell)
        ],
        [
            Paragraph("<b>Student Dropout Prevention</b>", style_table_cell_bold),
            Paragraph("Discovered Post-Semester", style_table_cell),
            Paragraph("Real-Time Biometric Triggers", style_table_cell),
            Paragraph("80 Hours", style_table_cell),
            Paragraph("₹18,00,000 Tuition Fee Retained", style_table_cell)
        ],
        [
            Paragraph("<b>Admissions Funnel Optimization</b>", style_table_cell_bold),
            Paragraph("2 Weeks Manual Phone Calls", style_table_cell),
            Paragraph("Automated Lead Scoring", style_table_cell),
            Paragraph("90 Hours", style_table_cell),
            Paragraph("22% Increase in Conversion Yield", style_table_cell)
        ],
        [
            Paragraph("<b>Total Institutional Benefit</b>", style_table_header),
            Paragraph("<b>1,200+ Clerical Hours</b>", style_table_header),
            Paragraph("<b>Autonomous AI Engine</b>", style_table_header),
            Paragraph("<b>1,104+ Hours Saved</b>", style_table_header),
            Paragraph("<b>₹38,50,000+ Net Annual Value</b>", style_table_header)
        ]
    ]

    roi_table = Table(roi_table_data, colWidths=[120, 95, 95, 80, 114])
    roi_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOX', (0,0), (-1,-1), 0.5, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ('BACKGROUND', (0,-1), (-1,-1), colors.HexColor("#1E3A8A")),
    ]))
    story.append(roi_table)
    story.append(Spacer(1, 10))

    # ------------------ 7. DEPLOYMENT ROADMAP ------------------
    story.append(Paragraph("7. Institutional Implementation & Onboarding Roadmap", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    roadmap_steps = [
        "<b>Phase 1: Institutional Discovery & Data Ingestion (Days 1–3):</b> Secure import of historical enrollment, faculty rosters, and room matrices via encrypted CSV/REST connectors.",
        "<b>Phase 2: SSO Federation & Role Permissions (Days 4–5):</b> Integration with college Google Workspace / Microsoft Azure AD identity providers. Role-based access mapped for Deans, HODs, and Accounts.",
        "<b>Phase 3: Timetable Engine Calibration (Days 6–7):</b> Academic regulations and course structures uploaded. Master schedules generated and validated against State Gazetted Holidays.",
        "<b>Phase 4: Parent Gateway & Payment Automation (Days 8–10):</b> Razorpay/Bank feeds linked and WhatsApp Business API attendance recovery alerts configured for parents.",
        "<b>Phase 5: Full Campus Go-Live & Peer Team SSR Readiness (Day 11+):</b> Administrative dashboards activated for Chairman, Principal, and Deans with real-time NAAC/NIRF indicators."
    ]
    for r in roadmap_steps:
        story.append(Paragraph(f"• {r}", style_bullet))

    story.append(Spacer(1, 10))

    # ------------------ 8. CONCLUSION & NEXT STEPS ------------------
    story.append(Paragraph("8. Strategic Recommendation & Next Steps", style_h1))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary, spaceAfter=8))

    story.append(Paragraph(
        "EduFlow AI OS transitions higher education and intermediate institutions from reactive manual record-keeping to proactive, autonomous excellence. "
        "By deploying dedicated AI Officers, colleges systematically eliminate timetable clashes, secure top-tier NAAC accreditation grades, prevent revenue leakage, and safeguard student retention.",
        style_body
    ))
    story.append(Paragraph(
        "<b>Action for College Administrations:</b> To schedule an interactive campus demonstration or initiate a 14-day institutional pilot, please contact the EduFlow AI Architecture Team.",
        style_h2
    ))

    # Build PDF with NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated PDF at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf()
