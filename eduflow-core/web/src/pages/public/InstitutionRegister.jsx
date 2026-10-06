import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { validateForm, validators } from '../../utils/validators';
import { ShieldCheck, Building, User, Mail, Lock, Globe } from 'lucide-react';
import { IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function InstitutionRegister() {
  const [formData, setFormData] = useState({
    institutionName: '',
    subdomain: '',
    adminName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subdomainLocked, setSubdomainLocked] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { register } = useAuth();

  // All schema values MUST be functions so validateForm can call them
  const buildSchema = (data) => ({
    institutionName: (v) => {
      if (!v || !v.trim()) return 'Institution name is required';
      if (v.trim().length < 3) return 'Minimum 3 characters required';
      return null;
    },
    subdomain: (v) => {
      if (!v || !v.trim()) return 'Workspace URL is required';
      if (v.trim().length < 3) return 'Minimum 3 characters required';
      if (!/^[a-z0-9-]+$/.test(v)) return 'Only lowercase letters, numbers, and hyphens allowed';
      return null;
    },
    adminName: (v) => {
      if (!v || !v.trim()) return 'Admin name is required';
      if (v.trim().length < 3) return 'Minimum 3 characters required';
      return null;
    },
    email: validators.email,
    password: validators.password,
    confirmPassword: validators.match(data.password),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Auto-generate subdomain from institution name (only while not manually edited)
    if (name === 'institutionName' && !subdomainLocked) {
      const generated = value
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setFormData(prev => ({ ...prev, institutionName: value, subdomain: generated }));
    }

    // Once user manually touches subdomain, stop auto-generating
    if (name === 'subdomain') {
      setSubdomainLocked(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const schema = buildSchema(formData);
    const validationErrors = validateForm(formData, schema);

    // validateForm returns null when there are no errors
    if (validationErrors) {
      setErrors(validationErrors);
      addToast('Please fix the highlighted errors before continuing.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await register(formData);
      addToast(
        `✅ Workspace created! ${formData.subdomain}.eduflow.app is ready.`,
        'success'
      );
      navigate('/admin-dashboard');
    } catch (err) {
      addToast(err.message || 'Registration failed. Please try again.', 'error');
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
    <div className="min-vh-100 d-flex flex-column" style={{ background: 'var(--app-bg, linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%))' }}>
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 fixed-top shadow-sm">
        <div className="container-xl">
          <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div className="bg-primary text-white rounded d-flex align-items-center justify-content-center" style={{ width: 36, height: 36 }}>
              <Building size={20} />
            </div>
            <span className="fw-bold fs-4" style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduFlow</span>
          </Link>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted d-none d-md-block small">Already have a workspace?</span>
            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="container-xl flex-grow-1 d-flex align-items-start align-items-md-center justify-content-center" style={{ marginTop: '80px', padding: '2rem 1rem 3rem' }}>
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">

            {/* Header */}
            <div className="text-center mb-4">
              <h1 className="fw-bold fs-3 text-dark mb-1">Create Your Institution Workspace</h1>
              <p className="text-muted">Get your AI-powered campus management platform running in under 2 minutes.</p>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ background: 'var(--card-bg)', color: 'var(--app-text)' }}>
              <div className="row g-0">

                {/* Left sidebar */}
                <div
                  className="col-12 col-md-4 p-4 text-white d-flex flex-column justify-content-between"
                  style={{ background: 'linear-gradient(160deg,#1e3a8a 0%,#2563EB 60%,#7C3AED 100%)', minHeight: '460px' }}
                >
                  <div>
                    <div className="mb-3">
                      <span className="badge bg-white bg-opacity-25 text-white rounded-pill px-3 py-2 small fw-semibold">
                        🎓 Free Forever Plan
                      </span>
                    </div>
                    <h4 className="fw-bold mb-2">Everything you need to run your campus</h4>
                    <p className="opacity-75 small mb-4">Join institutions already automating NAAC accreditation, timetables, and admissions with AI.</p>
                    <ul className="list-unstyled mb-0 small">
                      {[
                        [<ShieldCheck size={16} key="s" />, 'Enterprise-grade Security'],
                        [<Globe size={16} key="g" />, 'Custom subdomain (you.eduflow.app)'],
                        [<Building size={16} key="b" />, '5 AI Officers included'],
                        [<User size={16} key="u" />, 'Unlimited admin users'],
                      ].map(([icon, text], i) => (
                        <li key={i} className="mb-3 d-flex gap-2 align-items-start">
                          <span className="mt-1 opacity-90">{icon}</span>
                          <span className="opacity-80">{text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-3 border-top border-white border-opacity-25">
                    <p className="opacity-60 mb-0" style={{ fontSize: '0.75rem' }}>
                      By registering, you agree to our Terms of Service and Privacy Policy.
                    </p>
                  </div>
                </div>

                {/* Right side form */}
                <div className="col-12 col-md-8 p-4 p-lg-5 bg-white">
                  <form onSubmit={handleSubmit} noValidate>

                    {/* Section 1: Institution */}
                    <div className="mb-4">
                      <p className="text-uppercase fw-bold small text-primary mb-3" style={{ letterSpacing: '0.08em' }}>
                        1 — Institution Details
                      </p>

                      {/* Institution Name */}
                      <div className="mb-3">
                        <label className="form-label fw-semibold text-dark small mb-1">Institution Name</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted"><Building size={17} /></span>
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
                        {errors.institutionName
                          ? <div className="text-danger small mt-1">⚠ {errors.institutionName}</div>
                          : <div className="text-muted small mt-1">Full legal name of your institution.</div>
                        }
                      </div>

                      {/* Subdomain */}
                      <div className="mb-1">
                        <label className="form-label fw-semibold text-dark small mb-1">Workspace URL</label>
                        <div className="input-group">
                          <span className="input-group-text bg-light border-end-0 text-muted"><Globe size={17} /></span>
                          <input
                            type="text"
                            className={`form-control border-start-0 border-end-0 font-monospace ${errors.subdomain ? 'is-invalid' : ''}`}
                            name="subdomain"
                            placeholder="yourschool"
                            value={formData.subdomain}
                            onChange={handleChange}
                          />
                          <span className="input-group-text bg-light text-muted small">.eduflow.app</span>
                        </div>
                        {errors.subdomain
                          ? <div className="text-danger small mt-1">⚠ {errors.subdomain}</div>
                          : formData.subdomain
                            ? <div className="text-success small mt-1">✓ Your URL: <strong>{formData.subdomain}.eduflow.app</strong></div>
                            : <div className="text-muted small mt-1">Auto-generated from your name. Lowercase, numbers, hyphens only.</div>
                        }
                      </div>
                    </div>

                    <hr className="my-4 border-light" />

                    {/* Section 2: Admin Account */}
                    <div className="mb-4">
                      <p className="text-uppercase fw-bold small text-primary mb-3" style={{ letterSpacing: '0.08em' }}>
                        2 — Admin Account
                      </p>

                      <div className="row g-3 mb-3">
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Full Name</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted"><User size={17} /></span>
                            <input
                              type="text"
                              className={`form-control border-start-0 ${errors.adminName ? 'is-invalid' : ''}`}
                              name="adminName"
                              placeholder="Dr. Rajesh Kumar"
                              value={formData.adminName}
                              onChange={handleChange}
                            />
                          </div>
                          {errors.adminName && <div className="text-danger small mt-1">⚠ {errors.adminName}</div>}
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Email Address</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted"><Mail size={17} /></span>
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
                      </div>

                      <div className="row g-3">
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={17} /></span>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className={`form-control border-start-0 border-end-0 ${errors.password ? 'is-invalid' : ''}`}
                              name="password"
                              placeholder="Min 8 chars, 1 uppercase, 1 number"
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
                                <div
                                  className={`progress-bar bg-${strength.color}`}
                                  style={{ width: strength.width, transition: 'width 0.3s' }}
                                />
                              </div>
                              <span className={`text-${strength.color} small`}>Password strength: {strength.level}</span>
                            </div>
                          )}
                          {errors.password && <div className="text-danger small mt-1">⚠ {errors.password}</div>}
                        </div>
                        <div className="col-12 col-sm-6">
                          <label className="form-label fw-semibold text-dark small mb-1">Confirm Password</label>
                          <div className="input-group">
                            <span className="input-group-text bg-light border-end-0 text-muted"><Lock size={17} /></span>
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
                    </div>

                      <div className="mb-3 form-check text-start">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          id="termsConsent"
                          required
                        />
                        <label className="form-check-label small text-muted" htmlFor="termsConsent">
                          I agree to the <a href="/terms" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary fw-semibold">Privacy Policy</a> (DPDP Act 2023).
                        </label>
                      </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-100 rounded-pill py-2 fw-bold fs-6"
                      disabled={isSubmitting}
                      style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', border: 'none' }}
                    >
                      {isSubmitting ? (
                        <><span className="spinner-border spinner-border-sm me-2" />Setting up your workspace...</>
                      ) : (
                        '🚀 Create My Workspace — Free'
                      )}
                    </button>

                    <p className="text-center text-muted small mt-3 mb-0">
                      Already registered? <Link to="/login" className="text-primary fw-semibold">Sign in here</Link>
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
