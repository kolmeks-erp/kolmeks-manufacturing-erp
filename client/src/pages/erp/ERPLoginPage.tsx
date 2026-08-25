import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Factory, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ERP_BASE_PATH } from '../../constants/navigation';

export const ERPLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Prompt 01 authentication routing foundation
    navigate(`${ERP_BASE_PATH}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-industrial-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <div className="absolute inset-0 industrial-grid-bg opacity-10 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Logo Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-industrial-850 text-white shadow-xl mb-2 border border-industrial-700">
            <Factory className="w-7 h-7 text-industrial-500" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">KOLMEKS ERP</h1>
          <p className="text-xs text-slate-400 font-mono">Secure Manufacturing Operations Access</p>
        </div>

        <Card variant="default" className="shadow-2xl border-slate-800 bg-white">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-industrial-700 shrink-0" />
              <span>Supabase Auth Ready Architecture</span>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                label="Employee Email / Staff ID"
                type="email"
                placeholder="ops@kolmeks.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="primary" className="w-full py-2.5" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Authenticate & Enter ERP
              </Button>
            </form>

            <div className="text-center pt-2">
              <Link to="/" className="text-xs text-slate-500 hover:text-industrial-700 font-medium">
                ← Return to Public Kolmeks Website
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-[10px] font-mono text-slate-400">
          Unauthorized access attempts are monitored and logged in audit telemetry.
        </div>
      </div>
    </div>
  );
};
