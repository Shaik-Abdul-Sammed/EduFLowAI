import { useState } from 'react'
import {
  Utensils, Clock, Flame, Apple, ThumbsUp, Star, CheckCircle2,
  Calendar, ShieldCheck, ChevronRight, MessageSquare, AlertCircle
} from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const currentDayName = DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

const WEEKLY_MENUS = {
  Monday: {
    Breakfast: { items: 'Idli, Medu Vada, Sambar, Coconut Chutney & Filter Coffee', window: '07:30 AM - 09:15 AM', cals: '420 kcal', protein: '14g' },
    Lunch: { items: 'Steamed Sona Masoori Rice, Dal Tadka, Paneer Butter Masala, Curd, Mixed Pickle & Papad', window: '12:30 PM - 02:15 PM', cals: '680 kcal', protein: '22g' },
    Snacks: { items: 'Hot Vegetable Samosa with Mint Chutney & Cardamom Milk Tea', window: '05:00 PM - 06:15 PM', cals: '280 kcal', protein: '6g' },
    Dinner: { items: 'Phulka Rotis (3), Methi Chaman, Jeera Rice, Tomato Rasam & Hot Gulab Jamun', window: '07:30 PM - 09:15 PM', cals: '610 kcal', protein: '18g' }
  },
  Tuesday: {
    Breakfast: { items: 'Masala Dosa, Peanut Chutney, Allam Pachadi & Masala Chai', window: '07:30 AM - 09:15 AM', cals: '450 kcal', protein: '12g' },
    Lunch: { items: 'Veg Biryani, Mirchi Ka Salan, Boondi Raita, Dal Fry & Sweet Pongal', window: '12:30 PM - 02:15 PM', cals: '720 kcal', protein: '20g' },
    Snacks: { items: 'Mysore Bonda with Ginger Chutney & Filter Coffee', window: '05:00 PM - 06:15 PM', cals: '310 kcal', protein: '7g' },
    Dinner: { items: 'Chapati, Aloo Gobi Masala, Steamed Rice, Sambar & Fresh Cut Fruits', window: '07:30 PM - 09:15 PM', cals: '580 kcal', protein: '16g' }
  },
  Wednesday: {
    Breakfast: { items: 'Poori with Aloo Saagu, Poha with Roasted Peanuts & Tea/Coffee', window: '07:30 AM - 09:15 AM', cals: '480 kcal', protein: '13g' },
    Lunch: { items: 'Lemon Rice, Steamed Rice, Palak Paneer, Tomato Dal & Fresh Buttermilk', window: '12:30 PM - 02:15 PM', cals: '660 kcal', protein: '24g' },
    Snacks: { items: 'Sweet Corn Chaat / Boiled Chana & Lemon Tea', window: '05:00 PM - 06:15 PM', cals: '210 kcal', protein: '9g' },
    Dinner: { items: 'Special Hyderabadi Chicken Curry / Kadai Paneer, Parotta, Rice & Ice Cream', window: '07:30 PM - 09:30 PM', cals: '750 kcal', protein: '34g' }
  },
  Thursday: {
    Breakfast: { items: 'Uttapam with Tomato Chutney, Upma, Sambar & Badam Milk', window: '07:30 AM - 09:15 AM', cals: '430 kcal', protein: '14g' },
    Lunch: { items: 'Rajma Chawal, Jeera Rice, Mixed Veg Poriyal, Curd & Fryums', window: '12:30 PM - 02:15 PM', cals: '640 kcal', protein: '21g' },
    Snacks: { items: 'Onion Pakoda with Green Chutney & Masala Chai', window: '05:00 PM - 06:15 PM', cals: '290 kcal', protein: '6g' },
    Dinner: { items: 'Roti, Dal Makhani, Veg Pulao, Pepper Rasam & Moong Dal Halwa', window: '07:30 PM - 09:15 PM', cals: '630 kcal', protein: '19g' }
  },
  Friday: {
    Breakfast: { items: 'Rava Kichadi with Coconut Chutney, Vada, Sambar & Coffee', window: '07:30 AM - 09:15 AM', cals: '460 kcal', protein: '15g' },
    Lunch: { items: 'Bagara Rice, Paneer Kofta Curry, Drumstick Sambar, Curd & Papad', window: '12:30 PM - 02:15 PM', cals: '710 kcal', protein: '23g' },
    Snacks: { items: 'Pani Puri / Bhel Puri & Filter Coffee', window: '05:00 PM - 06:15 PM', cals: '240 kcal', protein: '5g' },
    Dinner: { items: 'Phulka, Chana Masala, Steamed Rice, Miriyalu Charu & Fruit Custard', window: '07:30 PM - 09:15 PM', cals: '600 kcal', protein: '20g' }
  },
  Saturday: {
    Breakfast: { items: 'Pesarattu with Ginger Chutney & Upma (MLA Style), Tea/Coffee', window: '08:00 AM - 09:45 AM', cals: '440 kcal', protein: '18g' },
    Lunch: { items: 'Curd Rice with Pomegranate, Bisibelebath with Kara Boondi, Potato Roast', window: '12:45 PM - 02:30 PM', cals: '650 kcal', protein: '17g' },
    Snacks: { items: 'Veg Cutlet with Tomato Ketchup & Ginger Chai', window: '05:00 PM - 06:15 PM', cals: '260 kcal', protein: '7g' },
    Dinner: { items: 'Naan, Paneer Butter Masala, Fried Rice, Manchurian Gravy & Kheer', window: '07:30 PM - 09:30 PM', cals: '720 kcal', protein: '22g' }
  },
  Sunday: {
    Breakfast: { items: 'Chole Bhature with Pickled Onions, Sweet Lassi / Coffee', window: '08:00 AM - 10:00 AM', cals: '580 kcal', protein: '16g' },
    Lunch: { items: 'Sunday Special Dum Biryani (Chicken / Paneer), Mirchi Salan, Raita & Double Ka Meetha', window: '12:30 PM - 02:45 PM', cals: '850 kcal', protein: '38g' },
    Snacks: { items: 'French Fries / Finger Chips & Lemonade', window: '05:00 PM - 06:15 PM', cals: '270 kcal', protein: '4g' },
    Dinner: { items: 'Light Khichdi, Kadhi, Papad, Aloo Jeera & Fresh Bananas', window: '07:30 PM - 09:15 PM', cals: '520 kcal', protein: '15g' }
  }
}

export default function MessMenuPage() {
  const [selectedDay, setSelectedDay] = useState(currentDayName)
  const [dietPreference, setDietPreference] = useState('Standard Vegetarian')
  const [feedbackMeal, setFeedbackMeal] = useState('Lunch')
  const [rating, setRating] = useState(5)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState(false)
  const [showRebateModal, setShowRebateModal] = useState(false)
  const [rebateDays, setRebateDays] = useState(3)
  const [rebateSuccess, setRebateSuccess] = useState('')

  const activeMenu = WEEKLY_MENUS[selectedDay] || WEEKLY_MENUS.Monday

  const handleSubmitFeedback = (e) => {
    e.preventDefault()
    setFeedbackSuccess(true)
    setTimeout(() => {
      setFeedbackSuccess(false)
      setFeedbackNote('')
    }, 4000)
  }

  const handleApplyRebate = (e) => {
    e.preventDefault()
    const savings = rebateDays * 140
    setRebateSuccess(`Mess rebate of ₹${savings} approved for ${rebateDays} consecutive absent days! Deducted from next fee cycle.`)
    setTimeout(() => {
      setRebateSuccess('')
      setShowRebateModal(false)
    }, 4500)
  }

  return (
    <RolePageTemplate
      role="Student"
      title="Hostel Dining & Dietary Nutrition Schedule"
      description="Weekly dining schedule, nutritional values, dietary preference filters, and daily meal quality feedback."
    >
      <div className="d-flex flex-column gap-4 w-100">

        {/* Top Header Card */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem', background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
                <Utensils className="text-primary" size={22} /> Daily Dining Schedule & Macro-Nutritional Tracker
              </h3>
              <p className="text-muted small mb-0">Hostel Dining Block C & D • Catered by Campus Food Directorate & FSSAI Certified</p>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setShowRebateModal(true)}
              >
                💰 Mess Absence Rebate
              </button>
              <div className="btn-group" role="group">
                {['Standard Vegetarian', 'Jain Option', 'High-Protein / Non-Veg'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDietPreference(d)}
                    className={`btn btn-sm ${dietPreference === d ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Days of Week Tabs */}
          <div className="d-flex gap-2 overflow-auto pb-2 mb-4">
            {DAYS.map(day => (
              <button
                key={day}
                className={`btn btn-sm px-3 ${selectedDay === day ? 'btn-dark' : 'btn-light border'}`}
                style={{ borderRadius: '2rem', whiteSpace: 'nowrap', fontWeight: 600 }}
                onClick={() => setSelectedDay(day)}
              >
                {day} {day === currentDayName && '• Today'}
              </button>
            ))}
          </div>

          {/* Meals Grid */}
          <div className="row g-3">
            {Object.entries(activeMenu).map(([meal, data]) => (
              <div key={meal} className="col-12 col-md-6">
                <div className="p-3 rounded-3 bg-light border h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold fs-6">{meal}</span>
                      <span className="small text-muted d-flex align-items-center gap-1 font-monospace">
                        <Clock size={13} /> {data.window}
                      </span>
                    </div>
                    <p className="text-dark mb-3 fw-medium" style={{ fontSize: '0.92rem', lineHeight: 1.45 }}>
                      {dietPreference === 'Jain Option'
                        ? data.items.replace(/Onion|Aloo|Potato|Garlic/gi, 'Kala Chana / Raw Banana')
                        : data.items}
                    </p>
                  </div>

                  <div className="pt-2 border-top d-flex justify-content-between align-items-center small text-muted">
                    <span className="d-flex align-items-center gap-1 text-danger fw-semibold">
                      <Flame size={14} /> {data.cals}
                    </span>
                    <span className="d-flex align-items-center gap-1 text-success fw-semibold">
                      <Apple size={14} /> Protein: {data.protein}
                    </span>
                    <button
                      className="btn btn-link text-primary p-0 text-decoration-none small"
                      onClick={() => setFeedbackMeal(meal)}
                    >
                      Rate Meal
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meal Rating & Feedback Box */}
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: '1.25rem' }}>
          <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
            <ThumbsUp size={18} className="text-primary" /> Daily Meal Quality & Hygiene Feedback
          </h5>
          <p className="text-muted small mb-3">
            Your reviews directly influence vendor performance audits under NAAC and the Student Mess Committee.
          </p>

          {feedbackSuccess && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2">
              <CheckCircle2 size={18} /> Thank you! Your feedback for <strong>{feedbackMeal}</strong> has been recorded and submitted to the Chief Catering Warden.
            </div>
          )}

          <form onSubmit={handleSubmitFeedback}>
            <div className="row g-3 align-items-center">
              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold">Select Meal</label>
                <select
                  className="form-select form-select-sm"
                  value={feedbackMeal}
                  onChange={(e) => setFeedbackMeal(e.target.value)}
                >
                  <option>Breakfast</option>
                  <option>Lunch</option>
                  <option>Snacks</option>
                  <option>Dinner</option>
                </select>
              </div>

              <div className="col-12 col-md-3">
                <label className="form-label small fw-bold">Taste & Hygiene Rating</label>
                <div className="d-flex gap-1 align-items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn btn-link p-0 text-decoration-none"
                      onClick={() => setRating(star)}
                    >
                      <Star
                        size={22}
                        className={star <= rating ? 'text-warning fill-warning' : 'text-secondary'}
                        fill={star <= rating ? '#f59e0b' : 'none'}
                      />
                    </button>
                  ))}
                  <span className="small fw-bold ms-2 text-dark">{rating}/5</span>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label small fw-bold">Remarks / Suggestions</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="e.g. Sambar was warm and fresh; improve curd consistency"
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                />
              </div>

              <div className="col-12 col-md-2 mt-md-4 pt-md-2">
                <button type="submit" className="btn btn-primary btn-sm w-100">
                  Submit Review
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Rebate Modal */}
        {showRebateModal && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title d-flex align-items-center gap-2">
                    💰 Mess Absence Rebate Calculator
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowRebateModal(false)} />
                </div>
                <div className="modal-body p-4">
                  {rebateSuccess ? (
                    <div className="alert alert-success py-2 text-center small mb-0">
                      ✅ {rebateSuccess}
                    </div>
                  ) : (
                    <form onSubmit={handleApplyRebate}>
                      <p className="small text-muted mb-3">
                        Students traveling home or on academic leave for 3 or more consecutive days receive an automatic mess rebate of <strong>₹140/day</strong>.
                      </p>

                      <div className="mb-3">
                        <label className="form-label small fw-bold">Number of Consecutive Leave Days</label>
                        <input
                          type="number"
                          min={3}
                          max={15}
                          className="form-control form-control-sm"
                          value={rebateDays}
                          onChange={(e) => setRebateDays(Number(e.target.value))}
                        />
                      </div>

                      <div className="p-3 bg-light rounded-3 text-center mb-3">
                        <span className="text-muted small">ESTIMATED REBATE DISCOUNT</span>
                        <h4 className="fw-bold text-success my-1">₹{rebateDays * 140}</h4>
                        <span className="small text-muted">Credited to Next Semester Tuition Ledger</span>
                      </div>

                      <div className="d-flex justify-content-end gap-2">
                        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRebateModal(false)}>
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-success btn-sm">
                          Apply for Rebate
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </RolePageTemplate>
  )
}
