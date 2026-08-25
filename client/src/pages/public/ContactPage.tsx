import React from 'react';
import { Container } from '../../components/ui/Container';
import { SectionHeading } from '../../components/ui/SectionHeading';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, MapPin } from 'lucide-react';

export const ContactPage: React.FC = () => {
  return (
    <div className="py-12">
      <Container>
        <SectionHeading
          eyebrow="Get in Touch"
          title="Contact Kolmeks Team"
          description="Connect with our engineering and sales representatives for technical inquiries."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6">
            <Card variant="industrial">
              <CardContent className="p-6 space-y-3">
                <MapPin className="w-5 h-5 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Headquarters</h4>
                <p className="text-xs text-slate-600">Industrial Engineering Zone, Kolmeks Production Hub</p>
              </CardContent>
            </Card>

            <Card variant="industrial">
              <CardContent className="p-6 space-y-3">
                <Mail className="w-5 h-5 text-industrial-700" />
                <h4 className="font-bold text-slate-900 text-sm">Email Inquiries</h4>
                <p className="text-xs text-slate-600">info@kolmeks-manufacturing.com</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card variant="default">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900">Send an Inquiry</h3>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="John Doe" />
                    <Input label="Email Address" type="email" placeholder="john@company.com" />
                  </div>
                  <Input label="Company Name" placeholder="Global Industrial Corp" />
                  <Textarea label="Message" placeholder="How can Kolmeks assist your manufacturing needs?" />
                  <Button variant="primary">Submit Message</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
};
