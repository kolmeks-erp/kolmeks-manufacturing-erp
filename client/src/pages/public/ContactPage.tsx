import React from 'react';
import { Container } from '../../components/ui/Container';
import { SEO } from '../../components/public/SEO';
import { PageHeader } from '../../components/public/PageHeader';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Mail, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="space-y-12">
      <SEO
        title="Contact Us | Kolmeks Sales & Technical Engineering"
        description="Get in touch with Kolmeks sales engineers for contract manufacturing inquiries, technical questions, and global support."
      />

      <PageHeader
        eyebrow="COMMUNICATION"
        title="Contact Kolmeks Manufacturing"
        description="Our sales engineers and technical team are available to discuss your component manufacturing requirements."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <section className="py-8 bg-white">
        <Container className="max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Contact Details */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Direct Inquiries</h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                For sales, manufacturing partnerships, technical drawings, or general corporate inquiries, please reach out to our team.
              </p>

              <div className="space-y-4 pt-2 font-mono text-xs text-slate-700">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Email Contact</div>
                    <div>contact@kolmeks-manufacturing.com</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900">Global Operations Hub</div>
                    <div>Industrial Manufacturing Zone</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form Shell */}
            <div className="lg:col-span-7 bg-slate-50 p-8 rounded-2xl border border-slate-200 space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Send a Message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" placeholder="John Doe" required />
                  <Input label="Company Email" type="email" placeholder="john@company.com" required />
                </div>
                <Input label="Company Name" placeholder="Acme Industrial Inc." />
                <Textarea label="Message / Inquiry Details" placeholder="Describe your manufacturing inquiry or technical requirements..." rows={4} required />
                <Button variant="primary" type="submit" leftIcon={<Send className="w-4 h-4" />}>
                  Send Message
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};
