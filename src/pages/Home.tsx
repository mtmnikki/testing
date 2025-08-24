/**
 * Public Home Page
 * This file renders the marketing homepage. Per request, the first three sections
 * (Hero, Advantage, Programs) are replaced to exactly match the provided code.
 * Remaining sections are preserved.
 */

import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';
import SafeText from '../components/common/SafeText';
import BlackSloganLogo from '../assets/images/blacksloganlogo.svg';
import FemalePharm1 from '../assets/images/femalepharm1.svg';
import FemalePharmShow from '../assets/images/femalepharmshow.svg'
import {
  // Icons used in replaced sections
  Play,
  Users,
  Clock,
  CheckCircle,
  ArrowRight,
  Target,
  Zap,
  Shield,
  Award,
  FileText,
  Heart,
  // Icons used in the rest of the existing sections (kept)
  Users as UsersIcon,
  Quote,
  BookOpen,
  Stethoscope,
  TrendingUp,
  Lightbulb
} from 'lucide-react'


/**
 * Program card item interface for the (replaced) Programs section
 */
interface ProgramCardItem {
  /** Program display name */
  title: string
  /** Short description for the program card */
  description: string
  /** Lucide icon component for the card */
  icon: React.ComponentType<{ className?: string }>
  /** Bullet features to display under the description */
  features: string[]
}

/**
 * Small reusable card to display program information in the Programs section (replaced design)
 */
function ProgramCard({ item }: { item: ProgramCardItem }) {
  return (
    <Card className="bg-gray-800/70 border-gray-700 hover:bg-gray-800 transition-colors">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <item.icon className="h-5 w-5 text-white" />
          </div>
          <CardTitle className="text-white text-lg">
            <SafeText value={item.title} />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-300 text-sm mb-4">
          <SafeText value={item.description} />
        </p>
        <ul className="space-y-2">
          {item.features.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-400">
              <CheckCircle className="h-3 w-3 text-green-400 mr-2" />
              <SafeText value={feature} />
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * Home Page component
 * The first three sections are replaced per user's exact code.
 * Remaining sections are preserved from the existing design.
 */
const HomePage: React.FC = () => {
  /**
   * Active feature card index for subtle selected styling in the Advantage section
   */
  const [activeFeature, setActiveFeature] = useState(0)

  /**
   * Feature list for "The ClinicalRxQ Advantage" section
   * Matches exactly the provided content (3 items).
   */
  const features = [
    {
      title: 'Operational Flywheel',
      description:
        'Transform from reactive dispensing to proactive, appointment-based care with TimeMyMeds synchronization',
      icon: Target,
      color: 'from-green-300 to-teal-400'
    },
    {
      title: 'Technician Force Multiplier',
      description:
        'Empower your pharmacy technicians to handle operational tasks, freeing pharmacists for clinical excellence',
      icon: Users,
      color: 'from-teal-500 to-cyan-300'
    },
    {
      title: 'Turnkey Clinical Infrastructure',
      description:
        'Complete business-in-a-box solution with protocols, forms, billing codes, and implementation guides',
      icon: Shield,
      color: 'from-cyan-400 to-blue-700'
    }
  ]

  /**
   * Programs displayed in the homepage programs section
   * Matches exactly the provided content.
   */
  const programs: ProgramCardItem[] = [
    {
      title: 'TimeMyMeds',
      description:
        'Create predictable appointment schedules that enable clinical service delivery',
      icon: Clock,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes']
    },
    {
      title: 'MTM The Future Today',
      description:
        'Team-based Medication Therapy Management with proven protocols and technician workflows',
      icon: FileText,
      features: ['Comprehensive Reviews', 'Billing Expertise', 'Patient Outcomes']
    },
    {
      title: 'Test & Treat Services',
      description:
        'Point-of-care testing and treatment for Flu, Strep, and COVID-19',
      icon: Zap,
      features: ['CLIA-Waived Testing', 'State Protocols', 'Medical Billing']
    },
    {
      title: 'HbA1c Testing',
      description:
        'Diabetes management with point-of-care A1c testing and clinical integration',
      icon: Award,
      features: ['Quality Metrics', 'Provider Communication', 'Value-Based Care']
    },
    {
      title: 'Oral Contraceptives',
      description:
        'From patient intake to medical billing, our protocols are here for your team and patients',
      icon: Heart,
      features: [
        'Practice-Based Clinical Skills',
        'Pharmacy Tech Training',
        'Prescribing with Confidence'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section (REPLACED - exact as provided) */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-300 via-cyan-200 to-teal-200 opacity-10"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6 flex xl:justify-start">
                <img 
                  src={BlackSloganLogo} 
                  alt="Where Dispensing Meets Direct Patient Care" 
                  className="w-full" 
                />
              </div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Transform Your{' '}
                <span className="bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
                  Pharmacy Practice
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The complete ecosystem for community pharmacy teams to deliver profitable, patient-centered
                clinical services with proven protocols and turnkey infrastructure.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-3"
                  onClick={() => {
                    const programsSection = document.getElementById('our-programs');
                    if (programsSection) {
                      programsSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <Play className="mr-2 h-5 w-5" />
                  Explore Programs
                </Button>
              </div>
            </div>

            <div className="relative">
              <img
                src={FemalePharm1}
                alt="Female pharmacist providing patient care"
                className="w-full h-auto max-w-lg mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The ClinicalRxQ Advantage (REPLACED - exact as provided) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              The ClinicalRxQ{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Advantage
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three core systems that transform your pharmacy from reactive dispensing to proactive patient care
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-300 to-teal-400 opacity-5"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-300 to-teal-400 flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Operational Flywheel</CardTitle>
                <p className="text-gray-600 font-medium">Transform reactive dispensing to proactive care</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Appointment-based medication synchronization</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Predictable patient interaction schedules</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Enhanced medication adherence outcomes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Consistent revenue from clinical services</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-300 opacity-5"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-300 flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Technician Force Multiplier</CardTitle>
                <p className="text-gray-600 font-medium">Empower your team for clinical excellence</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Technician-led appointment scheduling</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Handle all paperwork and documentation</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Process billing and claims submission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Pharmacists focus exclusively on clinical care</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-green-400 opacity-5"></div>
              <CardHeader className="relative z-10">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-400 to-green-400 flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl mb-2">Turnkey Clinical Infrastructure</CardTitle>
                <p className="text-gray-600 font-medium">Complete 'business-in-a-box' solution</p>
              </CardHeader>
              <CardContent className="relative z-10">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Step-by-step Standard Operating Procedures</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">All necessary forms and worksheets</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Specific CPT, HCPCS, and ICD-10 codes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Software platform navigation guides</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Programs Section (REPLACED - exact as provided) */}
      <section id="our-programs" className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-cyan-400 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-300 bg-clip-text text-transparent">
                Programs
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive training programs designed to transform your pharmacy practice and improve patient outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {programs.slice(0, 3).map((program, index) => (
              <ProgramCard key={index} item={program} />
            ))}
            <div className="flex items-center justify-center">
              <img 
                src={FemalePharmShow} 
                alt="Female Pharmacist" 
                className="w-full h-full object-contain"
              />
            </div>
            {programs.slice(3).map((program, index) => (
              <ProgramCard key={index + 3} item={program} />
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different (existing, preserved) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              The ClinicalRxQ{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Difference
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just teach clinical knowledge—we provide the complete infrastructure
              for successful implementation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Designed by Community Pharmacists</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Every protocol was created and tested in real community pharmacy settings by practicing pharmacists who understand your daily challenges.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Implementation, Not Just Education</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We teach the 'how,' not just the 'what.' Complete operational toolkits ensure you can launch services immediately and correctly.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Empowering Team-Based Workflow</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Empowering pharmacy technicians through team-based protocols. Our workflows implement real-world solutions that enhance efficiency and patient care.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">Patient-Centered Approach</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Transform from product-centric dispensing to patient-centered care that improves outcomes and builds lasting relationships.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Target Audience (existing, preserved) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Who We{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Serve
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-6">
                <Lightbulb className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Pharmacists</h3>
                <p className="text-gray-600 text-sm">
                  Community-based practitioners ready to expand their clinical services
                  and practice at the top of their license
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <UsersIcon className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Pharmacy Technicians</h3>
                <p className="text-gray-600 text-sm">
                  Essential team members who multiply pharmacist effectiveness through
                  operational excellence
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <Heart className="h-12 w-12 text-cyan-500 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Community Pharmacy Settings</h3>
                <p className="text-gray-600 text-sm">
                  From independent single-store pharmacies to large multi-site enterprises
                  seeking transformation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy (existing, preserved) */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Our{' '}
              <span className="bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-300 bg-clip-text text-transparent">
                Philosophy
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card className="bg-white shadow-xl">
                <CardContent className="p-8">
                  <Quote className="h-8 w-8 text-cyan-400 mb-4 mx-auto" />
                  <p className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
                    "Retail is a FOUR-LETTER Word. We are COMMUNITY PHARMACISTS."
                  </p>
                  <p className="text-lg text-gray-700 mb-4">
                    Retailers sell product. Community Pharmacists deliver medical treatments.
                    We provide counseling and clinical services to accompany the medical
                    treatments we deliver to our patients.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    Our program emphasizes the important role the Community Pharmacist plays
                    on the healthcare team and trains Community Pharmacists on how to utilize
                    their clinical training inside the community pharmacy workflow.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Values */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-0 mb-4">
                OUR MISSION
              </Badge>
              <h2 className="text-3xl font-bold mb-6">
                Empowering Community Pharmacists
              </h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                ClinicalRxQ was founded to address the critical need for standardized, 
                evidence-based clinical pharmacy services in community settings. We provide 
                comprehensive training, protocols, and documentation systems that enable 
                pharmacies to deliver enhanced patient care services.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Enhanced Patient Care</p>
                    <p className="text-gray-600 text-sm">
                      Providing tools and training that improve patient outcomes and satisfaction
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Practice Growth</p>
                    <p className="text-gray-600 text-sm">
                      Creating new revenue opportunities through evidence-based clinical services
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">Patient-Centered Care</p>
                    <p className="text-gray-600 text-sm">
                      Focus on improving patient outcomes through enhanced pharmacy services
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <img
                src="https://pub-cdn.sider.ai/u/U0X7H845ROR/web-coder/689cc75ea616cfbf06746dc2/resource/b497dbb6-85a1-4546-9fda-3e4492cb21d6.jpg"
                alt="Pharmacy team collaboration"
                className="rounded-2xl shadow-2xl object-cover w-full h-full"
              />
              <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-300 rounded-2xl opacity-20"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-[1200px] px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at ClinicalRxQ
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Excellence</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We maintain the highest standards in clinical content, training materials, 
                  and customer support.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-cyan-600" />
                </div>
                <CardTitle>Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We believe in the power of teamwork and work closely with pharmacy 
                  professionals to develop practical solutions.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardHeader>
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-teal-600" />
                </div>
                <CardTitle>Compassion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We are driven by a genuine desire to improve patient care and support 
                  community pharmacists in their vital role.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="mx-auto max-w-[1200px] px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Become part of the growing network of pharmacies transforming patient care 
            through ClinicalRxQ's comprehensive programs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" variant="outline" className="bg-transparent">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage