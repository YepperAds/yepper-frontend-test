// src/components/MarketingSection.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../components/components';
import Navbar from '../components/Navbar';

const MarketingSection = () => {
  const navigate = useNavigate();
  
  return (
    <>
      <Navbar />
      <header className="border-b border-gray-200 bg-white">
        <Container>
          <div className="h-16 flex items-center justify-between">
              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft size={18} className="mr-2" />
                <span className="font-medium">Back</span>
              </button>
          </div>
        </Container>
      </header>
      <div className='min-h-screen bg-white'>
        {/* Hero Section */}
        <div className="bg-white border-b border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              A Smarter Way to Buy and Sell Ad Spaces
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Yepper connects website owners and advertisers through an automated system that makes digital advertising simple, transparent, and efficient.
            </p>
          </div>
        </div>

        {/* The Problem */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">
              The Problem
            </h2>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Digital advertising is often complicated. Publishers struggle to manage ad spaces, while advertisers waste time searching for the right websites to promote their brands.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              The result? Lost opportunities on both sides.
            </p>
          </div>
        </div>

        {/* The Solution */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">The Solution</h2>
            <p className="text-base text-gray-700 mb-6 leading-relaxed">
              Yepper brings both sides together on one smart platform:
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="font-semibold text-black mb-2">For Web Owners:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Easily set up ad spaces, choose categories, and control what appears on your site, all from one dashboard.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-black mb-2">For Advertisers:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Browse available spaces, choose audiences that match your goals, and launch ads instantly, no middlemen needed.
                </p>
              </div>
            </div>
            
            <p className="text-base text-gray-700 leading-relaxed">
              Yepper handles the technical setup, tracking, and delivery automatically, so both sides can focus on what they do best.
            </p>
          </div>
        </div>

        {/* For Web Owners & Advertisers */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-black mb-4">For Web Owners</h3>
                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                  Turn your website into a smart ad platform. Add your ad spaces, set your categories, and Yepper automatically connects you with trusted advertisers who fit your content. You stay in control, we handle the rest.
                </p>
                <Link to='/add-website'>
                  <button className="text-black font-semibold hover:underline">
                    → Start as a Web Owner
                  </button>
                </Link>
              </div>

              <div className="bg-white border border-gray-200 p-8">
                <h3 className="text-2xl font-bold text-black mb-4">For Advertisers</h3>
                <p className="text-base text-gray-700 mb-6 leading-relaxed">
                  Reach real audiences on quality websites across East Africa. Pick your categories, upload your ad, and Yepper instantly matches it to the most relevant spaces, no calls, no waiting. Just simple, transparent reach.
                </p>
                <Link to='/advertise'>
                  <button className="text-black font-semibold hover:underline">
                    → Start as an Advertiser
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-8">How It Works</h2>

            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">Create Your Account</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Whether you're an advertiser or a publisher, start by signing up.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">Set Up Your Role</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Publishers define their ad spaces and categories. Advertisers choose where their ads should appear.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">Yepper Matches You Automatically</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    Our system connects suitable advertisers to the best ad spaces in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-black mb-2">Track and Manage Everything</h3>
                  <p className="text-base text-gray-700 leading-relaxed">
                    View live data and performance insights through a simple, transparent dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why People Choose Yepper */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-8">Why People Choose Yepper</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-black mb-2">Built for Both Sides:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  One platform that equally empowers publishers and advertisers.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">Simple Setup:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  No coding expertise or long setup process needed.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">Transparency First:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  See what's running, where it's running, and how it's performing always.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">Full Control:</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  Choose categories, audiences, and preferences to protect your brand.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Our Mission */}
        <div className="py-16 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">Our Mission</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Yepper's mission is to make online advertising fair, clear, and accessible. We connect creators, media owners, and advertisers through technology that respects both sides, turning complex ad operations into a simple, automated experience.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-black text-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Join the Future of Advertising?
            </h2>
            <p className="text-base text-gray-300 mb-8">
              Whether you own a website or promote a brand, Yepper gives you the tools to connect, collaborate, and grow all in one place.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MarketingSection;