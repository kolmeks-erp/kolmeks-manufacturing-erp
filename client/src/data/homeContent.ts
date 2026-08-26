import { 
  Factory, 
  Cpu, 
  Boxes, 
  Zap, 
  Truck, 
  ShieldCheck, 
  FileCheck2, 
  Layers, 
  CheckCircle2,
  Car,
  Cog,
  Wrench,
  Award,
  Users
} from 'lucide-react';

export const POSITIONING_STRIP_ITEMS = [
  { icon: ShieldCheck, text: 'Precision Manufacturing' },
  { icon: Cpu, text: 'Engineering Expertise' },
  { icon: Award, text: 'Quality Focus' },
  { icon: Truck, text: 'Reliable Supply' },
];

export const CAPABILITIES_DATA = [
  {
    index: '01',
    icon: Factory,
    title: 'Contract Manufacturing',
    description: 'Turnkey component production, dedicated manufacturing lines, and scalable supply for global OEMs.',
    href: '/contract-manufacturing',
    badge: 'Turnkey',
  },
  {
    index: '02',
    icon: Cpu,
    title: 'CNC Machining',
    description: 'High-speed 5-axis milling, turning, and automatic lathe machining with tight tolerance control.',
    href: '/cnc-machining',
    badge: 'Precision',
  },
  {
    index: '03',
    icon: Boxes,
    title: 'Component Assembly',
    description: 'Electro-mechanical sub-assemblies, pressure testing, and final quality assurance validation.',
    href: '/assembly',
    badge: 'Sub-Assembly',
  },
  {
    index: '04',
    icon: Zap,
    title: 'Electric Motors & Components',
    description: 'Custom stator and rotor manufacturing, copper winding, and specialized motor component solutions.',
    href: '/electric-motors',
    badge: 'Electrical',
  },
  {
    index: '05',
    icon: Truck,
    title: 'Supply Chain Solutions',
    description: 'Raw material sourcing, buffer inventory coordination, and just-in-time logistics delivery.',
    href: '/supply-chain',
    badge: 'Logistics',
  },
];

export const PROCESS_STEPS_DATA = [
  {
    step: '01',
    title: 'Engineering & DFM',
    description: 'Understand technical drawings, evaluate design for manufacturability (DFM), and establish tooling parameters.',
    icon: FileCheck2,
  },
  {
    step: '02',
    title: 'Material Sourcing',
    description: 'Prepare raw materials, verify mill test certificates, and ensure strict alloy compliance.',
    icon: Layers,
  },
  {
    step: '03',
    title: 'CNC Machining',
    description: 'Manufacture precision components using multi-axis milling, turning, and tight-tolerance machining.',
    icon: Cpu,
  },
  {
    step: '04',
    title: 'Quality Inspection',
    description: 'Verify finished parts against specifications using CMM coordinate scanning and optical surface profilers.',
    icon: ShieldCheck,
  },
  {
    step: '05',
    title: 'Assembly & Testing',
    description: 'Combine machined components into electro-mechanical sub-assemblies with pressure & functional testing.',
    icon: Boxes,
  },
  {
    step: '06',
    title: 'Logistics & Delivery',
    description: 'Prepare protective packaging, export documentation, and schedule reliable delivery to customer facilities.',
    icon: Truck,
  },
];

export const QUALITY_HIGHLIGHTS_DATA = [
  {
    title: 'Precision',
    description: 'Consistent manufacturing focused strictly on defined technical requirements and sub-micron tolerances.',
  },
  {
    title: 'Inspection Protocols',
    description: 'Coordinate Measuring Machine (CMM) dimensional audits and in-process quality control checks.',
  },
  {
    title: 'Complete Traceability',
    description: 'Clear visibility of raw material heat numbers, batch records, and inspection certifications.',
  },
  {
    title: 'Continuous Improvement',
    description: 'Ongoing investment in advanced machining technology, process optimization, and team training.',
  },
];

export const GLOBAL_REGIONS_DATA = [
  {
    region: 'Northern Europe',
    capability: 'Primary Manufacturing & Engineering Center',
    status: 'Operational Network Hub',
    isPlaceholder: true,
  },
  {
    region: 'Central Europe',
    capability: 'Precision Components & Assembly Hub',
    status: 'Operational Network Hub',
    isPlaceholder: true,
  },
  {
    region: 'Global Logistics Network',
    capability: 'International Supply Chain Coordination',
    status: 'Distribution Center',
    isPlaceholder: true,
  },
];

export const INDUSTRIES_DATA = [
  {
    icon: Factory,
    title: 'Industrial OEM Machinery',
    description: 'Heavy machinery housings, precision shafts, and custom mechanical sub-assemblies.',
  },
  {
    icon: Car,
    title: 'Transportation & Mobility',
    description: 'High-durability machined castings, brackets, and structural components.',
  },
  {
    icon: Zap,
    title: 'Electrical & Power Systems',
    description: 'Stator laminations, electric motor windings, and conductive component assemblies.',
  },
  {
    icon: Cog,
    title: 'Precision Automation',
    description: 'Robotic drive gears, pneumatic blocks, and micron-tolerance sensor housings.',
  },
  {
    icon: Wrench,
    title: 'Fluid & Pump Technologies',
    description: 'Impellers, valve bodies, and pressure-tested hydraulic component assemblies.',
  },
  {
    icon: ShieldCheck,
    title: 'Energy & Power Infrastructure',
    description: 'Heat-resistant alloy parts and specialized components for power generation.',
  },
];

export const WHY_KOLMEKS_PRINCIPLES = [
  {
    number: '01',
    title: 'Engineering Expertise',
    description: 'Collaborative DFM engineering to optimize part design for production efficiency, structural integrity, and unit cost.',
  },
  {
    number: '02',
    title: 'Manufacturing Precision',
    description: 'State-of-the-art multi-axis CNC machines providing repeatable dimensional accuracy across small and large batches.',
  },
  {
    number: '03',
    title: 'Quality Focus',
    description: 'Strict quality control management systems, 3D CMM inspection, and raw material traceability protocols.',
  },
  {
    number: '04',
    title: 'Reliable Supply Chain',
    description: 'Strategic material sourcing, buffer stock management, and scheduled JIT delivery to protect your assembly line.',
  },
  {
    number: '05',
    title: 'Customer Collaboration',
    description: 'Direct communication with technical sales engineers and transparent ERP production status monitoring.',
  },
  {
    number: '06',
    title: 'Global Coordination',
    description: 'International logistics network ensuring seamless component delivery to manufacturing sites worldwide.',
  },
];

export const STATS_PLACEHOLDERS_DATA = [
  { label: 'Quality Standard', value: 'ISO 9001', subtext: 'Standardized SOPs' },
  { label: 'Environmental Standard', value: 'ISO 14001', subtext: 'Sustainable Sourcing' },
  { label: 'CMM Inspection', value: '±0.005mm', subtext: 'Micron Accuracy' },
  { label: 'ERP Digitization', value: '100%', subtext: 'Real-time Telemetry' },
];
