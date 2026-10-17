import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  ShieldCheck,
  Building,
  User,
  Mail,
  Lock,
  Globe,
  Database,
  FileCheck,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Phone,
  Briefcase,
  Users
} from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getFullApiUrl } from '../../config/apiConfig';

const INSTITUTION_TYPES = [
  'Autonomous Engineering College',
  'University Campus',
  'Affiliated Institute',
  'Polytechnic / Diploma',
  'Medical / Allied Sciences',
  'Arts & Science College',
  'Multi-disciplinary Institution',
];

const STUDENT_STRENGTH_OPTIONS = [
  '< 1,000 Students',
  '1,000 - 3,000 Students',
  '3,000 - 10,000 Students',
  '10,000+ Students',
];

export default function InstitutionRegister() {
  const [currentStep, setCurrentStep] = useState(1); // 1: Campus Info, 2: Admin Account, 3: Review & Launch
  const [formData, setFormData] = useState({
    institutionName: '',
    subdomain: '',
    institutionType: 'Autonomous Engineering College',
    studentStrength: '1,000 - 3,000 Students',
    cityState: '',
    gstin: '',
    adminName: '',
    designation: 'Principal / Director',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsConsent: true,
    enablePilot: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomainLocked, setSubdomainLocked] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState(null); // null | 'checking' | 'available' | 'taken'
  const [subdomainSuggestions, setSubdomainSuggestions] = useState([]);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { register } = useAuth();

  const generateSuggestions = (baseSlug) => {
    const clean = (baseSlug || 'campus').replace(/-2$/, '').replace(/-hyd$/, '').replace(/-\d{4}$/, '');
    const currentYear = new Date().getFullYear();
    return [`${clean}-2`, `${clean}-hyd`, `${clean}-${currentYear}`];
  };

  const checkAvailability = async (slugToCheck) => {
    const target = (slugToCheck || formData.subdomain || '').trim().toLowerCase();
    if (!target) {
      setErrors((prev) => ({ ...prev, subdomain: 'Please enter a subdomain to check' }));
      return;
    }
    setSubdomainStatus('checking');
    try {
      const res = await fetch(getFullApiUrl(`/v1/institutions/check-subdomain?slug=${encodeURIComponent(target)}`));
      const data = await res.json();
      if (data.available) {
        setSubdomainStatus('available');
        setSubdomainSuggestions([]);
        setErrors((prev) => ({ ...prev, subdomain: null }));
      } else {
        setSubdomainStatus('taken');
        setSubdomainSuggestions(generateSuggestions(target));
        setErrors((prev) => ({
          ...prev,
          subdomain: 'This subdomain is already taken. Try adding a number or city, e.g., ssit-hyderabad-2.',
        }));
      }
    } catch {
      setSubdomainStatus(null);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Auto-generate subdomain from institution name while not manually edited
    if (name === 'institutionName' && !subdomainLocked) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData((prev) => ({ ...prev, institutionName: value, subdomain: generated }));
    }

    if (name === 'subdomain') {
      setSubdomainLocked(true);
    }
  };

  const validateStep1 = () => {
    const stepErrors = {};
    if (!formData.institutionName || !formData.institutionName.trim()) {
      stepErrors.institutionName = 'Institution name is required';
    } else if (formData.institutionName.trim().length < 3) {
      stepErrors.institutionName = 'Minimum 3 characters required';
    }

    if (!formData.subdomain || !formData.subdomain.trim()) {
      stepErrors.subdomain = 'Campus short code / subdomain is required';
    } else if (formData.subdomain.trim().length < 3) {
      stepErrors.subdomain = 'Minimum 3 characters required';
    } else if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      stepErrors.subdomain = 'Only lowercase letters, numbers, and hyphens allowed';
    }

    if (!formData.cityState || !formData.cityState.trim()) {
      stepErrors.cityState = 'City & State is required';
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      addToast('Please complete all required campus details.', 'error');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    const stepErrors = {};
    if (!formData.adminName || !formData.adminName.trim()) {
      stepErrors.adminName = 'Administrator full name is required';
    } else if (formData.adminName.trim().length < 3) {
      stepErrors.adminName = 'Minimum 3 characters required';
    }

    if (!formData.email || !formData.email.trim()) {
      stepErrors.email = 'Official email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      stepErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      stepErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      stepErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      stepErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      addToast('Please complete all administrator credentials.', 'error');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.termsConsent) {
      setErrors((prev) => ({ ...prev, termsConsent: 'You must accept terms to continue' }));
      addToast('Please accept the Terms of Service and Privacy Policy.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        institutionName: formData.institutionName,
        name: formData.institutionName,
        subdomain: formData.subdomain,
        adminName: formData.adminName,
        email: formData.email,
        adminEmail: formData.email,
        password: formData.password,
        institutionType: formData.institutionType,
        studentStrength: formData.studentStrength,
        cityState: formData.cityState,
        gstin: formData.gstin,
        phone: formData.phone,
        designation: formData.designation,
      });

      addToast(`🎉 Workspace created! ${formData.subdomain}.eduflow.app is live.`, 'success');
      navigate('/admin-dashboard');
    } catch (err) {
      const isSubdomainConflict =
        err?.status === 409 ||
        err?.message?.toLowerCase().includes('subdomain is already taken') ||
        err?.message?.toLowerCase().includes('already taken');

      if (isSubdomainConflict) {
        setCurrentStep(1);
        setSubdomainStatus('taken');
        setSubdomainSuggestions(generateSuggestions(formData.subdomain));
        setErrors((prev) => ({
          ...prev,
          subdomain: 'This subdomain is already taken. Try adding a number or city, e.g., ssit-hyderabad-2.',
        }));
        addToast('This subdomain is already taken. Please choose another.', 'error');
      } else {
        addToast(err.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordStrength = () => {
    const p = formData.password;
    if (!p) return null;
    if (p.length < 8) return { level: 'weak', color: 'danger', width: '33%' };
    if (p.length < 12 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { level: 'fair', color: 'warning', width: '66%' };
    return { level: 'strong', color: 'success', width: '100%' };
  };
  const strength = passwordStrength();

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--app-bg, #f8fafc)' }}>
      {/* Top Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 fixed-top shadow-sm" style={{ background: 'var(--card-bg, #fff)' }}>
        <div className="container-xl">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <Building size={20} />
            </div>
            <span className="fw-bold fs-4" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EduFlow AI
            </span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted d-none d-md-block small">Already registered?</span>
            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4 btn-sm">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <div className="container-xl flex-grow-1 d-flex align-items-center justify-content-center" style={{ marginTop: '75px', padding: '2rem 1rem 3rem' }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-xl-11">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--card-bg, #fff)', color: 'var(--app-text, #1e293b)' }}>
              <div className="row g-0">

                {/* Left Side: Premium SaaS Branding Panel */}
                <div
                  className="col-12 col-lg-5 p-4 p-md-5 text-white d-flex flex-column justify-content-between"
                  style={{
                    background: 'linear-gradient(160deg, #091326 0%, #1e3a8a 55%, #312e81 100%)',
                    minHeight: '620px',
                  }}
                >
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <span className="badge rounded-pill px-3 py-2 fw-semibold text-white" style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(8px)' }}>
                        <Sparkles size={14} className="me-1 text-warning" /> Autonomous AI Campus OS
                      </span>
                    </div>

                    <h2 className="fw-bold fs-3 mb-2 text-white">
                      EduFlow AI OS
                    </h2>
                    <p className="text-white-50 small mb-4" style={{ lineHeight: '1.6' }}>
                      Autonomous AI Operating System for Higher Education. Deploy 5 autonomous AI Officers across accreditation, scheduling, finance, admissions, and student retention.
                    </p>

                    {/* Value propositions */}
                    <div className="d-flex flex-column gap-3 mb-4">
                      <div className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="p-2 rounded bg-primary text-white mt-1">
                          <FileCheck size={18} />
                        </div>
                        <div>
                          <div className="fw-bold small text-white">72-Hour NAAC SSR Drafts</div>
                          <div className="text-white-50 small">Autonomous AI generation of Criterion 1–7 SSR reports with real-time audit gap scoring.</div>
                        </div>
                      </div>

                      <div className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="p-2 rounded bg-info text-white mt-1">
                          <Database size={18} />
                        </div>
                        <div>
                          <div className="fw-bold small text-white">Zero-Migration Data Connectors</div>
                          <div className="text-white-50 small">Reads and normalizes live attendance and grades directly from existing ERP/DB replicas without data migration.</div>
                        </div>
                      </div>

                      <div className="d-flex gap-3 align-items-start p-3 rounded-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="p-2 rounded bg-success text-white mt-1">
                          <ShieldCheck size={18} />
                        </div>
                        <div>
                          <div className="fw-bold small text-white">Full Data Sovereignty</div>
                          <div className="text-white-50 small">Encrypted via AES-256 with institutional tenant isolation, fully DPDP Act 2023 compliant.</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trust Testimonial */}
                  <div className="pt-3 border-top border-white border-opacity-20">
                    <p className="fst-italic text-white-50 small mb-2">
                      &quot;EduFlow reduced our NAAC SSR preparation cycle from 4 months to 3 days across all 7 criteria.&quot;
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-white text-dark fw-bold d-flex align-items-center justify-content-center small" style={{ width: 28, height: 28 }}>
                        RK
                      </div>
                      <div className="small">
                        <strong className="text-white">Dr. K. Ramanathan</strong>
                        <span className="text-white-50"> — Dean of IQAC, SSIT</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: 3-Step Registration Wizard */}
                <div className="col-12 col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-between" style={{ background: 'var(--card-bg, #fff)' }}>
                  <div>
                    {/* Step Progress Indicator */}
                    <div className="mb-4">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className={`small fw-bold d-flex align-items-center gap-1 ${currentStep === 1 ? 'text-primary' : currentStep > 1 ? 'text-success' : 'text-muted'}`}>
                          <span className={`badge rounded-circle p-1 ${currentStep === 1 ? 'bg-primary text-white' : currentStep > 1 ? 'bg-success text-white' : 'bg-light text-muted'}`}>1</span>
                          <span>Campus Info</span>
                        </div>
                        <ChevronRight size={14} className="text-muted" />
                        <div className={`small fw-bold d-flex align-items-center gap-1 ${currentStep === 2 ? 'text-primary' : currentStep > 2 ? 'text-success' : 'text-muted'}`}>
                          <span className={`badge rounded-circle p-1 ${currentStep === 2 ? 'bg-primary text-white' : currentStep > 2 ? 'bg-success text-white' : 'bg-light text-muted'}`}>2</span>
                          <span>Admin Account</span>
                        </div>
                        <ChevronRight size={14} className="text-muted" />
                        <div className={`small fw-bold d-flex align-items-center gap-1 ${currentStep === 3 ? 'text-primary' : 'text-muted'}`}>
                          <span className={`badge rounded-circle p-1 ${currentStep === 3 ? 'bg-primary text-white' : 'bg-light text-muted'}`}>3</span>
                          <span>Review &amp; Launch</span>
                        </div>
                      </div>
                      <div className="progress" style={{ height: 4 }}>
                        <div
                          className="progress-bar bg-primary"
                          style={{
                            width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} noValidate>
                      {/* STEP 1: CAMPUS INFORMATION */}
                      {currentStep === 1 && (
                        <div>
                          <div className="mb-3">
                            <h4 className="fw-bold text-dark mb-1">Step 1: Campus Information</h4>
                            <p className="text-muted small">Enter legal institution credentials and select your dedicated workspace subdomain.</p>
                          </div>

                          {/* Institution Name */}
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-dark small mb-1">Institution Name *</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0 text-muted"><Building size={16} /></span>
                              <input
                                type="text"
                                className={`form-control border-start-0 ${errors.institutionName ? 'is-invalid' : ''}`}
                                name="institutionName"
                                placeholder="e.g. Sri Sudha Institute of Technology"
                                value={formData.institutionName}
                                onChange={handleChange}
                                autoFocus
                              />
                            </div>
                            {errors.institutionName && <div className="text-danger small mt-1">⚠ {errors.institutionName}</div>}
                          </div>

                          {/* Subdomain URL */}
                          <div className="mb-3">
                            <label className="form-label fw-semibold text-dark small mb-1">Campus Short Code / Subdomain *</label>
                            <div className="input-group">
                              <span className="input-group-text bg-light border-end-0 text-muted"><Globe size={16} /></span>
                              <input
                                type="text"
                                className={`form-control border-start-0 border-end-0 font-monospace ${errors.subdomain ? 'is-invalid' : ''}`}
                                name="subdomain"
                                placeholder="ssit"
                                value={formData.subdomain}
                                onChange={(e) => {
                                  handleChange(e);
                                  setSubdomainStatus(null);
                                  setSubdomainSuggestions([]);
                                }}
                              />
                              <span className="input-group-text bg-light text-muted small">.eduflow.app</span>
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm px-3 d-flex align-items-center gap-1"
                                disabled={!formData.subdomain || subdomainStatus === 'checking'}
                                onClick={() => checkAvailability(formData.subdomain)}
                              >
                                {subdomainStatus === 'checking' ? (
                                  <span className="spinner-border spinner-border-sm" role="status" />
                                ) : subdomainStatus === 'available' ? (
                                  <span className="text-success fw-bold">✓ Available</span>
                                ) : subdomainStatus === 'taken' ? (
                                  <span className="text-danger fw-bold">✗ Taken</span>
                                ) : (
                                  'Check'
                                )}
                              </button>
                            </div>

                            {errors.subdomain ? (
                              <div className="mt-1">
                                <div className="text-danger small">⚠ {errors.subdomain}</div>
                                {subdomainSuggestions.length > 0 && (
                                  <div className="mt-2 p-2 rounded bg-light border">
                                    <span className="small text-muted me-2">Suggested alternatives:</span>
                                    <div className="d-inline-flex flex-wrap gap-2 mt-1">
                                      {subdomainSuggestions.map((sug) => (
                                        <button
                                          key={sug}
                                          type="button"
                                          className="btn btn-sm btn-outline-primary py-0 px-2 rounded-pill font-monospace"
                                          style={{ fontSize: '0.8rem' }}
                                          onClick={() => {
                                            setFormData((prev) => ({ ...prev, subdomain: sug }));
                                            setErrors((prev) => ({ ...prev, subdomain: null }));
                                            setSubdomainStatus(null);
                                            setSubdomainSuggestions([]);
                                            checkAvailability(sug);
                                          }}
                                        >
                                          {sug}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : formData.subdomain ? (
                              <div className="text-success small mt-1">✓ Workspace URL: <strong>{formData.subdomain}.eduflow.app</strong></div>
                            ) : (
                              <div className="text-muted small mt-1">Auto-generated from your institution name.</div>
                            )}
                          </div>

                          <div className="row g-3 mb-3">
                            {/* Institution Type Dropdown */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Institution Type *</label>
                              <select
                                className="form-select"
                                name="institutionType"
                                value={formData.institutionType}
                                onChange={handleChange}
                              >
                                {INSTITUTION_TYPES.map((type) => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                            </div>

                            {/* Approximate Student Strength */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Approximate Student Strength *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Users size={16} /></span>
                                <select
                                  className="form-select border-start-0"
                                  name="studentStrength"
                                  value={formData.studentStrength}
                                  onChange={handleChange}
                                >
                                  {STUDENT_STRENGTH_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            {/* City & State */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">City &amp; State *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><MapPin size={16} /></span>
                                <input
                                  type="text"
                                  className={`form-control border-start-0 ${errors.cityState ? 'is-invalid' : ''}`}
                                  name="cityState"
                                  placeholder="e.g. Bangalore, Karnataka"
                                  value={formData.cityState}
                                  onChange={handleChange}
                                />
                              </div>
                              {errors.cityState && <div className="text-danger small mt-1">⚠ {errors.cityState}</div>}
                            </div>

                            {/* GSTIN (Optional) */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">GSTIN (Optional)</label>
                              <input
                                type="text"
                                className="form-control font-monospace"
                                name="gstin"
                                placeholder="29AAAAA0000A1Z5"
                                value={formData.gstin}
                                onChange={handleChange}
                              />
                            </div>
                          </div>

                          {/* Next button */}
                          <div className="d-flex justify-content-end mt-4">
                            <button
                              type="button"
                              className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
                              onClick={handleNext}
                            >
                              Next: Admin Account <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: ADMINISTRATOR ACCOUNT */}
                      {currentStep === 2 && (
                        <div>
                          <div className="mb-3">
                            <h4 className="fw-bold text-dark mb-1">Step 2: Administrator Account</h4>
                            <p className="text-muted small">Configure credentials for the primary campus administrator or IQAC coordinator.</p>
                          </div>

                          <div className="row g-3 mb-3">
                            {/* Full Name */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Administrator Full Name *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><User size={16} /></span>
                                <input
                                  type="text"
                                  className={`form-control border-start-0 ${errors.adminName ? 'is-invalid' : ''}`}
                                  name="adminName"
                                  placeholder="Dr. Rajesh Kumar"
                                  value={formData.adminName}
                                  onChange={handleChange}
                                  autoFocus
                                />
                              </div>
                              {errors.adminName && <div className="text-danger small mt-1">⚠ {errors.adminName}</div>}
                            </div>

                            {/* Designation */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Official Designation</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Briefcase size={16} /></span>
                                <input
                                  type="text"
                                  className="form-control border-start-0"
                                  name="designation"
                                  placeholder="e.g. Principal / IQAC Director"
                                  value={formData.designation}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            {/* Email */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Official Email Address *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Mail size={16} /></span>
                                <input
                                  type="email"
                                  className={`form-control border-start-0 ${errors.email ? 'is-invalid' : ''}`}
                                  name="email"
                                  placeholder="principal@ssit.edu.in"
                                  value={formData.email}
                                  onChange={handleChange}
                                />
                              </div>
                              {errors.email && <div className="text-danger small mt-1">⚠ {errors.email}</div>}
                            </div>

                            {/* Phone */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Phone Number (10-Digit)</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Phone size={16} /></span>
                                <input
                                  type="tel"
                                  className="form-control border-start-0"
                                  name="phone"
                                  placeholder="9876543210"
                                  value={formData.phone}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="row g-3 mb-3">
                            {/* Password */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Password *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={16} /></span>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                                  name="password"
                                  placeholder="Min 8 characters"
                                  value={formData.password}
                                  onChange={handleChange}
                                />
                                <span className="input-group-text bg-light p-0 border-start-0">
                                  <IconButton
                                    size="small"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    style={{ padding: '4px 8px', color: '#64748B' }}
                                  >
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </span>
                              </div>
                              {strength && (
                                <div className="mt-1">
                                  <div className="progress" style={{ height: 4 }}>
                                    <div className={`progress-bar bg-${strength.color}`} style={{ width: strength.width }} />
                                  </div>
                                  <span className={`text-${strength.color} small`}>Strength: {strength.level}</span>
                                </div>
                              )}
                              {errors.password && <div className="text-danger small mt-1">⚠ {errors.password}</div>}
                            </div>

                            {/* Confirm Password */}
                            <div className="col-12 col-sm-6">
                              <label className="form-label fw-semibold text-dark small mb-1">Confirm Password *</label>
                              <div className="input-group">
                                <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={16} /></span>
                                <input
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  className={`form-control border-start-0 border-end-0 ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                  name="confirmPassword"
                                  placeholder="Re-enter password"
                                  value={formData.confirmPassword}
                                  onChange={handleChange}
                                />
                                <span className="input-group-text bg-light p-0 border-start-0">
                                  <IconButton
                                    size="small"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                                    style={{ padding: '4px 8px', color: '#64748B' }}
                                  >
                                    {showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                  </IconButton>
                                </span>
                              </div>
                              {errors.confirmPassword && <div className="text-danger small mt-1">⚠ {errors.confirmPassword}</div>}
                              {!errors.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.password && (
                                <div className="text-success small mt-1">✓ Passwords match</div>
                              )}
                            </div>
                          </div>

                          {/* Navigation buttons */}
                          <div className="d-flex justify-content-between mt-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary d-flex align-items-center gap-1 px-3"
                              onClick={handleBack}
                            >
                              <ArrowLeft size={16} /> Back
                            </button>
                            <button
                              type="button"
                              className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 fw-semibold shadow-sm"
                              onClick={handleNext}
                            >
                              Next: Review &amp; Launch <ArrowRight size={16} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* STEP 3: REVIEW & CONFIRM */}
                      {currentStep === 3 && (
                        <div>
                          <div className="mb-3">
                            <h4 className="fw-bold text-dark mb-1">Step 3: Review &amp; Confirm</h4>
                            <p className="text-muted small">Verify your institution workspace configuration before initial deployment.</p>
                          </div>

                          {/* Summary Card */}
                          <div className="card border bg-light p-3 rounded-3 mb-4">
                            <div className="row g-3">
                              <div className="col-12 col-sm-6">
                                <div className="text-muted small mb-1">Institution</div>
                                <div className="fw-bold text-dark">{formData.institutionName}</div>
                                <div className="small font-monospace text-primary">{formData.subdomain}.eduflow.app</div>
                                <div className="text-muted small mt-1">{formData.institutionType} • {formData.studentStrength}</div>
                                <div className="text-muted small">{formData.cityState} {formData.gstin ? `• GSTIN: ${formData.gstin}` : ''}</div>
                              </div>
                              <div className="col-12 col-sm-6 border-start-sm">
                                <div className="text-muted small mb-1">Administrator</div>
                                <div className="fw-bold text-dark">{formData.adminName}</div>
                                <div className="text-muted small">{formData.designation}</div>
                                <div className="small text-dark mt-1">{formData.email}</div>
                                {formData.phone && <div className="small text-muted">{formData.phone}</div>}
                              </div>
                            </div>
                          </div>

                          {/* Checkboxes */}
                          <div className="mb-3 form-check text-start">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="termsConsent"
                              name="termsConsent"
                              checked={formData.termsConsent}
                              onChange={handleChange}
                              required
                            />
                            <label className="form-check-label small text-muted" htmlFor="termsConsent">
                              I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Privacy Policy</a> (DPDP Act 2023 compliant).
                            </label>
                            {errors.termsConsent && <div className="text-danger small mt-1">⚠ {errors.termsConsent}</div>}
                          </div>

                          <div className="mb-4 form-check text-start">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="enablePilot"
                              name="enablePilot"
                              checked={formData.enablePilot}
                              onChange={handleChange}
                            />
                            <label className="form-check-label small text-muted" htmlFor="enablePilot">
                              Enable automated AI Officer deployment for trial period (<strong>Free 30-day turnkey pilot</strong> with NAAC SSR generator).
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="d-flex justify-content-between mt-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary d-flex align-items-center gap-1 px-3"
                              onClick={handleBack}
                              disabled={isSubmitting}
                            >
                              <ArrowLeft size={16} /> Back
                            </button>
                            <button
                              type="submit"
                              className="btn btn-primary rounded-pill px-4 py-2 fw-bold shadow-sm"
                              disabled={isSubmitting}
                              style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none' }}
                            >
                              {isSubmitting ? (
                                <><span className="spinner-border spinner-border-sm me-2" />Creating Campus Instance...</>
                              ) : (
                                '🚀 Create Campus Instance'
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </form>
                  </div>

                  <p className="text-center text-muted small mt-4 mb-0">
                    Need help setting up your college? <a href="mailto:support@eduflow.ai" className="text-primary fw-semibold">Contact Engineering Support</a>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
