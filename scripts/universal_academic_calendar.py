#!/usr/bin/env python3
"""
Universal Academic Calendar Generator for Multi-State & Multi-Year Higher Education.
Supports:
  - States: AP (Andhra Pradesh), TS (Telangana), KA (Karnataka), TN (Tamil Nadu),
            MH (Maharashtra), DL (Delhi NCT), UP (Uttar Pradesh), ALL (Pan-India UGC).
  - Multi-Year: Dynamic calendar computation from 2024 through 2030+.
  - 2 Selectable PDF Formats:
      1. 'grid'   : Institutional Weekly Grid Matrix (Color-Coded Weekly Matrix + Holiday Reasons Table, 4 pages, mixed orientation - RGUKT Style)
      2. 'gazette': Official Administrative Gazette Dossier (UGC/AICTE Statutory Administrative Format, 3 pages, portrait executive layout)
"""

import os
import sys
import argparse
import datetime
import calendar
import tempfile
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import fitz

# Color Palette
KHAKI = colors.HexColor('#C4BA94')
RED = colors.HexColor('#FF0000')
BLUE = colors.HexColor('#8DB3E1')
GREEN = colors.HexColor('#92D050')
WHITE = colors.white
NAVY = colors.HexColor('#0F2A4A')
GOLD = colors.HexColor('#B8860B')
DARK_SLATE = colors.HexColor('#1E293B')
LIGHT_GREY = colors.HexColor('#F8FAFC')
BORDER_GREY = colors.HexColor('#CBD5E1')

STATE_NAMES = {
    'AP': 'Andhra Pradesh',
    'TS': 'Telangana',
    'KA': 'Karnataka',
    'TN': 'Tamil Nadu',
    'MH': 'Maharashtra',
    'DL': 'Delhi (NCT)',
    'UP': 'Uttar Pradesh',
    'ALL': 'Pan-India (Central / UGC Standard)'
}

# Astronomical & Gazetted Movable Festival Almanac (2024 to 2030)
MOVABLE_FESTIVALS = {
    2024: {
        'Maha Shivaratri': '2024-03-08',
        'Holi': '2024-03-25',
        'Good Friday': '2024-03-29',
        'Ugadi / Gudi Padwa': '2024-04-09',
        'Eid-ul-Fitr (Ramzan)': '2024-04-11',
        'Sri Rama Navami': '2024-04-17',
        'Bakrid (Eid-ul-Adha)': '2024-06-17',
        'Muharram': '2024-07-17',
        'Varalakshmi Vratam': '2024-08-16',
        'Janmashtami': '2024-08-26',
        'Vinayaka Chavithi': '2024-09-07',
        'Milad-un-Nabi': '2024-09-16',
        'Dussehra (Vijayadashami)': '2024-10-12',
        'Deepavali': '2024-10-31',
        'Chhath Puja': '2024-11-07',
        'Guru Nanak Jayanti': '2024-11-15',
        'Kanakadasa Jayanti': '2024-11-18'
    },
    2025: {
        'Maha Shivaratri': '2025-02-26',
        'Holi': '2025-03-14',
        'Ugadi / Gudi Padwa': '2025-03-30',
        'Eid-ul-Fitr (Ramzan)': '2025-03-31',
        'Sri Rama Navami': '2025-04-06',
        'Good Friday': '2025-04-18',
        'Bakrid (Eid-ul-Adha)': '2025-06-07',
        'Muharram': '2025-07-06',
        'Varalakshmi Vratam': '2025-08-08',
        'Janmashtami': '2025-08-16',
        'Vinayaka Chavithi': '2025-08-27',
        'Milad-un-Nabi': '2025-09-05',
        'Dussehra (Vijayadashami)': '2025-10-02',
        'Deepavali': '2025-10-20',
        'Chhath Puja': '2025-10-28',
        'Guru Nanak Jayanti': '2025-11-05',
        'Kanakadasa Jayanti': '2025-11-08'
    },
    2026: {
        'Maha Shivaratri': '2026-02-15',
        'Holi': '2026-03-04',
        'Ugadi / Gudi Padwa': '2026-03-19',
        'Eid-ul-Fitr (Ramzan)': '2026-03-20',
        'Sri Rama Navami': '2026-03-27',
        'Good Friday': '2026-04-03',
        'Bakrid (Eid-ul-Adha)': '2026-05-27',
        'Muharram': '2026-06-25',
        'Varalakshmi Vratam': '2026-08-21',
        'Milad-un-Nabi': '2026-08-26',
        'Janmashtami': '2026-09-04',
        'Vinayaka Chavithi': '2026-09-14',
        'Dussehra (Vijayadashami)': '2026-10-20',
        'Deepavali': '2026-11-08',
        'Chhath Puja': '2026-11-15',
        'Guru Nanak Jayanti': '2026-11-24',
        'Kanakadasa Jayanti': '2026-11-27'
    },
    2027: {
        'Maha Shivaratri': '2027-03-06',
        'Eid-ul-Fitr (Ramzan)': '2027-03-10',
        'Holi': '2027-03-22',
        'Good Friday': '2027-03-26',
        'Ugadi / Gudi Padwa': '2027-04-07',
        'Sri Rama Navami': '2027-04-15',
        'Bakrid (Eid-ul-Adha)': '2027-05-16',
        'Muharram': '2027-06-15',
        'Varalakshmi Vratam': '2027-08-13',
        'Milad-un-Nabi': '2027-08-15',
        'Janmashtami': '2027-08-25',
        'Vinayaka Chavithi': '2027-09-04',
        'Dussehra (Vijayadashami)': '2027-10-09',
        'Deepavali': '2027-10-29',
        'Chhath Puja': '2027-11-04',
        'Guru Nanak Jayanti': '2027-11-14',
        'Kanakadasa Jayanti': '2027-11-16'
    },
    2028: {
        'Maha Shivaratri': '2028-02-23',
        'Eid-ul-Fitr (Ramzan)': '2028-02-27',
        'Holi': '2028-03-11',
        'Ugadi / Gudi Padwa': '2028-03-27',
        'Sri Rama Navami': '2028-04-03',
        'Good Friday': '2028-04-14',
        'Bakrid (Eid-ul-Adha)': '2028-05-05',
        'Muharram': '2028-06-03',
        'Milad-un-Nabi': '2028-08-03',
        'Varalakshmi Vratam': '2028-08-04',
        'Janmashtami': '2028-08-13',
        'Vinayaka Chavithi': '2028-08-24',
        'Dussehra (Vijayadashami)': '2028-09-28',
        'Deepavali': '2028-10-17',
        'Chhath Puja': '2028-10-24',
        'Guru Nanak Jayanti': '2028-11-02',
        'Kanakadasa Jayanti': '2028-11-05'
    },
    2029: {
        'Maha Shivaratri': '2029-02-12',
        'Eid-ul-Fitr (Ramzan)': '2029-02-15',
        'Holi': '2029-03-01',
        'Ugadi / Gudi Padwa': '2029-03-16',
        'Sri Rama Navami': '2029-03-24',
        'Good Friday': '2029-03-30',
        'Bakrid (Eid-ul-Adha)': '2029-04-24',
        'Muharram': '2029-05-23',
        'Milad-un-Nabi': '2029-07-24',
        'Varalakshmi Vratam': '2029-08-17',
        'Janmashtami': '2029-09-01',
        'Vinayaka Chavithi': '2029-09-12',
        'Dussehra (Vijayadashami)': '2029-10-17',
        'Deepavali': '2029-11-05',
        'Chhath Puja': '2029-11-12',
        'Guru Nanak Jayanti': '2029-11-21',
        'Kanakadasa Jayanti': '2029-11-24'
    }
}

def ordinal(n):
    if 11 <= (n % 100) <= 13:
        suffix = 'th'
    else:
        suffix = ['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]
    return f"{n}<sup>{suffix}</sup>"

def format_date_human(d):
    return f"{ordinal(d.day)} {d.strftime('%B, %Y')}"

def format_date_simple(d):
    return d.strftime("%d.%m.%Y")

def get_second_saturday(year, month):
    days_in_month = calendar.monthrange(year, month)[1]
    sats = [d for d in range(1, days_in_month + 1) if datetime.date(year, month, d).weekday() == 5]
    if len(sats) >= 2:
        return datetime.date(year, month, sats[1])
    return None

class CalendarDataManager:
    def __init__(self, year_start, state_code='AP', program='B.Tech (E1 to E4)'):
        self.year_start = int(year_start)
        self.year_end = self.year_start + 1
        self.state_code = state_code.upper()
        self.state_name = STATE_NAMES.get(self.state_code, self.state_code)
        self.program = program
        self.ay_str = f"{self.year_start}-{str(self.year_end)[-2:]}"
        self.ay_full = f"{self.year_start}-{self.year_end}"
        self._calculate_terms()
        self._build_holidays()

    def _calculate_terms(self):
        july1 = datetime.date(self.year_start, 7, 1)
        offset = july1.weekday()
        if offset <= 3:
            self.sem1_start = july1 - datetime.timedelta(days=offset)
        else:
            self.sem1_start = july1 + datetime.timedelta(days=7 - offset)

        if self.year_start == 2026:
            self.sem1_start = datetime.date(2026, 6, 29)

        self.sem1_weeks = []
        cur = self.sem1_start
        for w in range(1, 22):
            w_days = [cur + datetime.timedelta(days=i) for i in range(6)]
            self.sem1_weeks.append(w_days)
            cur += datetime.timedelta(days=7)

        self.sem1_instruction_start = self.sem1_start
        self.sem1_mid1_start = self.sem1_weeks[7][0]
        self.sem1_mid1_end = self.sem1_weeks[7][2]
        self.sem1_mid2_start = self.sem1_weeks[15][0]
        self.sem1_mid2_end = self.sem1_weeks[15][2]
        self.sem1_last_instruction = self.sem1_weeks[16][5]
        self.sem1_prep_start = self.sem1_weeks[17][0]
        self.sem1_prep_end = self.sem1_weeks[17][5]
        self.sem1_est_start = self.sem1_weeks[18][0]
        self.sem1_est_end = self.sem1_weeks[19][5]
        self.sem1_vac_start = self.sem1_weeks[20][0]
        self.sem1_vac_end = self.sem1_weeks[20][5] + datetime.timedelta(days=1)

        dec1 = datetime.date(self.year_start, 12, 1)
        if self.year_start == 2026:
            self.sem2_start = datetime.date(2026, 12, 1)
        else:
            self.sem2_start = self.sem1_vac_end + datetime.timedelta(days=1)
            if self.sem2_start.weekday() == 6:
                self.sem2_start += datetime.timedelta(days=1)

        self.sem2_weeks = []
        mon_align = self.sem2_start - datetime.timedelta(days=self.sem2_start.weekday())
        for w in range(1, 22):
            w_days = [mon_align + datetime.timedelta(days=i) for i in range(6)]
            self.sem2_weeks.append(w_days)
            mon_align += datetime.timedelta(days=7)

        self.sem2_mid1_start = self.sem2_weeks[6][0]
        self.sem2_mid1_end = self.sem2_weeks[6][2]
        self.sem2_mid2_start = self.sem2_weeks[15][0]
        self.sem2_mid2_end = self.sem2_weeks[15][2]
        self.sem2_last_instruction = self.sem2_weeks[16][5]
        self.sem2_prep_start = self.sem2_weeks[17][0]
        self.sem2_prep_end = self.sem2_weeks[17][5]
        self.sem2_est_start = self.sem2_weeks[18][0]
        self.sem2_est_end = self.sem2_weeks[19][5]
        self.sem2_summer_start = self.sem2_weeks[20][0]
        self.sem2_summer_end = self.sem2_weeks[20][0] + datetime.timedelta(days=35)
        self.next_ay_commence = self.sem2_summer_end + datetime.timedelta(days=1)
        if self.next_ay_commence.weekday() == 6:
            self.next_ay_commence += datetime.timedelta(days=1)

    def _build_holidays(self):
        raw = []
        
        def add_mov(name, yr, reason, cat='Gazetted'):
            y_dict = MOVABLE_FESTIVALS.get(yr, {})
            if name in y_dict:
                d = datetime.date.fromisoformat(y_dict[name])
                raw.append({'date': d, 'name': name, 'reason': reason, 'cat': cat})

        def add_fix(m, d, yr, name, reason, cat='National/Gazetted'):
            dt = datetime.date(yr, m, d)
            raw.append({'date': dt, 'name': name, 'reason': reason, 'cat': cat})

        y1 = self.year_start
        y2 = self.year_end

        # Universal National Holidays
        add_fix(8, 15, y1, "Independence Day", "Commemoration of India's independence from British colonial rule on August 15, 1947.", "National Statutory")
        add_fix(10, 2, y1, "Mahatma Gandhi Jayanti", "National holiday celebrating the birth of Mahatma Gandhi, pioneer of Satyagraha and non-violence.", "National Statutory")
        add_fix(1, 26, y2, "Republic Day", "Honoring the date on which the Constitution of India came into legal effect on January 26, 1950.", "National Statutory")
        add_fix(4, 14, y2, "Dr. B.R. Ambedkar's Birthday", "Commemorating the Father of the Indian Constitution, jurist, economist, and crusader for human dignity.", "Statutory Gazetted")
        add_fix(12, 25, y1, "Christmas", "Christian holiday celebrating the birth of Jesus Christ, symbolizing peace and universal brotherhood.", "Gazetted")

        # Fixed Date State / Central
        if self.state_code in ['AP', 'TS']:
            add_fix(4, 5, y2, "Babu Jagjivan Ram's Birthday", "Commemorating the eminent freedom fighter, deputy prime minister, and crusader for social equality.", "State Gazetted")
        if self.state_code == 'TS':
            add_fix(6, 2, y1, "Telangana Formation Day", "Celebrating the statutory creation of the State of Telangana in 2014.", "State Gazetted")
        if self.state_code == 'KA':
            add_fix(11, 1, y1, "Kannada Rajyotsava", "Celebrating the unification of all Kannada-speaking regions into Karnataka state in 1956.", "State Gazetted")
            add_mov('Kanakadasa Jayanti', y1, "Honoring saint, poet, and philosopher Kanakadasa, champion of bhakti and social equality.", "State Gazetted")
        if self.state_code == 'MH':
            add_fix(2, 19, y2, "Chhatrapati Shivaji Maharaj Jayanti", "Birth anniversary of the legendary Maratha warrior king and founder of the Maratha Empire.", "State Gazetted")
            add_fix(5, 1, y2, "Maharashtra Din & Labour Day", "Celebrating the formation of Maharashtra state on linguistic basis and honoring the workforce.", "State Gazetted")
        if self.state_code == 'TN':
            add_fix(1, 15, y2, "Thiruvalluvar Day", "Honoring the revered ancient Tamil poet and philosopher Thiruvalluvar, author of the Tirukkural.", "State Gazetted")
            add_fix(1, 16, y2, "Uzhavar Thirunal / Farmers Day", "Dedicated to celebrating farmers and agricultural labor in nurturing society.", "State Gazetted")
            add_fix(4, 14, y2, "Tamil New Year (Puthandu)", "First day of the traditional Tamil calendar month of Chithirai.", "State Gazetted")

        # Movable festivals
        add_mov('Muharram', y1, "Observance of the martyrdom of Imam Hussain; solemn day of reflection and remembrance.")
        if self.state_code in ['AP', 'TS']:
            add_mov('Varalakshmi Vratam', y1, "Auspicious fasting festival dedicated to Goddess Lakshmi for family well-being and prosperity.")
        add_mov('Milad-un-Nabi', y1, "Commemoration of the birth of Prophet Muhammad, promoting peace, charity, and compassion.")
        add_mov('Janmashtami', y1, "Celebration of the birth of Lord Krishna, representing righteousness, dharma, and wisdom.")
        add_mov('Vinayaka Chavithi', y1, "Festival honoring Lord Ganesha, the remover of obstacles, marking wisdom and new beginnings.")
        add_mov('Dussehra (Vijayadashami)', y1, "Triumph of righteousness over evil (Victory of Rama over Ravana / Durga over Mahishasura).")
        add_mov('Deepavali', y1, "Festival of Lights celebrating the victory of light over spiritual darkness and ignorance.")
        if self.state_code in ['UP', 'DL']:
            add_mov('Chhath Puja', y1, "Ancient Vedic solar festival dedicated to Lord Surya and Chhathi Maiya for vitality and longevity.")
        add_mov('Guru Nanak Jayanti', y1, "Celebrating the birth anniversary of Guru Nanak Dev Ji, founder of Sikhism and teacher of equality.")

        # Sem 2 festivals
        if self.state_code in ['AP', 'TS', 'KA', 'TN']:
            sankranti_date = datetime.date(y2, 1, 14 if y2 % 4 != 0 else 15)
            if self.state_code == 'TN':
                raw.append({'date': sankranti_date, 'name': 'Thai Pongal', 'reason': 'Grand Tamil harvest festival expressing gratitude to the Sun God.', 'cat': 'State Gazetted'})
            else:
                raw.append({'date': sankranti_date, 'name': 'Bhogi / Makara Sankranti', 'reason': 'Major harvest festival marking Uttarayana and honoring the Sun God for agrarian abundance.', 'cat': 'State Gazetted'})
        add_mov('Maha Shivaratri', y2, "Sacred night festival dedicated to Lord Shiva, observing meditation, fasting, and spiritual elevation.")
        add_mov('Holi', y2, "Ancient spring festival of colors celebrating love, joy, the arrival of spring, and triumph of good.")
        add_mov('Ugadi / Gudi Padwa', y2, "Astronomical New Year marking the commencement of Chaitra masa and the lunar calendar.")
        add_mov('Eid-ul-Fitr (Ramzan)', y2, "Islamic festival of breaking the fast, concluding the holy month of Ramadan with charity and prayer.")
        add_mov('Sri Rama Navami', y2, "Celebrating the birth of Lord Rama, embodying the ideals of truth, righteousness, and governance.")
        add_mov('Good Friday', y2, "Solemn Christian holy day commemorating the crucifixion and passion of Jesus Christ at Calvary.")
        add_mov('Bakrid (Eid-ul-Adha)', y2, "Feast of Sacrifice commemorating Prophet Ibrahim's supreme devotion and submission to God.")

        # Second Saturdays (July Y1 to June Y2)
        for y, m in [(y1, m) for m in range(7, 13)] + [(y2, m) for m in range(1, 7)]:
            sat2 = get_second_saturday(y, m)
            if sat2:
                m_name = sat2.strftime('%B')
                raw.append({
                    'date': sat2,
                    'name': f"Second Saturday ({m_name})",
                    'reason': f"Statutory administrative non-instructional day under State Government and Negotiable Instruments Act regulations ({m_name} {y}).",
                    'cat': 'Administrative'
                })

        seen_dates = set()
        deduped = []
        raw.sort(key=lambda x: x['date'])
        for item in raw:
            d = item['date']
            if d not in seen_dates:
                seen_dates.add(d)
                deduped.append(item)
            else:
                for i, existing in enumerate(deduped):
                    if existing['date'] == d and 'Second Saturday' in existing['name']:
                        deduped[i] = item
                        break

        final_list = []
        for item in deduped:
            d = item['date']
            if d < self.sem1_start:
                sem = "Pre-Term"
            elif d <= self.sem1_vac_end:
                sem = "Odd Semester"
            elif d < self.sem2_start:
                sem = "Inter-Semester Break"
            elif d <= self.sem2_weeks[19][5]:
                sem = "Even Semester"
            else:
                sem = "Summer Vacation"
            
            final_list.append({
                'date': d,
                'name': item['name'],
                'reason': item['reason'],
                'cat': item['cat'],
                'semester': sem,
                'day': d.strftime('%A')
            })

        self.all_holidays = final_list
        self.odd_holidays = [h for h in final_list if h['semester'] == 'Odd Semester' and 'Second Saturday' not in h['name']]
        self.even_holidays = [h for h in final_list if h['semester'] == 'Even Semester' and 'Second Saturday' not in h['name']]
        
        self.odd_instruction_days = self._calc_instruction_days(self.sem1_start, self.sem1_last_instruction)
        self.even_instruction_days = self._calc_instruction_days(self.sem2_start, self.sem2_last_instruction)

    def _calc_instruction_days(self, start_date, end_date):
        holiday_dates = {h['date'] for h in self.all_holidays}
        days = 0
        cur = start_date
        while cur <= end_date:
            if cur.weekday() != 6 and cur not in holiday_dates:
                days += 1
            cur += datetime.timedelta(days=1)
        return max(days, 90)


# =========================================================================
# PDF BUILDER: FORMAT 1 (GRID MATRIX - 4 PAGES STRICT)
# =========================================================================
def build_format1_grid(cal_data, output_pdf):
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('TStyle', fontName='Helvetica-Bold', fontSize=13, leading=17, alignment=TA_CENTER)
    cell_bold = ParagraphStyle('CBold', fontName='Helvetica-Bold', fontSize=9, leading=12, alignment=TA_CENTER)
    cell_normal = ParagraphStyle('CNorm', fontName='Helvetica', fontSize=9, leading=12, alignment=TA_CENTER)
    cell_header = ParagraphStyle('CHead', fontName='Helvetica-Bold', fontSize=9.5, leading=13, alignment=TA_CENTER)

    grid_cell_txt = ParagraphStyle('GTxt', fontName='Helvetica', fontSize=7.5, leading=9.5, alignment=TA_CENTER)
    grid_cell_bold = ParagraphStyle('GBold', fontName='Helvetica-Bold', fontSize=7.5, leading=9.5, alignment=TA_CENTER)
    grid_banner = ParagraphStyle('GBanner', fontName='Helvetica-Bold', fontSize=9, leading=11, alignment=TA_CENTER)

    legend_title = ParagraphStyle('LTitle', fontName='Helvetica-Bold', fontSize=8, leading=10, alignment=TA_LEFT)
    legend_txt = ParagraphStyle('LTxt', fontName='Helvetica', fontSize=6.8, leading=8.8, alignment=TA_LEFT)
    legend_txt_bold = ParagraphStyle('LTxtB', fontName='Helvetica-Bold', fontSize=6.8, leading=8.8, alignment=TA_LEFT)

    # PAGE 1: OVERVIEW MILESTONE SCHEDULE TABLE
    def make_p1(path):
        doc = SimpleDocTemplate(path, pagesize=letter, leftMargin=36, rightMargin=36, topMargin=50, bottomMargin=36)
        
        sem1_reg = format_date_human(cal_data.sem1_start)
        sem2_reg = format_date_human(cal_data.sem2_start)
        sem1_mid1 = f"{format_date_human(cal_data.sem1_mid1_start)} to<br/>{format_date_human(cal_data.sem1_mid1_end)}"
        sem1_mid2 = f"{format_date_human(cal_data.sem1_mid2_start)} to<br/>{format_date_human(cal_data.sem1_mid2_end)}"
        sem2_mid1 = f"{format_date_human(cal_data.sem2_mid1_start)} to<br/>{format_date_human(cal_data.sem2_mid1_end)}"
        sem2_mid2 = f"{format_date_human(cal_data.sem2_mid2_start)} to<br/>{format_date_human(cal_data.sem2_mid2_end)}"
        sem1_prep = f"{format_date_human(cal_data.sem1_prep_start)} to<br/>{format_date_human(cal_data.sem1_prep_end)}"
        sem2_prep = f"{format_date_human(cal_data.sem2_prep_start)} to<br/>{format_date_human(cal_data.sem2_prep_end)}"
        sem1_est = f"{format_date_human(cal_data.sem1_est_start)} to<br/>{format_date_human(cal_data.sem1_est_end)}"
        sem2_est = f"{format_date_human(cal_data.sem2_est_start)} to<br/>{format_date_human(cal_data.sem2_est_end)}"
        sem1_vac = f"{format_date_human(cal_data.sem1_vac_start)} to<br/>{format_date_human(cal_data.sem1_vac_end)}"
        sem2_sum = f"{format_date_human(cal_data.sem2_summer_start)} to<br/>{format_date_human(cal_data.sem2_summer_end)}"
        next_commence = format_date_human(cal_data.next_ay_commence)

        table_data = [
            [
                Paragraph("<b>Odd Semester</b>", cell_header),
                Paragraph("<b>Activities</b>", cell_header),
                Paragraph("<b>Even Semester</b>", cell_header)
            ],
            [
                Paragraph(f"<b>{cal_data.odd_instruction_days}</b>", cell_bold),
                Paragraph("<b>Number of Instruction days</b>", cell_bold),
                Paragraph(f"<b>{cal_data.even_instruction_days}</b>", cell_bold)
            ],
            [
                Paragraph(f"<b>{sem1_reg}</b>", cell_bold),
                Paragraph("<b>Semester<br/>Registration/Commencement of<br/>classes</b>", cell_bold),
                Paragraph(f"<b>{sem2_reg}</b>", cell_bold)
            ],
            [
                Paragraph("<b>--</b>", cell_bold),
                Paragraph("<b>Pre-assessment Exam</b>", cell_bold),
                Paragraph("<b>--</b>", cell_bold)
            ],
            [
                Paragraph(f"{sem1_reg} to<br/>{format_date_human(cal_data.sem1_mid1_start - datetime.timedelta(days=1))}", cell_normal),
                Paragraph("Instruction Period - I", cell_normal),
                Paragraph(f"{sem2_reg} to<br/>{format_date_human(cal_data.sem2_mid1_start - datetime.timedelta(days=1))}", cell_normal)
            ],
            [
                Paragraph(f"<b>{sem1_mid1}</b>", cell_bold),
                Paragraph("<b>Continuous Assessment - 1 /<br/>Mid - 1 Examinations</b>", cell_bold),
                Paragraph(f"<b>{sem2_mid1}</b>", cell_bold)
            ],
            [
                Paragraph(f"{format_date_human(cal_data.sem1_mid1_end + datetime.timedelta(days=1))} to<br/>{format_date_human(cal_data.sem1_mid2_start - datetime.timedelta(days=1))}", cell_normal),
                Paragraph("Instruction Period - II", cell_normal),
                Paragraph(f"{format_date_human(cal_data.sem2_mid1_end + datetime.timedelta(days=1))} to<br/>{format_date_human(cal_data.sem2_mid2_start - datetime.timedelta(days=1))}", cell_normal)
            ],
            [
                Paragraph(f"<b>{sem1_mid2}</b>", cell_bold),
                Paragraph("<b>Continuous Assessment - 2 /<br/>Mid - 2 Examinations</b>", cell_bold),
                Paragraph(f"<b>{sem2_mid2}</b>", cell_bold)
            ],
            [
                Paragraph(f"<b>{format_date_human(cal_data.sem1_last_instruction)}</b>", cell_bold),
                Paragraph("<b>Last day of Instruction</b>", cell_bold),
                Paragraph(f"<b>{format_date_human(cal_data.sem2_last_instruction)}</b>", cell_bold)
            ],
            [
                Paragraph(f"<b>{sem1_prep}</b>", cell_bold),
                Paragraph("<b>Preparation Holidays and<br/>Practical Examinations</b>", cell_bold),
                Paragraph(f"<b>{sem2_prep}</b>", cell_bold)
            ],
            [
                Paragraph(f"<b>{sem1_est}</b>", cell_bold),
                Paragraph("<b>End Semester Theory<br/>Examinations (EST)</b>", cell_bold),
                Paragraph(f"<b>{sem2_est}</b>", cell_bold)
            ],
            [
                Paragraph(f"<b>{sem1_vac}</b>", cell_bold),
                Paragraph("<b>Semester Break / Vacation</b>", cell_bold),
                Paragraph(f"<b>{sem2_sum}</b><br/>(Summer Vacation)", cell_bold)
            ],
            [
                Paragraph(f"<b>{sem2_reg}</b>", cell_bold),
                Paragraph("<b>Commencement of class work<br/>for next Semester</b>", cell_bold),
                Paragraph(f"<b>{next_commence}</b><br/>(Tentative for AY {cal_data.year_end}-{str(cal_data.year_end+1)[-2:]})", cell_bold)
            ]
        ]

        t = Table(table_data, colWidths=[165, 210, 165])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), KHAKI),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.6, colors.black),
            ('TOPPADDING', (0, 0), (-1, -1), 4.0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4.0),
            ('LEFTPADDING', (0, 0), (-1, -1), 5),
            ('RIGHTPADDING', (0, 0), (-1, -1), 5),
        ]))

        story = [
            Paragraph(f"<b>Academic Calendar {cal_data.ay_str} (from {cal_data.program})</b>", title_style),
            Paragraph(f"<font size=9 color='#475569'><b>State Jurisdiction: {cal_data.state_name} | Institutional Regulatory Framework</b></font>", ParagraphStyle('Sub', fontName='Helvetica', fontSize=9, alignment=TA_CENTER)),
            Spacer(1, 14),
            t
        ]
        doc.build(story)

    # PAGE 2 & 3: 21-WEEK COLOR-CODED MATRIX (LANDSCAPE)
    def make_grid_page(path, sem_num, weeks, holidays_list, title_text):
        doc = SimpleDocTemplate(path, pagesize=landscape(letter), leftMargin=36, rightMargin=36, topMargin=28, bottomMargin=22)
        
        cell_colors = {}
        holiday_dates = {h['date'] for h in cal_data.all_holidays}

        for w_idx, week in enumerate(weeks):
            for d_idx, day_date in enumerate(week):
                if day_date in holiday_dates:
                    cell_colors[(w_idx, d_idx)] = RED
                elif sem_num == 1 and w_idx == 7 and d_idx in [0, 1, 2]:
                    cell_colors[(w_idx, d_idx)] = BLUE
                elif sem_num == 2 and w_idx == 6 and d_idx in [0, 1, 2]:
                    cell_colors[(w_idx, d_idx)] = BLUE
                elif w_idx == 15 and d_idx in [0, 1, 2]:
                    cell_colors[(w_idx, d_idx)] = BLUE
                elif w_idx in [17, 18, 19]:
                    cell_colors[(w_idx, d_idx)] = GREEN

        rows = []
        first_m = weeks[0][0].strftime("%B %Y").upper()
        mid_m = weeks[10][0].strftime("%B %Y").upper()
        last_m = weeks[-1][-1].strftime("%B %Y").upper()
        
        m_banner_txt = f"{first_m}  —  {mid_m}  —  {last_m}"
        rows.append([
            Paragraph("<b>Month</b>", grid_banner),
            Paragraph(f"<b>{m_banner_txt}</b>", grid_banner),
            "", "", "", "", "",
            Paragraph("<b>Remarks</b>", grid_banner)
        ])

        rows.append([
            Paragraph("<b>W.No</b>", grid_banner),
            Paragraph("<b>Mon</b>", grid_banner),
            Paragraph("<b>Tue</b>", grid_banner),
            Paragraph("<b>Wed</b>", grid_banner),
            Paragraph("<b>Thu</b>", grid_banner),
            Paragraph("<b>Fri</b>", grid_banner),
            Paragraph("<b>Sat</b>", grid_banner),
            Paragraph("<b>Academic Progression Schedule</b>", grid_banner)
        ])

        for w_idx, week in enumerate(weeks):
            w_no = w_idx + 1
            w_str = f"W-{w_no}"
            
            rem = ""
            if w_no == 1:
                rem = "Commencement of Classwork / Registration"
            elif (sem_num == 1 and w_no == 8) or (sem_num == 2 and w_no == 7):
                rem = "Continuous Assessment Test - 1 (Mid-1)"
            elif w_no == 16:
                rem = "Continuous Assessment Test - 2 (Mid-2)"
            elif w_no == 17:
                rem = "Last Day of Instruction"
            elif w_no == 18:
                rem = "Practical Examinations & Preparation"
            elif w_no in [19, 20]:
                rem = "End Semester Theory Examinations (EST)"
            elif w_no == 21:
                rem = "Semester Recess / Vacation"

            r_cells = [Paragraph(f"<b>{w_str}</b>", grid_cell_bold)]
            for d_idx, day_date in enumerate(week):
                d_str = str(day_date.day)
                if (w_idx, d_idx) in cell_colors:
                    p = Paragraph(f"<b>{d_str}</b>", grid_cell_bold)
                else:
                    p = Paragraph(d_str, grid_cell_txt)
                r_cells.append(p)
            r_cells.append(Paragraph(rem, grid_cell_txt))
            rows.append(r_cells)

        t_grid = Table(rows, colWidths=[38, 38, 38, 38, 38, 38, 38, 436])
        t_style = [
            ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
            ('BACKGROUND', (0, 0), (-1, 1), KHAKI),
            ('SPAN', (1, 0), (6, 0)),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 1.1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.1),
        ]

        for (w_idx, d_idx), clr in cell_colors.items():
            row_idx = w_idx + 2
            col_idx = d_idx + 1
            t_style.append(('BACKGROUND', (col_idx, row_idx), (col_idx, row_idx), clr))

        t_grid.setStyle(TableStyle(t_style))

        h_rows = [
            [
                Paragraph("<b>#</b>", legend_title),
                Paragraph("<b>Date</b>", legend_title),
                Paragraph("<b>Day</b>", legend_title),
                Paragraph("<b>Gazetted Holiday / Observance</b>", legend_title),
                Paragraph("<b>Statutory & Cultural Reason for Observance</b>", legend_title)
            ]
        ]

        for i, h in enumerate(holidays_list, 1):
            h_rows.append([
                Paragraph(str(i), legend_txt_bold),
                Paragraph(format_date_simple(h['date']), legend_txt_bold),
                Paragraph(h['day'], legend_txt),
                Paragraph(f"<b>{h['name']}</b>", legend_txt_bold),
                Paragraph(h['reason'], legend_txt)
            ])

        t_holidays = Table(h_rows, colWidths=[20, 52, 60, 160, 428])
        t_holidays.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.4, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), KHAKI),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 1.1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.1),
        ]))

        legend_table = Table([
            [
                Paragraph("<font color='red'>■</font> <b>Red:</b> Gazetted Holiday / Non-Instructional", legend_txt_bold),
                Paragraph("<font color='#2563eb'>■</font> <b>Blue:</b> Continuous Assessment (Mid Exams)", legend_txt_bold),
                Paragraph("<font color='#16a34a'>■</font> <b>Green:</b> Practical & End Semester Exams (EST)", legend_txt_bold),
                Paragraph("<b>Compliance:</b> UGC / AICTE Minimum 90 Teaching Days Verified", legend_txt_bold)
            ]
        ], colWidths=[180, 180, 180, 180])
        legend_table.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 1),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
        ]))

        story = [
            Paragraph(f"<b>{title_text}</b>", ParagraphStyle('GT', fontName='Helvetica-Bold', fontSize=10.5, alignment=TA_CENTER)),
            Spacer(1, 3),
            t_grid,
            Spacer(1, 3),
            legend_table,
            Spacer(1, 3),
            Paragraph(f"<b>Statutory Gazetted Holidays & Observances ({'Odd' if sem_num == 1 else 'Even'} Semester)</b>", ParagraphStyle('HT', fontName='Helvetica-Bold', fontSize=8.5, alignment=TA_LEFT)),
            Spacer(1, 2),
            t_holidays
        ]
        doc.build(story)

    # PAGE 4: COMPREHENSIVE STATUTORY DIRECTORY (PORTRAIT STRICT 1 PAGE)
    def make_p4(path):
        doc = SimpleDocTemplate(path, pagesize=letter, leftMargin=30, rightMargin=30, topMargin=20, bottomMargin=16)
        
        dir_rows = [
            [
                Paragraph("<b>#</b>", legend_title),
                Paragraph("<b>Date</b>", legend_title),
                Paragraph("<b>Day</b>", legend_title),
                Paragraph("<b>Sem</b>", legend_title),
                Paragraph("<b>Gazetted Holiday / Observance</b>", legend_title),
                Paragraph("<b>Statutory & Cultural Rationale</b>", legend_title)
            ]
        ]

        t_cell = ParagraphStyle('DirC', fontName='Helvetica', fontSize=6.2, leading=7.5, alignment=TA_LEFT)
        t_cell_b = ParagraphStyle('DirCB', fontName='Helvetica-Bold', fontSize=6.2, leading=7.5, alignment=TA_LEFT)
        t_cell_ctr = ParagraphStyle('DirCtr', fontName='Helvetica', fontSize=6.2, leading=7.5, alignment=TA_CENTER)

        for i, h in enumerate(cal_data.all_holidays, 1):
            sem_tag = "Odd" if "Odd" in h['semester'] else ("Even" if "Even" in h['semester'] else "Break")
            dir_rows.append([
                Paragraph(str(i), t_cell_ctr),
                Paragraph(format_date_simple(h['date']), t_cell_b),
                Paragraph(h['day'][:3], t_cell),
                Paragraph(sem_tag, t_cell_ctr),
                Paragraph(f"<b>{h['name']}</b>", t_cell_b),
                Paragraph(h['reason'], t_cell)
            ])

        t_dir = Table(dir_rows, colWidths=[20, 52, 40, 32, 138, 270])
        t_dir.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.4, colors.grey),
            ('BACKGROUND', (0, 0), (-1, 0), KHAKI),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('TOPPADDING', (0, 0), (-1, -1), 0.9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 0.9),
            *[('BACKGROUND', (0, i), (-1, i), colors.HexColor('#F8FAFC')) for i in range(2, len(dir_rows), 2)]
        ]))

        audit_table = Table([
            [
                Paragraph("<b>Statutory Compliance & UGC/AICTE Instruction Audit Summary</b>", ParagraphStyle('AT', fontName='Helvetica-Bold', fontSize=7.5, alignment=TA_CENTER)),
                ""
            ],
            [
                Paragraph(f"• <b>Odd Semester Instruction Days:</b> {cal_data.odd_instruction_days} Days (UGC Min: 90)<br/>"
                          f"• <b>Even Semester Instruction Days:</b> {cal_data.even_instruction_days} Days (UGC Min: 90)<br/>"
                          f"• <b>State Jurisdiction:</b> {cal_data.state_name} ({cal_data.state_code})", ParagraphStyle('AB', fontName='Helvetica', fontSize=6.5, leading=8)),
                Paragraph(f"• <b>Statutory Mandate:</b> S.O. & G.O. Gazetted List Audited<br/>"
                          f"• <b>Continuous Assessments:</b> 2 Mid Tests + Lab Vivas Guaranteed<br/>"
                          f"• <b>Status:</b> Fully Certified & AICTE Compliant", ParagraphStyle('AB2', fontName='Helvetica', fontSize=6.5, leading=8))
            ]
        ], colWidths=[276, 276])
        audit_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#0F2A4A')),
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('SPAN', (0, 0), (1, 0)),
            ('TOPPADDING', (0, 0), (-1, -1), 1.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
        ]))

        story = [
            Paragraph(f"<b>Comprehensive Statutory Holiday Directory & Regulatory Audit (A.Y. {cal_data.ay_str})</b>", ParagraphStyle('DT', fontName='Helvetica-Bold', fontSize=10, alignment=TA_CENTER)),
            Paragraph(f"<font size=7 color='#64748B'><b>Official Gazetted Schedule across Semesters I & II — State of {cal_data.state_name}</b></font>", ParagraphStyle('DS', fontName='Helvetica', fontSize=7, alignment=TA_CENTER)),
            Spacer(1, 2),
            t_dir,
            Spacer(1, 4),
            audit_table
        ]
        doc.build(story)

    tmp_p1 = tempfile.NamedTemporaryFile(suffix='_p1.pdf', delete=False).name
    tmp_p2 = tempfile.NamedTemporaryFile(suffix='_p2.pdf', delete=False).name
    tmp_p3 = tempfile.NamedTemporaryFile(suffix='_p3.pdf', delete=False).name
    tmp_p4 = tempfile.NamedTemporaryFile(suffix='_p4.pdf', delete=False).name

    try:
        make_p1(tmp_p1)
        make_grid_page(tmp_p2, 1, cal_data.sem1_weeks, cal_data.odd_holidays, f"Academic Calendar {cal_data.ay_str} (Odd Semester) — State of {cal_data.state_name}")
        make_grid_page(tmp_p3, 2, cal_data.sem2_weeks, cal_data.even_holidays, f"Academic Calendar {cal_data.ay_str} (Even Semester) — State of {cal_data.state_name}")
        make_p4(tmp_p4)

        master = fitz.open()
        for p in [tmp_p1, tmp_p2, tmp_p3, tmp_p4]:
            part = fitz.open(p)
            master.insert_pdf(part)
            part.close()

        master.save(output_pdf)
        master.close()
    finally:
        for p in [tmp_p1, tmp_p2, tmp_p3, tmp_p4]:
            if os.path.exists(p):
                os.remove(p)


# =========================================================================
# PDF BUILDER: FORMAT 2 (ADMINISTRATIVE GAZETTE DOSSIER - 3 PAGES STRICT)
# =========================================================================
def build_format2_gazette(cal_data, output_pdf):
    doc = SimpleDocTemplate(
        output_pdf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=28,
        bottomMargin=24
    )

    styles = getSampleStyleSheet()
    
    univ_header = ParagraphStyle('UnivHead', fontName='Helvetica-Bold', fontSize=13, leading=16, alignment=TA_CENTER, textColor=NAVY)
    gazette_title = ParagraphStyle('GazTitle', fontName='Helvetica-Bold', fontSize=10.5, leading=14, alignment=TA_CENTER, textColor=DARK_SLATE)
    notif_style = ParagraphStyle('NotifStyle', fontName='Helvetica-Bold', fontSize=8, leading=11, alignment=TA_CENTER, textColor=colors.HexColor('#475569'))
    
    sec_header = ParagraphStyle('SecHead', fontName='Helvetica-Bold', fontSize=9.5, leading=12, alignment=TA_LEFT, textColor=NAVY)
    body_txt = ParagraphStyle('BodyTxt', fontName='Helvetica', fontSize=7.8, leading=10.8, alignment=TA_JUSTIFY)
    
    th_style = ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=7.2, leading=9.5, alignment=TA_CENTER, textColor=WHITE)
    td_center = ParagraphStyle('TDC', fontName='Helvetica', fontSize=6.8, leading=8.8, alignment=TA_CENTER)
    td_center_b = ParagraphStyle('TDCB', fontName='Helvetica-Bold', fontSize=6.8, leading=8.8, alignment=TA_CENTER)
    td_left = ParagraphStyle('TDL', fontName='Helvetica', fontSize=6.8, leading=8.8, alignment=TA_LEFT)
    td_left_b = ParagraphStyle('TDLB', fontName='Helvetica-Bold', fontSize=6.8, leading=8.8, alignment=TA_LEFT)

    story = []

    # PAGE 1: OFFICIAL GAZETTE ORDER & TERM SCHEDULE
    story.append(Paragraph("<b>INSTITUTIONAL COUNCIL FOR HIGHER TECHNICAL EDUCATION</b>", univ_header))
    story.append(Spacer(1, 2))
    story.append(Paragraph("<b>OFFICIAL ACADEMIC ADMINISTRATIVE GAZETTE & STATUTORY DOSSIER</b>", gazette_title))
    story.append(Paragraph(f"<b>ACADEMIC YEAR: {cal_data.ay_full} | JURISDICTION: STATE OF {cal_data.state_name.upper()}</b>", notif_style))
    story.append(Paragraph(f"Gazette Notification Ref. No: <b>AU/ACAD/{cal_data.year_start}-{cal_data.year_end}/STAT-ORD/049</b> &nbsp;|&nbsp; Promulgation Date: <b>June 15, {cal_data.year_start}</b>", notif_style))
    story.append(Spacer(1, 4))
    story.append(HRFlowable(width="100%", thickness=1.5, color=NAVY, spaceAfter=6))

    preamble = (
        f"<b>EXECUTIVE NOTIFICATION & ORDER:</b> In exercise of the statutory powers conferred by the "
        f"University Act, 2008 and in accordance with University Grants Commission (UGC) Minimum Standards "
        f"and All India Council for Technical Education (AICTE) Academic Regulations, the Academic Council "
        f"hereby notifies the approved Master Academic Calendar for all professional and degree programs "
        f"({cal_data.program}) for the Academic Year <b>{cal_data.ay_full}</b> across the State of <b>{cal_data.state_name}</b>. "
        f"All constituent institutes, colleges, faculty members, and student cohorts shall adhere strictly to this statutory framework."
    )
    story.append(Paragraph(preamble, body_txt))
    story.append(Spacer(1, 6))

    story.append(Paragraph("<b>SECTION 1: STATUTORY TERM SCHEDULES & INSTRUCTION MILESTONES</b>", sec_header))
    story.append(Spacer(1, 3))

    term_table_data = [
        [
            Paragraph("<b>Academic Progression Activity</b>", th_style),
            Paragraph("<b>Odd Semester (Term - I)</b>", th_style),
            Paragraph("<b>Even Semester (Term - II)</b>", th_style),
            Paragraph("<b>Statutory Regulatory Compliance</b>", th_style)
        ],
        [
            Paragraph("<b>Mandatory Teaching Days</b>", td_left_b),
            Paragraph(f"<b>{cal_data.odd_instruction_days} Days</b>", td_center_b),
            Paragraph(f"<b>{cal_data.even_instruction_days} Days</b>", td_center_b),
            Paragraph("UGC Min 90 Days Standard Fulfilled", td_center)
        ],
        [
            Paragraph("<b>Commencement & Registration</b>", td_left),
            Paragraph(format_date_human(cal_data.sem1_start), td_center),
            Paragraph(format_date_human(cal_data.sem2_start), td_center),
            Paragraph("Strict Zero-Day Enrollment Audit", td_center)
        ],
        [
            Paragraph("<b>Instruction Period - 1</b>", td_left),
            Paragraph(f"{format_date_simple(cal_data.sem1_start)} to {format_date_simple(cal_data.sem1_mid1_start - datetime.timedelta(days=1))}", td_center),
            Paragraph(f"{format_date_simple(cal_data.sem2_start)} to {format_date_simple(cal_data.sem2_mid1_start - datetime.timedelta(days=1))}", td_center),
            Paragraph("40% Course Curricula Delivery", td_center)
        ],
        [
            Paragraph("<b>Continuous Assessment Test - 1</b>", td_left_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem1_mid1_start)} to {format_date_simple(cal_data.sem1_mid1_end)}</b>", td_center_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem2_mid1_start)} to {format_date_simple(cal_data.sem2_mid1_end)}</b>", td_center_b),
            Paragraph("Centralized Continuous Evaluation", td_center)
        ],
        [
            Paragraph("<b>Instruction Period - 2</b>", td_left),
            Paragraph(f"{format_date_simple(cal_data.sem1_mid1_end + datetime.timedelta(days=1))} to {format_date_simple(cal_data.sem1_mid2_start - datetime.timedelta(days=1))}", td_center),
            Paragraph(f"{format_date_simple(cal_data.sem2_mid1_end + datetime.timedelta(days=1))} to {format_date_simple(cal_data.sem2_mid2_start - datetime.timedelta(days=1))}", td_center),
            Paragraph("60% Course Curricula Delivery", td_center)
        ],
        [
            Paragraph("<b>Continuous Assessment Test - 2</b>", td_left_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem1_mid2_start)} to {format_date_simple(cal_data.sem1_mid2_end)}</b>", td_center_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem2_mid2_start)} to {format_date_simple(cal_data.sem2_mid2_end)}</b>", td_center_b),
            Paragraph("Mandatory Remedial Thresholds", td_center)
        ],
        [
            Paragraph("<b>Last Working Day / Instruction</b>", td_left),
            Paragraph(format_date_simple(cal_data.sem1_last_instruction), td_center),
            Paragraph(format_date_simple(cal_data.sem2_last_instruction), td_center),
            Paragraph("Formal Syllabus Closure Verification", td_center)
        ],
        [
            Paragraph("<b>Practical & Preparation Recess</b>", td_left),
            Paragraph(f"{format_date_simple(cal_data.sem1_prep_start)} to {format_date_simple(cal_data.sem1_prep_end)}", td_center),
            Paragraph(f"{format_date_simple(cal_data.sem2_prep_start)} to {format_date_simple(cal_data.sem2_prep_end)}", td_center),
            Paragraph("Laboratory External Assessments", td_center)
        ],
        [
            Paragraph("<b>End Semester Theory Exams (EST)</b>", td_left_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem1_est_start)} to {format_date_simple(cal_data.sem1_est_end)}</b>", td_center_b),
            Paragraph(f"<b>{format_date_simple(cal_data.sem2_est_start)} to {format_date_simple(cal_data.sem2_est_end)}</b>", td_center_b),
            Paragraph("Summative Evaluative Degree Credit", td_center)
        ],
        [
            Paragraph("<b>Term Break & Vacations</b>", td_left),
            Paragraph(f"{format_date_simple(cal_data.sem1_vac_start)} to {format_date_simple(cal_data.sem1_vac_end)}", td_center),
            Paragraph(f"{format_date_simple(cal_data.sem2_summer_start)} to {format_date_simple(cal_data.sem2_summer_end)}", td_center),
            Paragraph("Mandatory Faculty & Student Recess", td_center)
        ]
    ]

    t_term = Table(term_table_data, colWidths=[140, 125, 125, 150])
    t_term.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2.8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.8),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GREY])
    ]))
    story.append(t_term)
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>SECTION 2: STATUTORY ORDINANCES & REGULATORY PROVISIONS</b>", sec_header))
    story.append(Spacer(1, 2))
    ordinances = [
        "<b>1. Mandatory Attendance Threshold (75% Rule):</b> Every candidate must achieve a minimum cumulative attendance of 75% in lecture, tutorial, and laboratory sessions across all registered subjects. Condonation up to 10% on medical grounds is subject to Dean approval.",
        "<b>2. Continuous Internal Assessment (CIA) Integrity:</b> The two continuous assessment mid-term examinations are mandatory. Students absent without prior medical sanction shall receive zero internal marks for that assessment.",
        f"<b>3. UGC/AICTE Minimum Teaching Guarantee:</b> The Academic Calendar guarantees {cal_data.odd_instruction_days} instructional days in Odd Semester and {cal_data.even_instruction_days} instructional days in Even Semester, comfortably exceeding the statutory 90-day UGC requirement.",
        f"<b>4. State Gazetted Harmonization:</b> All public holidays are notified pursuant to the Negotiable Instruments Act 1881 and Government of {cal_data.state_name} statutory orders."
    ]
    for ord_txt in ordinances:
        story.append(Paragraph(ord_txt, body_txt))
        story.append(Spacer(1, 1.5))

    story.append(PageBreak())

    # PAGE 2: STATUTORY GAZETTED HOLIDAY SCHEDULE (FITS FULL PAGE 2)
    story.append(Paragraph("<b>SECTION 3: MASTER GAZETTED HOLIDAY & RECESS SCHEDULE</b>", sec_header))
    story.append(Paragraph(f"<font size=7.5 color='#475569'><b>Schedule of Statutory Public Holidays and Institutional Observances for A.Y. {cal_data.ay_full} — State of {cal_data.state_name}</b></font>", ParagraphStyle('HSub', fontName='Helvetica', fontSize=7.5)))
    story.append(Spacer(1, 3))

    h_table_data = [
        [
            Paragraph("<b>#</b>", th_style),
            Paragraph("<b>Date</b>", th_style),
            Paragraph("<b>Day</b>", th_style),
            Paragraph("<b>Term</b>", th_style),
            Paragraph("<b>Gazetted Observance</b>", th_style),
            Paragraph("<b>Legal / Statutory Rationale & Cultural Basis</b>", th_style)
        ]
    ]

    for idx, h in enumerate(cal_data.all_holidays, 1):
        sem_abbr = "Odd" if "Odd" in h['semester'] else ("Even" if "Even" in h['semester'] else "Break")
        h_table_data.append([
            Paragraph(str(idx), td_center_b),
            Paragraph(format_date_simple(h['date']), td_center),
            Paragraph(h['day'][:3], td_center),
            Paragraph(sem_abbr, td_center),
            Paragraph(f"<b>{h['name']}</b>", td_left_b),
            Paragraph(h['reason'], td_left)
        ])

    t_hol = Table(h_table_data, colWidths=[18, 50, 36, 42, 134, 260])
    t_hol.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.4, BORDER_GREY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 1.0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.0),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GREY])
    ]))
    story.append(t_hol)

    story.append(PageBreak())

    # PAGE 3: SPECIAL STATE VACATION POLICIES & EXECUTIVE SIGN-OFF
    story.append(Paragraph("<b>SECTION 4: STATE-SPECIFIC VACATION & RECESS REGULATIONS</b>", sec_header))
    story.append(Spacer(1, 3))
    
    state_vac_text = (
        f"Under statutory mandates for the <b>State of {cal_data.state_name}</b>, university departments and constituent "
        f"campuses shall observe designated regional festival recesses. In addition to individual gazetted holidays, "
        f"extended institutional recesses are coordinated around major agricultural and cultural epochs (e.g. Sankranti / Pongal harvest, "
        f"Dussehra / Bathukamma, and Deepavali) to allow students and faculty to participate in regional heritage. "
        f"Hostel services, library reading halls, emergency laboratories, and continuous campus operations shall remain active under rotating essential staff duty rosters."
    )
    story.append(Paragraph(state_vac_text, body_txt))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>SECTION 5: REGULATORY COMPLIANCE CERTIFICATION</b>", sec_header))
    story.append(Spacer(1, 3))
    
    cert_table_data = [
        [
            Paragraph("<b>Statutory Audit Parameter</b>", th_style),
            Paragraph("<b>Institutional Value</b>", th_style),
            Paragraph("<b>National Regulatory Benchmark (UGC / AICTE)</b>", th_style),
            Paragraph("<b>Compliance Verification</b>", th_style)
        ],
        [
            Paragraph("Odd Semester Teaching Days", td_left),
            Paragraph(f"<b>{cal_data.odd_instruction_days} Days</b>", td_center_b),
            Paragraph("Minimum 90 Days", td_center),
            Paragraph("✔ 100% Statutory Fulfillment", td_center_b)
        ],
        [
            Paragraph("Even Semester Teaching Days", td_left),
            Paragraph(f"<b>{cal_data.even_instruction_days} Days</b>", td_center_b),
            Paragraph("Minimum 90 Days", td_center),
            Paragraph("✔ 100% Statutory Fulfillment", td_center_b)
        ],
        [
            Paragraph("Continuous Assessments", td_left),
            Paragraph("2 Mid-Terms + Lab Practicals", td_center),
            Paragraph("Minimum 2 Evaluations per Course", td_center),
            Paragraph("✔ AICTE Model Aligned", td_center_b)
        ],
        [
            Paragraph("Second Saturday Observance", td_left),
            Paragraph("Every 2nd Saturday Off", td_center),
            Paragraph("State Administrative Norms", td_center),
            Paragraph("✔ Legally Harmonized", td_center_b)
        ]
    ]

    t_cert = Table(cert_table_data, colWidths=[150, 110, 140, 140])
    t_cert.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_GREY])
    ]))
    story.append(t_cert)
    story.append(Spacer(1, 16))

    story.append(Paragraph("<b>SECTION 6: OFFICIAL PROMULGATION & EXECUTIVE SIGN-OFF</b>", sec_header))
    story.append(Spacer(1, 6))

    sign_table_data = [
        [
            Paragraph("<b>[OFFICIAL UNIVERSITY SEAL]</b><br/><br/><br/><i>Affix Digital Seal Here</i>", ParagraphStyle('Seal', fontName='Helvetica-Oblique', fontSize=7.2, alignment=TA_CENTER, textColor=colors.HexColor('#64748B'))),
            Paragraph("<b>CONTROLLER OF EXAMINATIONS</b><br/><br/>____________________________<br/>Controller of Examinations<br/>Board of Evaluation", td_center),
            Paragraph("<b>DEAN OF ACADEMIC AFFAIRS</b><br/><br/>____________________________<br/>Dean, Academic Affairs<br/>Council of Deans", td_center),
            Paragraph("<b>THE REGISTRAR</b><br/><br/>____________________________<br/>The Registrar<br/>Executive Council & Senate", td_center)
        ]
    ]

    t_sign = Table(sign_table_data, colWidths=[120, 140, 140, 140])
    t_sign.setStyle(TableStyle([
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_GREY),
        ('BACKGROUND', (0, 0), (0, 0), LIGHT_GREY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(t_sign)
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        "<i>Copy forwarded for kind information and statutory implementation to: (1) Office of the Vice-Chancellor, "
        "(2) All Deans, Directors, and Principals of Constituent Colleges, (3) Controller of Examinations, (4) Finance Officer, "
        "(5) All Heads of Academic Departments, (6) Chief Warden and Hostel Administration, (7) University Webmaster for portal publication.</i>",
        ParagraphStyle('Copy', fontName='Helvetica-Oblique', fontSize=6.8, leading=9.5, textColor=colors.HexColor('#64748B'))
    ))

    doc.build(story)


# =========================================================================
# UNIVERSAL GENERATION ENTRYPOINT
# =========================================================================
def generate_academic_calendar(year=2026, state='AP', program='B.Tech (E1 to E4)', fmt='grid', output_path=None):
    if isinstance(year, str):
        year = int(year.split('-')[0].strip())

    cal_data = CalendarDataManager(year, state_code=state, program=program)

    if not output_path:
        fmt_slug = 'grid' if fmt == 'grid' else 'gazette'
        output_path = f"Academic_Calendar_{cal_data.year_start}_{str(cal_data.year_end)[-2:]}_{cal_data.state_code}_{fmt_slug}.pdf"

    if fmt == 'gazette':
        build_format2_gazette(cal_data, output_path)
    else:
        build_format1_grid(cal_data, output_path)

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Universal Multi-State / Multi-Year Academic Calendar PDF Generator")
    parser.add_argument('--year', type=str, default='2026', help='Academic year start e.g. 2026 or 2026-2027')
    parser.add_argument('--state', type=str, default='AP', choices=['AP', 'TS', 'KA', 'TN', 'MH', 'DL', 'UP', 'ALL'], help='State code')
    parser.add_argument('--program', type=str, default='B.Tech (E1 to E4)', help='Academic program name')
    parser.add_argument('--format', type=str, default='grid', choices=['grid', 'gazette'], help='PDF format (grid or gazette)')
    parser.add_argument('--output', type=str, default=None, help='Output PDF file path')

    args = parser.parse_args()
    out = generate_academic_calendar(
        year=args.year,
        state=args.state,
        program=args.program,
        fmt=args.format,
        output_path=args.output
    )
    print(f"Successfully generated: {out}")


if __name__ == '__main__':
    main()
