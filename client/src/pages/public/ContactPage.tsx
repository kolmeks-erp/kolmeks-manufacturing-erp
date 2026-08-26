import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { ContactInfoCard } from '../../components/public/ContactInfoCard';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, Map, ArrowRight, AlertCircle } from 'lucide-react';
import contactHeroImg from '../../assets/images/kolmeks-contact-hero.webp';

export const ContactPage: React.FC = () => {
  const [formState, setFormState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      errs.email = 'Work email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      errs.subject = 'Subject selection is required';
    }

    if (!formData.message.trim()) {
      errs.message = 'Message details are required';
    } else if (formData.message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setFormState('submitting');
    setTimeout(() => {
      setFormState('success');
    }, 800);
  };

  const contactCards = [
    {
      icon: Mail,
      title: 'Email Inquiries',
      value: 'info@kolmeks.com',
      note: 'Response within 24-48 business hours',
    },
    {
      icon: Phone,
      title: 'Phone Contact',
      value: '+358 (0) 20 742 0200',
      note: 'Monday – Friday: 08:00 – 16:00 (EET)',
    },
    {
      icon: MapPin,
      title: 'Manufacturing & Headquarters',
      value: 'Turenki Facility, Finland',
      note: 'Primary component machining & R&D center',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      value: '08:00 - 16:00 (EET)',
      note: 'Closed on official public holidays',
    },
  ];

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Contact"
        description="Connect with Kolmeks for component manufacturing inquiries, engineering discussions, drawing reviews, and supply chain consultations."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CONTACT"
        title="Let's Talk About Your Manufacturing Requirement."
        description="Invite our engineering and project teams to discuss your component manufacturing, machining capacity, drawing evaluation, or logistics requirements."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
        secondaryCtaText="Send a Message"
        secondaryCtaLink="#contact-form"
        imageUrl={contactHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Contact' },
          ]}
        />
      </Container>

      {/* Contact Cards Grid */}
      <section className="py-4">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="GET IN TOUCH"
            title="Direct Contact Channels."
            description="Connect with our sales, engineering, and administrative teams."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((c, idx) => (
              <ContactInfoCard key={idx} {...c} />
            ))}
          </div>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-4">
        <Container>
          <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 border border-slate-200 rounded-2xl shadow-xs space-y-8">
            <SectionHeading
              eyebrow="MESSAGE FORM"
              title="Send Us an Inquiry."
              description="Fill out the fields below to send a message directly to our team."
            />

            {formState === 'success' ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Inquiry Received</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Kolmeks. Your message inquiry has been recorded and our team will review it.
                </p>
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormState('idle');
                      setFormData({ name: '', company: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                        errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      Work Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                        errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                      }`}
                      placeholder="jane@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Company */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Company Name</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Industrial OEM Corp"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Phone Number</label>
                    <input
                      type="tel"
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="+358 ..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Inquiry Subject <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="CNC Machining">CNC Machining & Turning</option>
                    <option value="Sub-Assembly">Sub-Assembly Services</option>
                    <option value="Contract Manufacturing">Contract Manufacturing</option>
                    <option value="Quality & Metrology">Quality & Inspection Standards</option>
                    <option value="Careers">Careers & HR Inquiries</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    Message / Requirement Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    className={`w-full px-3.5 py-2.5 text-sm border rounded-lg focus:ring-2 focus:outline-none transition-colors ${
                      errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500'
                    }`}
                    placeholder="Please describe your component requirements, material specifications, or project details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                  {errors.message && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={formState === 'submitting'}
                  rightIcon={<Send className="w-4 h-4" />}
                >
                  Submit Inquiry
                </Button>
              </form>
            )}
          </div>
        </Container>
      </section>

      {/* Location Map Placeholder */}
      <section className="py-4">
        <Container>
          <div className="p-8 sm:p-12 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-xs">
            <Map className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">Location Map Placeholder</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Location map will be available after verified location information is added.
            </p>
          </div>
        </Container>
      </section>

      {/* Secondary Contact CTA */}
      <section className="py-4">
        <Container>
          <div className="bg-[#0B1E36] text-white p-8 sm:p-12 rounded-2xl border border-slate-800 text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Have a Specific Manufacturing Requirement?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Submit your engineering drawings and component specifications to request a detailed manufacturing quote.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
              <Link to="/request-quote">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Request a Quote
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
