import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { Breadcrumbs } from '../../components/public/Breadcrumbs';
import { HeroSection } from '../../components/public/HeroSection';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  HelpCircle,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: 'general',
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
        description="Get in touch with Kolmeks technical account managers, engineering team, or sales representatives."
      />

      {/* Hero Section */}
      <HeroSection
        eyebrow="CONTACT KOLMEKS"
        title="Get in Touch with Our Technical Team."
        description="Have a technical inquiry, contract manufacturing question, or OEM partnership proposal? Connect directly with our engineering and sales representatives."
        primaryCtaText="Request a Quote"
        primaryCtaLink="/request-quote"
      />

      {/* Breadcrumbs Bar */}
      <Container className="-mt-8 lg:-mt-14 relative z-20">
        <Breadcrumbs items={[{ label: 'Contact' }]} />
      </Container>

      {/* Main Contact Section */}
      <section className="py-4">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info & Offices */}
            <div className="lg:col-span-5 space-y-8">
              <SectionHeading
                eyebrow="DIRECT CONTACT"
                title="Engineering & Sales Offices."
                description="Our team is available to assist with component specs and drawings."
              />

              <div className="space-y-6">
                <Card variant="industrial" className="border-l-4 border-l-blue-600">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Sales & RFQ Inquiries</div>
                        <div className="font-bold text-slate-900 text-sm">sales@kolmeks.com</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="industrial" className="border-l-4 border-l-blue-600">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Customer Support</div>
                        <div className="font-bold text-slate-900 text-sm">+358 (0) 20 7500 000</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="industrial">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Head Office Location</div>
                        <div className="font-bold text-slate-900 text-sm">Kolmeks Manufacturing Hub</div>
                        <div className="text-xs text-slate-600">Industrial Facility & Production Center</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="industrial">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-mono text-slate-500 uppercase">Business Operating Hours</div>
                        <div className="font-bold text-slate-900 text-sm">Monday — Friday: 08:00 - 17:00 (EET)</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Send an Inquiry</h2>
                  <p className="text-sm text-slate-600">
                    Fill out the form below and an engineering account representative will respond within 24 hours.
                  </p>
                </div>

                {submitted ? (
                  <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                    <h3 className="text-xl font-bold text-emerald-900">Inquiry Received!</h3>
                    <p className="text-sm text-emerald-700 max-w-md mx-auto">
                      Thank you for contacting Kolmeks. Our technical account team will review your message and contact you promptly.
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Full Name *"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                      />
                      <Input
                        label="Work Email *"
                        type="email"
                        placeholder="john.doe@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Company Name *"
                        placeholder="Industrial OEM Inc."
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        required
                      />
                      <Input
                        label="Phone Number"
                        placeholder="+358..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>

                    <Select
                      label="Inquiry Topic"
                      options={[
                        { label: 'General Information & Support', value: 'general' },
                        { label: 'Contract Manufacturing Inquiries', value: 'contract' },
                        { label: 'CNC Machining Specifications', value: 'cnc' },
                        { label: 'Sub-Assembly & Component Fitment', value: 'assembly' },
                        { label: 'Quality Systems & Testing Audit', value: 'quality' },
                      ]}
                      value={formData.inquiryType}
                      onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    />

                    <Textarea
                      label="Your Message or Project Summary *"
                      placeholder="Please describe your component requirements, annual estimated volumes, or technical specifications..."
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    />

                    <div className="pt-2">
                      <Button variant="primary" size="lg" className="w-full sm:w-auto" rightIcon={<Send className="w-4 h-4" />}>
                        Submit Technical Inquiry
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
