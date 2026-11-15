import { useState } from 'react'
import { Utensils, Clock } from 'lucide-react'
import RolePageTemplate from '../../components/RolePageTemplate'

export default function MessMenuPage() {
  const menu = {
    Breakfast: 'Idli, Medu Vada, Sambar, Coconut Chutney & Tea/Coffee (8:00 AM - 9:30 AM)',
    Lunch: 'Steamed Basmati Rice, Paneer Butter Masala, Dal Tadka, Curd & Papad (12:30 PM - 2:00 PM)',
    Snacks: 'Vegetable Samosa / Masala Puffed Rice & Ginger Cardamom Chai (5:00 PM - 6:00 PM)',
    Dinner: 'Phulka Rotis, Mixed Vegetable Curry, Jeera Rice, Rasam & Gulab Jamun (7:30 PM - 9:00 PM)'
  }

  const [dietPreference, setDietPreference] = useState('Standard Vegetarian')

  return (
    <RolePageTemplate
      role="Student"
      title="Hostel Mess Menu & Dietary Nutrition"
      description="Weekly dining schedule, nutritional values, dietary preference filters, and daily meal quality feedback."
    >
      <div className="d-flex flex-column gap-4 w-100">
        <div className="card border-0 shadow-sm p-4" style={{ background: 'var(--card-bg, #ffffff)' }}>
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="h5 fw-bold mb-1 d-flex align-items-center gap-2">
                <Utensils className="text-primary" size={22} /> Daily Dining Schedule
              </h3>
              <p className="text-muted small mb-0">Hostel Dining Block C & D • Catered by Campus Food Directorate</p>
            </div>
            <div className="btn-group" role="group">
              {['Standard Vegetarian', 'Jain Option', 'Special Non-Veg'].map(d => (
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

          <div className="row g-3">
            {Object.entries(menu).map(([meal, items]) => (
              <div key={meal} className="col-12 col-md-6">
                <div className="p-3 rounded-3 bg-light border h-100">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-primary bg-opacity-10 text-primary fw-bold">{meal}</span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                      <Clock size={12} /> Daily Window
                    </span>
                  </div>
                  <p className="text-dark mb-0 fw-medium">{items}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </RolePageTemplate>
  )
}
