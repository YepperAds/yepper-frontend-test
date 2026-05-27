// PrivacyPolicy.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Container } from '../components/components';
import Navbar from '../components/Navbar';

const PrivacyPolicy = () => {
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

      <div className="min-h-screen bg-white">

        {/* Hero */}
        <div className="bg-white border-b border-gray-200 py-16">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-sm text-gray-500 mb-3">Effective Date: May 23, 2026</p>
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Master Service Agreement & Privacy Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl leading-relaxed">
              By accessing or using the Yepper platform, you agree to be bound by these Terms and our data handling practices. If you do not agree, please do not connect your accounts.
            </p>
          </div>
        </div>

        {/* Section 1 */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">1. The Yepper Service</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Yepper provides a marketplace and analytics dashboard that bridges the gap between digital Creators and Advertisers. We use proprietary "Deep Analysis" to rank accounts based on monetization potential and audience engagement.
            </p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-8">2. Account Authentication & Data Usage</h2>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-black mb-2">2.1 Google & Meta Integration</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  We use OAuth (Open Authorization) to connect to your social media accounts. Yepper never sees or stores your Facebook, Instagram, or Google passwords.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-4">2.2 Collected Data Points</h3>
                <p className="text-base text-gray-700 mb-4 leading-relaxed">
                  When you connect a channel, our Intelligence Engine retrieves:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="text-base text-gray-700 leading-relaxed">Subscribers/Followers & Total Public Views</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="text-base text-gray-700 leading-relaxed">Video/Post counts for engagement velocity calculation</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-2 h-2 bg-black rounded-full mt-2"></div>
                    <p className="text-base text-gray-700 leading-relaxed">Public Profile Metadata (Avatar and Username)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-8">3. Ye-AI Intelligence Engine Governance</h2>
            <p className="text-base text-gray-700 mb-8 leading-relaxed">
              Our AI ranking system (Monetization Ranks) is a predictive tool.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-black mb-2">Rankings</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  You acknowledge that rankings (e.g., "Rising Star," "Jackpot") are based on system-wide benchmarks and can change as our AI learns from new data.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">Predictions</h3>
                <p className="text-base text-gray-700 leading-relaxed">
                  "Estimated Reach" and "Predicted Likes" are statistical forecasts based on historical performance. They are not guaranteed results for any specific campaign.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">4. User Data Deletion & Revocation</h2>
            <p className="text-base text-gray-700 mb-8 leading-relaxed">
              Users retain 100% ownership of their data. In compliance with Meta/Facebook Data Deletion and Google Privacy standards, you may remove your data through the following methods:
            </p>

            <div className="space-y-8">
              <div>
                <h3 className="font-semibold text-black mb-4">4.1 Automated In-App Deletion</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">1</div>
                    <div className="flex-1 pt-1">
                      <p className="text-base text-gray-700 leading-relaxed">Navigate to the "Connect Accounts" dashboard.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">2</div>
                    <div className="flex-1 pt-1">
                      <p className="text-base text-gray-700 leading-relaxed">Select the connected platform and click "Disconnect".</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-semibold text-sm">3</div>
                    <div className="flex-1 pt-1">
                      <p className="text-base text-gray-700 leading-relaxed">
                        Type the required command <code className="bg-gray-100 px-2 py-0.5 text-sm font-mono border border-gray-200">disconnect</code> to execute a purge.
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                  This immediately deletes all stored OAuth tokens, cached follower counts, and AI-generated insights for that specific account from our database.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-black mb-2">4.2 Account Erasure Request</h3>
                <p className="text-base text-gray-700 mb-4 leading-relaxed">
                  For a full purge of your Yepper profile (Email, Name, and Platform access), submit a request to <a href="mailto:support@yepper.cc" className="text-black underline">support@yepper.cc</a>. All personal records will be permanently erased from our production servers within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5 */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-8">5. Prohibited Conduct</h2>
            <div className="space-y-4">
              <div>
                <p className="text-base text-gray-700 leading-relaxed">You may not use the Platform to showcase fraudulent or "botted" engagement.</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-base text-gray-700 leading-relaxed">You may not attempt to reverse-engineer our AI scoring algorithms.</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <p className="text-base text-gray-700 leading-relaxed">Misrepresentation of your identity or channel ownership will result in a permanent ban.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6 */}
        <div className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold text-black mb-4">6. Limitation of Liability</h2>
            <p className="text-base text-gray-700 leading-relaxed">
              Yepper is provided "as is." While we strive for 100% accuracy in our Deep Analysis, we are not liable for any discrepancies between our predictions and a creator's actual performance on a specific ad campaign.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="py-16 bg-black text-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4">Questions regarding these terms?</h2>
            <p className="text-base text-gray-300 leading-relaxed">
              Contact us at{' '}
              <a href="mailto:legal@yepper.cc" className="text-white underline">legal@yepper.cc</a>
              {' '}or{' '}
              <a href="mailto:support@yepper.cc" className="text-white underline">support@yepper.cc</a>
            </p>
          </div>
        </div>

      </div>
    </>
  );
};

export default PrivacyPolicy;