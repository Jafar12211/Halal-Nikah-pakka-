import React, { useState } from 'react';
import { Share2, MessageCircle, Copy, Check, Users, Sparkles, ExternalLink, Heart } from 'lucide-react';
import { generateWhatsAppShareMessage, OFFICIAL_REGISTRATION_URL } from '../utils/matrimony';

interface ShareCampaignSectionProps {
  onOpenRegister: () => void;
}

export const ShareCampaignSection: React.FC<ShareCampaignSectionProps> = ({ onOpenRegister }) => {
  const [copied, setCopied] = useState(false);
  const [blessingCount, setBlessingCount] = useState(148);
  const [hasBlessed, setHasBlessed] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `Assalamu Alaikum! ❤️ Check out Nikah Pakka - genuine Muslim matrimony with family involvement & affordable matchmaking: ${OFFICIAL_REGISTRATION_URL}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const encoded = generateWhatsAppShareMessage();
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleBlessingClick = () => {
    if (!hasBlessed) {
      setBlessingCount((prev) => prev + 1);
      setHasBlessed(true);
    }
  };

  return (
    <section id="share-section" className="py-20 bg-emerald-950 text-white relative overflow-hidden">
      {/* Subtle Islamic geometric pattern backdrop */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fde047_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-300 mb-3">
            <Heart className="w-3.5 h-3.5 fill-amber-300" />
            <span>Community Sadqah Jariyah</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-white tracking-tight mb-4 text-balance">
            Our Small Request to You
          </h2>

          <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            "Whoever guides someone to goodness will have a reward like one who did it." (Sahih Muslim)
            <br />
            Your one share could help an unmarried brother, sister or cousin find their righteous life partner!
          </p>
        </div>

        {/* The 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 font-bold font-serif flex items-center justify-center text-lg mb-4">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Register Yourself</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                If you are searching for a righteous spouse with pure intentions, create your biodata in minutes without hidden paywalls.
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-semibold text-xs rounded-lg transition-colors text-center"
            >
              Start Free Registration
            </button>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 font-bold font-serif flex items-center justify-center text-lg mb-4">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Help a Relative Register</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                Assist your unmarried brother, sister, child, or cousin by registering on their behalf (with their consent) as a guardian or wali.
              </p>
            </div>
            <button
              onClick={onOpenRegister}
              className="w-full py-2.5 px-3 bg-white/20 hover:bg-white/30 text-white font-semibold text-xs rounded-lg transition-colors text-center border border-white/20"
            >
              Register for Family
            </button>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-emerald-950 font-bold font-serif flex items-center justify-center text-lg mb-4">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Share with 3 Families</h3>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
                Forward Nikah Pakka to at least 3 Muslim friends, family WhatsApp groups, or community circles who may benefit.
              </p>
            </div>
            <button
              onClick={handleWhatsAppShare}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              Forward on WhatsApp
            </button>
          </div>
        </div>

        {/* Share Action Box */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-4xl mx-auto shadow-xl text-stone-900 border border-stone-200">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center justify-center md:justify-start gap-1.5 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Direct Registration & Sharing Link
              </span>
              <p className="text-sm font-mono text-stone-600 truncate max-w-sm sm:max-w-md bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 mt-2">
                {OFFICIAL_REGISTRATION_URL}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors border border-stone-300"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>

              <button
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Share to WhatsApp</span>
              </button>

              <a
                href={OFFICIAL_REGISTRATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-semibold rounded-lg transition-colors"
              >
                <span>Direct Form Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Community pledge banner */}
          <div className="mt-6 pt-6 border-t border-stone-200 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-600">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-700" />
              <span><strong>{blessingCount} families</strong> have forwarded Nikah Pakka to their circles this week.</span>
            </div>

            <button
              onClick={handleBlessingClick}
              disabled={hasBlessed}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                hasBlessed
                  ? 'bg-emerald-100 text-emerald-800 cursor-default'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {hasBlessed ? '✓ You pledged to share! JazakAllah Khair' : '+ I will share with 3 families'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
