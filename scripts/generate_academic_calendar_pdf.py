#!/usr/bin/env python3
"""
Official Academic Calendar PDF Generator (A.Y: 2026-27 from E1 to E4)
Matches RGUKT Academic Regulation, Gazetted Holidays, and UGC/AICTE Standards.
Includes exact weekly color-coded grids (Red: Holidays, Blue: Mid Tests, Green: EST Exams)
and Comprehensive Statutory Holiday Directories with cultural/regulatory reasons.
"""

import os
import sys
import tempfile
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
import fitz

KHAKI = colors.HexColor('#C4BA94')
RED = colors.HexColor('#FF0000')
BLUE = colors.HexColor('#8DB3E1')
GREEN = colors.HexColor('#92D050')
WHITE = colors.white

styles = getSampleStyleSheet()

# Typography Styles
title_style = ParagraphStyle(
    name='TitleStyle',
    fontName='Helvetica-Bold',
    fontSize=14,
    leading=18,
    alignment=TA_CENTER
)

cell_bold = ParagraphStyle(
    name='CellBold',
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=13,
    alignment=TA_CENTER
)

cell_normal = ParagraphStyle(
    name='CellNormal',
    fontName='Helvetica',
    fontSize=9.5,
    leading=13,
    alignment=TA_CENTER
)

cell_header = ParagraphStyle(
    name='CellHeader',
    fontName='Helvetica-Bold',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER
)

grid_cell_txt = ParagraphStyle(name='GridTxt', fontName='Helvetica', fontSize=8, leading=10, alignment=TA_CENTER)
grid_cell_bold = ParagraphStyle(name='GridBold', fontName='Helvetica-Bold', fontSize=8, leading=10, alignment=TA_CENTER)
grid_month = ParagraphStyle(name='GridMonth', fontName='Helvetica-Oblique', fontSize=8.5, leading=11, alignment=TA_LEFT)
grid_banner = ParagraphStyle(name='GridBanner', fontName='Helvetica-Bold', fontSize=9.5, leading=12, alignment=TA_CENTER)

legend_title = ParagraphStyle(name='LegTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=11, alignment=TA_LEFT)
legend_txt = ParagraphStyle(name='LegTxt', fontName='Helvetica', fontSize=7.2, leading=9.2, alignment=TA_LEFT)
legend_txt_bold = ParagraphStyle(name='LegTxtBold', fontName='Helvetica-Bold', fontSize=7.2, leading=9.2, alignment=TA_LEFT)

# =========================================================================
# PAGE 1: OVERVIEW MILESTONE SCHEDULE TABLE
# =========================================================================
def build_page1(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=36
    )

    table_data = [
        [
            Paragraph("<b>Odd Semester</b>", cell_header),
            Paragraph("<b>Activities</b>", cell_header),
            Paragraph("<b>Even Semester</b>", cell_header)
        ],
        [
            Paragraph("<b>88</b>", cell_bold),
            Paragraph("<b>Number of Instruction days</b>", cell_bold),
            Paragraph("<b>84</b>", cell_bold)
        ],
        [
            Paragraph("<b>29<sup>th</sup> June, 2026</b>", cell_bold),
            Paragraph("<b>Semester<br/>Registration/Commencement of<br/>classes</b>", cell_bold),
            Paragraph("<b>1<sup>st</sup> December, 2026</b>", cell_bold)
        ],
        [
            Paragraph("<b>5<sup>th</sup> – 7<sup>th</sup> August, 2026</b>", cell_bold),
            Paragraph("<b>Mid Test-I</b>", cell_bold),
            Paragraph("<b>6<sup>th</sup> – 8<sup>th</sup> January, 2027</b>", cell_bold)
        ],
        [
            Paragraph("17<sup>th</sup> August, 2026", cell_normal),
            Paragraph("Mid Test-I Result Announcement", cell_normal),
            Paragraph("25<sup>th</sup> January, 2027", cell_normal)
        ],
        [
            Paragraph("<b>24<sup>th</sup> – 26<sup>th</sup> September, 2026</b>", cell_bold),
            Paragraph("<b>Mid Test-II</b>", cell_bold),
            Paragraph("<b>18<sup>th</sup> – 20<sup>th</sup> February, 2027</b>", cell_bold)
        ],
        [
            Paragraph("5<sup>th</sup> October, 2026", cell_normal),
            Paragraph("Mid Test-II Result Announcement", cell_normal),
            Paragraph("27<sup>th</sup> March, 2027", cell_normal)
        ],
        [
            Paragraph("<b>4<sup>th</sup> November, 2026</b>", cell_bold),
            Paragraph("<b>Instruction closing day</b>", cell_bold),
            Paragraph("<b>5<sup>th</sup> April, 2027</b>", cell_bold)
        ],
        [
            Paragraph("<b>5<sup>th</sup> – 7<sup>th</sup> November, 2026</b>", cell_bold),
            Paragraph("<b>Mid Test-III</b>", cell_bold),
            Paragraph("<b>6<sup>th</sup> – 9<sup>th</sup> April, 2027</b>", cell_bold)
        ],
        [
            Paragraph("14<sup>th</sup> November, 2026", cell_normal),
            Paragraph("Mid Test-III Result Announcement", cell_normal),
            Paragraph("17<sup>th</sup> April, 2027", cell_normal)
        ],
        [
            Paragraph("<b>16<sup>th</sup> – 28<sup>th</sup> November, 2026</b>", cell_bold),
            Paragraph("<b>EST exams</b>", cell_bold),
            Paragraph("<b>19<sup>th</sup> – 30<sup>th</sup> April, 2027</b>", cell_bold)
        ],
        [
            Paragraph("30<sup>th</sup> December, 2026", cell_normal),
            Paragraph("End Semester Result Announcement", cell_normal),
            Paragraph("1<sup>st</sup> June, 2027", cell_normal)
        ]
    ]

    t = Table(table_data, colWidths=[150, 240, 150])
    t.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 1.0, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.75, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 7),
        ('BOTTOMPADDING', (0,0), (-1,-1), 7),
    ]))

    story = [
        Spacer(1, 20),
        Paragraph("<u><b>Academic Calendar of A.Y:2026-27 from E1 to E4</b></u>", title_style),
        Spacer(1, 30),
        t
    ]

    doc.build(story)

# =========================================================================
# PAGE 2: ODD SEMESTER MASTER WEEKLY GRID & HOLIDAY REASONS
# =========================================================================
def build_page2(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=26,
        bottomMargin=20
    )

    raw_data = [
        ["", "Odd Semester", "", "", "", "", "", "", ""],
        ["July, 2026", "29", "30", "1", "2", "3", "4", "Week-1", ""],
        ["July, 2026", "6", "7", "8", "9", "10", "11", "Week-2", ""],
        ["July, 2026", "13", "14", "15", "16", "17", "18", "Week-3", ""],
        ["July, 2026", "20", "21", "22", "23", "24", "25", "Week-4", ""],
        ["July, 2026", "27", "28", "29", "30", "31", "1", "Week-5", ""],
        ["August, 2026", "3", "4", "5", "6", "7", "8", "Week-6", "MID-I"],
        ["August, 2026", "10", "11", "12", "13", "14", "15", "Week-7", ""],
        ["August, 2026", "17", "18", "19", "20", "21", "22", "Week-8", ""],
        ["August, 2026", "24", "25", "26", "27", "28", "29", "Week-9", ""],
        ["September, 2026", "31", "1", "2", "3", "4", "5", "Week-10", ""],
        ["September, 2026", "7", "8", "9", "10", "11", "12", "Week-11", ""],
        ["September, 2026", "14", "15", "16", "17", "18", "19", "Week-12", ""],
        ["September, 2026", "21", "22", "23", "24", "25", "26", "Week-13", "MID-II"],
        ["October, 2026", "28", "29", "30", "1", "2", "3", "Week-14", ""],
        ["October, 2026", "5", "6", "7", "8", "9", "10", "Week-15", ""],
        ["October, 2026", "12", "13", "14", "15", "16", "17", "Week-16", ""],
        ["October, 2026", "19", "20", "21", "22", "23", "24", "Dussehra Vacation", ""],
        ["October, 2026", "26", "27", "28", "29", "30", "31", "Week-17", ""],
        ["November, 2026", "2", "3", "4", "5", "6", "7", "Week-18", "MID-III"],
        ["November, 2026", "9", "10", "11", "12", "13", "14", "Week-19", "Lab Exams"],
        ["November, 2026", "16", "17", "18", "19", "20", "21", "Week-20", "EST"],
        ["November, 2026", "23", "24", "25", "26", "27", "28", "Week-21", "EST"]
    ]

    table_data = []
    for r_idx, row in enumerate(raw_data):
        row_cells = []
        for c_idx, val in enumerate(row):
            if r_idx == 0:
                p = Paragraph(f"<b>{val}</b>", grid_banner)
            elif c_idx == 0:
                p = Paragraph(f"<i>{val}</i>", grid_month)
            elif c_idx == 7 or c_idx == 8:
                p = Paragraph(f"<b>{val}</b>" if val in ["MID-I", "MID-II", "MID-III", "EST", "Lab Exams", "Dussehra Vacation"] else val, grid_cell_bold if val else grid_cell_txt)
            else:
                p = Paragraph(val, grid_cell_txt)
            row_cells.append(p)
        table_data.append(row_cells)

    col_widths = [115, 56, 56, 56, 56, 56, 56, 68, 101]

    t_style = [
        ('BOX', (0,0), (-1,-1), 1.0, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('SPAN', (1, 0), (6, 0)),
        ('BACKGROUND', (1, 0), (6, 0), KHAKI),
        ('SPAN', (7, 17), (8, 17)),
    ]

    # Red Holidays
    t_style.append(('BACKGROUND', (6, 2), (6, 2), RED))   # 11-Jul
    t_style.append(('BACKGROUND', (3, 6), (5, 6), BLUE))  # 5,6,7-Aug Mid-I
    t_style.append(('BACKGROUND', (6, 6), (6, 6), RED))   # 08-Aug
    t_style.append(('BACKGROUND', (6, 7), (6, 7), RED))   # 15-Aug
    t_style.append(('BACKGROUND', (5, 8), (6, 8), RED))   # 21,22-Aug
    t_style.append(('BACKGROUND', (2, 9), (2, 9), RED))   # 25-Aug
    t_style.append(('BACKGROUND', (5, 10), (5, 10), RED)) # 04-Sep
    t_style.append(('BACKGROUND', (6, 11), (6, 11), RED)) # 12-Sep
    t_style.append(('BACKGROUND', (1, 12), (1, 12), RED)) # 14-Sep
    t_style.append(('BACKGROUND', (4, 13), (6, 13), BLUE)) # 24,25,26-Sep Mid-II
    t_style.append(('BACKGROUND', (5, 14), (5, 14), RED)) # 02-Oct
    t_style.append(('BACKGROUND', (6, 15), (6, 15), RED)) # 10-Oct
    t_style.append(('BACKGROUND', (1, 17), (6, 17), RED)) # 19-24 Oct Dussehra
    t_style.append(('BACKGROUND', (4, 19), (6, 19), BLUE)) # 5,6,7-Nov Mid-III
    t_style.append(('BACKGROUND', (6, 20), (6, 20), RED)) # 14-Nov
    t_style.append(('BACKGROUND', (1, 21), (6, 21), GREEN)) # 16-21 Nov EST
    t_style.append(('BACKGROUND', (1, 22), (6, 22), GREEN)) # 23-28 Nov EST

    grid_table = Table(table_data, colWidths=col_widths)
    grid_table.setStyle(TableStyle(t_style))

    odd_holidays_data = [
        [
            Paragraph("<b>Date & Day</b>", legend_txt_bold),
            Paragraph("<b>Holiday Name & Cultural / Statutory Reason</b>", legend_txt_bold),
            Paragraph("<b>Classification</b>", legend_txt_bold),
            Paragraph("<b>Date & Day</b>", legend_txt_bold),
            Paragraph("<b>Holiday Name & Cultural / Statutory Reason</b>", legend_txt_bold),
            Paragraph("<b>Classification</b>", legend_txt_bold)
        ],
        [
            Paragraph("<b>11-Jul-2026 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt),
            Paragraph("<b>14-Sep-2026 (Mon)</b>", legend_txt),
            Paragraph("Vinayaka Chavithi (Ganesh Chaturthi Festivity)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt)
        ],
        [
            Paragraph("<b>08-Aug-2026 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt),
            Paragraph("<b>02-Oct-2026 (Fri)</b>", legend_txt),
            Paragraph("Mahatma Gandhi Jayanti (Father of the Nation Birth)", legend_txt),
            Paragraph("National Holiday", legend_txt)
        ],
        [
            Paragraph("<b>15-Aug-2026 (Sat)</b>", legend_txt),
            Paragraph("Independence Day (Commemoration of Sovereignty)", legend_txt),
            Paragraph("National Holiday", legend_txt),
            Paragraph("<b>10-Oct-2026 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ],
        [
            Paragraph("<b>21-Aug-2026 (Fri)</b>", legend_txt),
            Paragraph("Sri Varalakshmi Vratam (State Auspicious Festivity)", legend_txt),
            Paragraph("State Gazetted", legend_txt),
            Paragraph("<b>19–24 Oct 2026</b>", legend_txt),
            Paragraph("Dussehra Vacation (Durgashtami, Maha Navami & Vijaya Dasami)", legend_txt),
            Paragraph("Institutional Vacation", legend_txt)
        ],
        [
            Paragraph("<b>22-Aug-2026 (Sat)</b>", legend_txt),
            Paragraph("Sri Krishna Janmashtami / Gokulashtami", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt),
            Paragraph("<b>14-Nov-2026 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday & Naraka Chaturdashi / Deepavali", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt)
        ],
        [
            Paragraph("<b>25-Aug-2026 (Tue)</b>", legend_txt),
            Paragraph("Milad-un-Nabi (Birthday of Prophet Muhammad PBUH)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt),
            Paragraph("<b>04-Sep-2026 (Fri)</b>", legend_txt),
            Paragraph("State Cultural / Optional Festival Observance", legend_txt),
            Paragraph("Optional Holiday", legend_txt)
        ]
    ]

    h_table = Table(odd_holidays_data, colWidths=[90, 195, 75, 85, 190, 75])
    h_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#0F172A')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))

    story = [
        grid_table,
        Spacer(1, 6),
        Paragraph("<b>Gazetted Holidays & Statutory Observances (Odd Semester 2026):</b>", legend_title),
        Spacer(1, 3),
        h_table
    ]

    doc.build(story)

# =========================================================================
# PAGE 3: EVEN SEMESTER MASTER WEEKLY GRID & HOLIDAY REASONS
# =========================================================================
def build_page3(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=36,
        rightMargin=36,
        topMargin=26,
        bottomMargin=20
    )

    raw_data = [
        ["", "Even Semester", "", "", "", "", "", "", ""],
        ["December, 2026", "30", "1", "2", "3", "4", "5", "Week-1", ""],
        ["December, 2026", "7", "8", "9", "10", "11", "12", "Week-2", ""],
        ["December, 2026", "14", "15", "16", "17", "18", "19", "Week-3", ""],
        ["December, 2026", "21", "22", "23", "24", "25", "26", "Week-4", ""],
        ["January, 2027", "28", "29", "30", "31", "1", "2", "Week-5", ""],
        ["January, 2027", "4", "5", "6", "7", "8", "9", "Week-6", "MID-I"],
        ["January, 2027", "11", "12", "13", "14", "15", "16", "Pongal Vacation", ""],
        ["January, 2027", "18", "19", "20", "21", "22", "23", "Week-7", ""],
        ["January, 2027", "25", "26", "27", "28", "29", "30", "Week-8", ""],
        ["February, 2027", "1", "2", "3", "4", "5", "6", "Week-9", ""],
        ["February, 2027", "8", "9", "10", "11", "12", "13", "Week-10", ""],
        ["February, 2027", "15", "16", "17", "18", "19", "20", "Week-11", "MID-II"],
        ["February, 2027", "22", "23", "24", "25", "26", "27", "Week-12", ""],
        ["March, 2027", "1", "2", "3", "4", "5", "6", "Week-13", ""],
        ["March, 2027", "8", "9", "10", "11", "12", "13", "Week-14", ""],
        ["March, 2027", "15", "16", "17", "18", "19", "20", "Week-15", ""],
        ["March, 2027", "22", "23", "24", "25", "26", "27", "Week-16", ""],
        ["April, 2027", "29", "30", "31", "1", "2", "3", "Week-17", ""],
        ["April, 2027", "5", "6", "7", "8", "9", "10", "Week-18", "MID-III"],
        ["April, 2027", "12", "13", "14", "15", "16", "17", "Week-19", "Lab Exams"],
        ["April, 2027", "19", "20", "21", "22", "23", "24", "Week-20", "EST"],
        ["April, 2027", "26", "27", "28", "29", "30", "", "Week-21", "EST"]
    ]

    table_data = []
    for r_idx, row in enumerate(raw_data):
        row_cells = []
        for c_idx, val in enumerate(row):
            if r_idx == 0:
                p = Paragraph(f"<b>{val}</b>", grid_banner)
            elif c_idx == 0:
                p = Paragraph(f"<i>{val}</i>", grid_month)
            elif c_idx == 7 or c_idx == 8:
                p = Paragraph(f"<b>{val}</b>" if val in ["MID-I", "MID-II", "MID-III", "EST", "Lab Exams", "Pongal Vacation"] else val, grid_cell_bold if val else grid_cell_txt)
            else:
                p = Paragraph(val, grid_cell_txt)
            row_cells.append(p)
        table_data.append(row_cells)

    col_widths = [115, 56, 56, 56, 56, 56, 56, 68, 101]

    t_style = [
        ('BOX', (0,0), (-1,-1), 1.0, colors.black),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.black),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.8),
        ('SPAN', (1, 0), (6, 0)),
        ('BACKGROUND', (1, 0), (6, 0), KHAKI),
        ('SPAN', (7, 7), (8, 7)),
    ]

    # Red Holidays & Exam Blocks
    t_style.append(('BACKGROUND', (6, 2), (6, 2), RED))   # 12-Dec
    t_style.append(('BACKGROUND', (5, 4), (5, 4), RED))   # 25-Dec
    t_style.append(('BACKGROUND', (3, 6), (5, 6), BLUE))  # 6,7,8-Jan Mid-I
    t_style.append(('BACKGROUND', (1, 7), (6, 7), RED))   # 11-16 Jan Pongal
    t_style.append(('BACKGROUND', (2, 9), (2, 9), RED))   # 26-Jan
    t_style.append(('BACKGROUND', (6, 11), (6, 11), RED)) # 13-Feb
    t_style.append(('BACKGROUND', (4, 12), (6, 12), BLUE)) # 18,19,20-Feb Mid-II
    t_style.append(('BACKGROUND', (6, 14), (6, 14), RED)) # 06-Mar
    t_style.append(('BACKGROUND', (3, 15), (3, 15), RED)) # 10-Mar
    t_style.append(('BACKGROUND', (6, 15), (6, 15), RED)) # 13-Mar
    t_style.append(('BACKGROUND', (1, 17), (1, 17), RED)) # 22-Mar
    t_style.append(('BACKGROUND', (5, 17), (5, 17), RED)) # 26-Mar
    t_style.append(('BACKGROUND', (3, 19), (3, 19), RED)) # 07-Apr
    t_style.append(('BACKGROUND', (4, 19), (5, 19), BLUE)) # 8,9-Apr Mid-III
    t_style.append(('BACKGROUND', (6, 19), (6, 19), RED)) # 10-Apr
    t_style.append(('BACKGROUND', (3, 20), (3, 20), RED)) # 14-Apr
    t_style.append(('BACKGROUND', (1, 21), (6, 21), GREEN)) # 19-24 Apr EST
    t_style.append(('BACKGROUND', (1, 22), (5, 22), GREEN)) # 26-30 Apr EST

    grid_table = Table(table_data, colWidths=col_widths)
    grid_table.setStyle(TableStyle(t_style))

    even_holidays_data = [
        [
            Paragraph("<b>Date & Day</b>", legend_txt_bold),
            Paragraph("<b>Holiday Name & Cultural / Statutory Reason</b>", legend_txt_bold),
            Paragraph("<b>Classification</b>", legend_txt_bold),
            Paragraph("<b>Date & Day</b>", legend_txt_bold),
            Paragraph("<b>Holiday Name & Cultural / Statutory Reason</b>", legend_txt_bold),
            Paragraph("<b>Classification</b>", legend_txt_bold)
        ],
        [
            Paragraph("<b>12-Dec-2026 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt),
            Paragraph("<b>13-Mar-2027 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ],
        [
            Paragraph("<b>25-Dec-2026 (Fri)</b>", legend_txt),
            Paragraph("Christmas (Celebration of Nativity of Jesus Christ)", legend_txt),
            Paragraph("National Holiday", legend_txt),
            Paragraph("<b>22-Mar-2027 (Mon)</b>", legend_txt),
            Paragraph("Ugadi (Telugu New Year / Chaitra Suddha Padyami)", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ],
        [
            Paragraph("<b>11–16 Jan 2027</b>", legend_txt),
            Paragraph("Sankranti / Pongal Vacation (Bhogi, Sankranti & Kanuma)", legend_txt),
            Paragraph("Institutional Vacation", legend_txt),
            Paragraph("<b>26-Mar-2027 (Fri)</b>", legend_txt),
            Paragraph("Good Friday (Crucifixion of Lord Jesus Christ)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt)
        ],
        [
            Paragraph("<b>26-Jan-2027 (Tue)</b>", legend_txt),
            Paragraph("Republic Day (Commemoration of Indian Constitution)", legend_txt),
            Paragraph("National Holiday", legend_txt),
            Paragraph("<b>07-Apr-2027 (Wed)</b>", legend_txt),
            Paragraph("Babu Jagjivan Ram Jayanti / Sri Rama Navami", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ],
        [
            Paragraph("<b>13-Feb-2027 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt),
            Paragraph("<b>10-Apr-2027 (Sat)</b>", legend_txt),
            Paragraph("Second Saturday (Mandatory State Educational Rule)", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ],
        [
            Paragraph("<b>06-Mar-2027 (Sat)</b>", legend_txt),
            Paragraph("Maha Shivratri (Great Night of Lord Shiva / Fasting)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt),
            Paragraph("<b>14-Apr-2027 (Wed)</b>", legend_txt),
            Paragraph("Dr. B.R. Ambedkar Jayanti (Constitution Architect)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt)
        ],
        [
            Paragraph("<b>10-Mar-2027 (Wed)</b>", legend_txt),
            Paragraph("Eid-ul-Fitr / Ramzan (Culmination of Ramadan Fasting)", legend_txt),
            Paragraph("Gazetted Holiday", legend_txt),
            Paragraph("<b>01-May-2027 (Sat)</b>", legend_txt),
            Paragraph("May Day (International Workers' Day Observance)", legend_txt),
            Paragraph("State Gazetted", legend_txt)
        ]
    ]

    h_table = Table(even_holidays_data, colWidths=[90, 195, 75, 85, 190, 75])
    h_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#0F172A')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#E2E8F0')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
    ]))

    story = [
        grid_table,
        Spacer(1, 6),
        Paragraph("<b>Gazetted Holidays & Statutory Observances (Even Semester 2026-27):</b>", legend_title),
        Spacer(1, 3),
        h_table
    ]

    doc.build(story)

# =========================================================================
# PAGE 4: COMPREHENSIVE CONSOLIDATED STATUTORY DIRECTORY & AUDIT
# =========================================================================
def build_page4(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=30,
        rightMargin=30,
        topMargin=22,
        bottomMargin=18
    )

    h_dir_title = ParagraphStyle(name='DirTitle', fontName='Helvetica-Bold', fontSize=12, leading=14, alignment=TA_CENTER)
    h_dir_sub = ParagraphStyle(name='DirSub', fontName='Helvetica', fontSize=8, leading=10, alignment=TA_CENTER)
    t_hdr = ParagraphStyle(name='THdr', fontName='Helvetica-Bold', fontSize=7.2, leading=8.5, alignment=TA_CENTER, textColor=colors.white)
    t_cell = ParagraphStyle(name='TCell', fontName='Helvetica', fontSize=6.5, leading=7.8, alignment=TA_LEFT)
    t_cell_bold = ParagraphStyle(name='TCellBold', fontName='Helvetica-Bold', fontSize=6.5, leading=7.8, alignment=TA_LEFT)
    t_cell_center = ParagraphStyle(name='TCellCenter', fontName='Helvetica', fontSize=6.5, leading=7.8, alignment=TA_CENTER)

    all_holidays = [
        ("1", "11-Jul-2026", "Saturday", "Second Saturday", "Odd", "Mandatory State Gazette rule for colleges/universities"),
        ("2", "08-Aug-2026", "Saturday", "Second Saturday", "Odd", "Mandatory State Gazette rule for colleges/universities"),
        ("3", "15-Aug-2026", "Saturday", "Independence Day", "Odd", "Commemoration of 79th Indian Independence Day (National Holiday)"),
        ("4", "21-Aug-2026", "Friday", "Sri Varalakshmi Vratam", "Odd", "Auspicious Hindu festival dedicated to Goddess Lakshmi"),
        ("5", "22-Aug-2026", "Saturday", "Sri Krishna Janmashtami", "Odd", "Celebration of the birth of Lord Krishna (Gokulashtami)"),
        ("6", "25-Aug-2026", "Tuesday", "Milad-un-Nabi (Id-e-Milad)", "Odd", "Commemoration of the birth of Prophet Muhammad (PBUH)"),
        ("7", "04-Sep-2026", "Friday", "Parsi New Year / Optional", "Odd", "State optional holiday for socio-cultural festivals"),
        ("8", "12-Sep-2026", "Saturday", "Second Saturday", "Odd", "Mandatory State Gazette rule for colleges/universities"),
        ("9", "14-Sep-2026", "Monday", "Vinayaka Chavithi (Ganesh)", "Odd", "Grand festival of Lord Ganesha (Bhadrapada Sukla Chavithi)"),
        ("10", "02-Oct-2026", "Friday", "Mahatma Gandhi Jayanti", "Odd", "Celebration of Mahatma Gandhi's birth anniversary (National Holiday)"),
        ("11", "10-Oct-2026", "Saturday", "Second Saturday", "Odd", "Mandatory State Gazette rule for colleges/universities"),
        ("12", "19-Oct-2026", "Monday", "Dussehra Vacation (Day 1)", "Odd", "Durgashtami / Bathukamma Festivities institutional recess"),
        ("13", "20-Oct-2026", "Tuesday", "Dussehra (Vijaya Dasami)", "Odd", "Triumph of good over evil (Lord Rama & Goddess Durga)"),
        ("14", "21–24 Oct", "Wed–Sat", "Extended Dussehra Vacation", "Odd", "Institutional festive break for outstation hostel residents"),
        ("15", "14-Nov-2026", "Saturday", "Deepavali & Second Saturday", "Odd", "Naraka Chaturdashi / Festival of Lights celebration"),
        ("16", "12-Dec-2026", "Saturday", "Second Saturday", "Even", "Mandatory State Gazette rule for colleges/universities"),
        ("17", "25-Dec-2026", "Friday", "Christmas", "Even", "Nativity of Jesus Christ (Celebrated across institutional campuses)"),
        ("18", "11–12 Jan", "Mon–Tue", "Sankranti Recess", "Even", "Commencement of traditional harvest celebration recess"),
        ("19", "13-Jan-2027", "Wednesday", "Bhogi Festival", "Even", "First day of Makara Sankranti festivities (Lohri/Bhogi campfire)"),
        ("20", "14-Jan-2027", "Thursday", "Makara Sankranti / Pongal", "Even", "Harvest festival marking Sun's transition into Capricorn"),
        ("21", "15-Jan-2027", "Friday", "Kanuma Festival", "Even", "Celebration of cattle and agrarian rural community"),
        ("22", "16-Jan-2027", "Saturday", "Mukkanuma / Extended Recess", "Even", "Conclusion of 6-day Pongal/Sankranti vacation"),
        ("23", "26-Jan-2027", "Tuesday", "Republic Day", "Even", "77th Republic Day celebrating enactment of Indian Constitution"),
        ("24", "13-Feb-2027", "Saturday", "Second Saturday", "Even", "Mandatory State Gazette rule for colleges/universities"),
        ("25", "06-Mar-2027", "Saturday", "Maha Shivratri", "Even", "Solemn night of Lord Shiva observed with fasting and prayers"),
        ("26", "10-Mar-2027", "Wednesday", "Eid-ul-Fitr (Ramzan)", "Even", "Celebration marking culmination of the holy fasting month"),
        ("27", "13-Mar-2027", "Saturday", "Second Saturday", "Even", "Mandatory State Gazette rule for colleges/universities"),
        ("28", "22-Mar-2027", "Monday", "Ugadi (Telugu New Year)", "Even", "Chaitra Suddha Padyami heralds the Vedic astronomical year"),
        ("29", "26-Mar-2027", "Friday", "Good Friday", "Even", "Christian solemn day of meditation on the Passion of Christ"),
        ("30", "07-Apr-2027", "Wednesday", "Babu Jagjivan Ram / Ram Navami", "Even", "Commemoration of freedom fighter & Sri Rama Navami"),
        ("31", "10-Apr-2027", "Saturday", "Second Saturday", "Even", "Mandatory State Gazette rule for colleges/universities"),
        ("32", "14-Apr-2027", "Wednesday", "Dr. B.R. Ambedkar Jayanti", "Even", "Birth anniversary of Chief Architect of Constitution of India")
    ]

    t_data = [
        [
            Paragraph("<b>#</b>", t_hdr),
            Paragraph("<b>Date</b>", t_hdr),
            Paragraph("<b>Day</b>", t_hdr),
            Paragraph("<b>Holiday Name</b>", t_hdr),
            Paragraph("<b>Sem</b>", t_hdr),
            Paragraph("<b>Statutory Background & Reason for Observance</b>", t_hdr)
        ]
    ]

    for item in all_holidays:
        t_data.append([
            Paragraph(item[0], t_cell_center),
            Paragraph(f"<b>{item[1]}</b>", t_cell),
            Paragraph(item[2], t_cell),
            Paragraph(f"<b>{item[3]}</b>", t_cell_bold),
            Paragraph(item[4], t_cell_center),
            Paragraph(item[5], t_cell)
        ])

    table = Table(t_data, colWidths=[22, 66, 50, 118, 32, 264])
    table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#0F172A')),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 1.2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 1.2),
        *[('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')) for i in range(2, len(t_data), 2)]
    ]))

    summary_box_data = [
        [
            Paragraph("<b>Institutional Academic Calendar Audit (A.Y: 2026-27 E1 to E4)</b>", ParagraphStyle(name='SummHdr', fontName='Helvetica-Bold', fontSize=7.8, leading=9.5, textColor=colors.HexColor('#0F172A'))),
            Paragraph("<b>UGC & AICTE Statutory Compliance</b>", ParagraphStyle(name='SummHdr2', fontName='Helvetica-Bold', fontSize=7.8, leading=9.5, alignment=TA_RIGHT, textColor=colors.HexColor('#16A34A')))
        ],
        [
            Paragraph("• <b>Odd Semester Instruction Days:</b> 88 Days (Commences 29-Jun-2026 | Closing 04-Nov-2026)<br/>"
                      "• <b>Even Semester Instruction Days:</b> 84 Days (Commences 01-Dec-2026 | Closing 05-Apr-2027)<br/>"
                      "• <b>Continuous Assessments:</b> 3 Mandatory Mid Tests per semester with structured result timelines.<br/>"
                      "• <b>Examination Windows:</b> 12 Contiguous Days for EST Theory & 6 Days for Lab Practical Exams.",
                      ParagraphStyle(name='SummBody', fontName='Helvetica', fontSize=6.8, leading=8.5)),
            Paragraph("• <b>Total Instructional Days:</b> 172 Contact Days across academic cycle.<br/>"
                      "• <b>Total Gazetted & Institutional Recess:</b> 32 Observances mapped.<br/>"
                      "• <b>Zero Clashes:</b> All holidays synchronized with national & state gazettes.<br/>"
                      "• <b>Status:</b> Fully compliant with UGC Section 3 & AICTE Handbook norms.",
                      ParagraphStyle(name='SummBody2', fontName='Helvetica', fontSize=6.8, leading=8.5))
        ]
    ]
    summary_table = Table(summary_box_data, colWidths=[276, 276])
    summary_table.setStyle(TableStyle([
        ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor('#16A34A')),
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F0FDF4')),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
    ]))

    story = [
        Paragraph("<u><b>Comprehensive Statutory Holiday Directory & Regulatory Audit (A.Y: 2026-27)</b></u>", h_dir_title),
        Spacer(1, 2),
        Paragraph("Applicable for RGUKT B.Tech Programs (E1, E2, E3, E4) — Synchronized with Gazetted Festivals & AICTE Norms", h_dir_sub),
        Spacer(1, 4),
        table,
        Spacer(1, 5),
        summary_table
    ]

    doc.build(story)

# =========================================================================
# MAIN ORCHESTRATOR & ASSEMBLY
# =========================================================================
def generate_master_calendar_pdf(output_paths=None):
    repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_target = os.path.join(repo_root, "eduflow-core", "web", "public", "Academic_Calendar_2026_27_E1_to_E4.pdf")
    root_target = os.path.join(repo_root, "Academic_Calendar_2026_27_E1_to_E4.pdf")

    if output_paths is None:
        output_paths = [
            root_target,
            public_target,
            "/home/rgukt/.gemini/antigravity/brain/485cec2e-6fb5-44a7-8b28-b2980d838b01/Academic_Calendar_2026_27_E1_to_E4.pdf"
        ]

    with tempfile.TemporaryDirectory() as tmpdir:
        p1 = os.path.join(tmpdir, "p1.pdf")
        p2 = os.path.join(tmpdir, "p2.pdf")
        p3 = os.path.join(tmpdir, "p3.pdf")
        p4 = os.path.join(tmpdir, "p4.pdf")

        build_page1(p1)
        build_page2(p2)
        build_page3(p3)
        build_page4(p4)

        master = fitz.open()
        for p in [p1, p2, p3, p4]:
            sub = fitz.open(p)
            master.insert_pdf(sub)

        for out in output_paths:
            os.makedirs(os.path.dirname(out), exist_ok=True)
            master.save(out)
            print(f"Generated Academic Calendar PDF: {out}")

        return output_paths[0]

if __name__ == '__main__':
    targets = []
    args = sys.argv[1:]
    i = 0
    while i < len(args):
        if args[i] in ['--output', '-o'] and i + 1 < len(args):
            targets.append(args[i + 1])
            i += 2
        elif not args[i].startswith('-'):
            targets.append(args[i])
            i += 1
        else:
            i += 1
    
    if targets:
        generate_master_calendar_pdf(targets)
    else:
        generate_master_calendar_pdf()
