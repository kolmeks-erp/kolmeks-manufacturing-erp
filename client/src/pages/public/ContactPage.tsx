import React, { useState } from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { VisualPlaceholder } from '../../components/public/VisualPlaceholder';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Mail, Phone, MapPin, Send, CheckCircle2, Clock, MessageSquare, Building2 } from 'lucide-react';
import contactHeroImg from '../../assets/images/kolmeks-contact-hero.webp';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-16 lg:space-y-24 bg-slate-50/50 pb-12">
      <SEO
        title="Kolmeks | Contact Us"
        description="Get in touch with Kolmeks for component manufacturing inquiries, engineering discussions, and facility consultations."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CONTACT KOLMEKS"
        title="Connect With Our Engineering Team."
        description="Have questions regarding component manufacturing, machining capacity, drawing evaluation, or logistics coordination? Our team is available to support your inquiry."
        primaryCtaText="Send a Message"
        primaryCtaLink="#contact-form"
        secondaryCtaText="Request a Quote"
        secondaryCtaLink="/request-quote"
        imageUrl={contactHeroImg}
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs
          items={[
            { label: 'Contact Us' },
          ]}
        />
      </Container>

      {/* Main Contact Grid */}
      <section id="contact-form" className="py-4">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <SectionHeading
                eyebrow="GET IN TOUCH"
                title="Direct Inquiries & Technical Support."
                description="We welcome inquiries from global OEM manufacturers, purchasing teams, and design engineers."
              />

              <div className="space-y-4 pt-2">
                <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Email Inquiries</h3>
                    <p className="text-xs text-slate-600 mt-0.5">info@kolmeks.com</p>
                    <p className="text-[11px] text-slate-400 mt-1">Response within 24-48 business hours</p>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Phone Contact</h3>
                    <p className="text-xs text-slate-600 mt-0.5">+358 (0) 20 742 0200</p>
                    <p className="text-[11px] text-slate-400 mt-1">Monday – Friday: 08:00 – 16:00 (EET)</p>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl flex items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Headquarters & Manufacturing</h3>
                    <p className="text-xs text-slate-600 mt-0.5">Turenki Facility, Finland</p>
                    <p className="text-[11px] text-slate-400 mt-1">Primary component machining & R&D center</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 border border-slate-200 rounded-2xl shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">Message Received</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for contacting Kolmeks. Our team has received your inquiry and will respond promptly.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900">Send Us a Message</h3>
                    <p className="text-xs text-slate-500">Fill out the fields below to connect with our engineering team.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Full Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Work Email *</label>
                      <input
                        type="email"
                        required
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Company Name</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Industrial OEM Corp"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Phone Number</label>
                      <input
                        type="tel"
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+358 ..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Inquiry Subject</label>
                    <select
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none bg-white"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="CNC Machining">CNC Machining Consultation</option>
                      <option value="Contract Manufacturing">Contract Manufacturing Project</option>
                      <option value="Quality & Inspection">Quality & Inspection Standards</option>
                      <option value="Careers">Careers & HR Inquiry</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Message / Details *</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your manufacturing requirements..."
                    />
                  </div>

                  <Button type="submit" variant="primary" size="md" className="w-full" rightIcon={<Send className="w-4 h-4" />}>
                    Submit Inquiry
                  </Button>
                </form>
              )}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
