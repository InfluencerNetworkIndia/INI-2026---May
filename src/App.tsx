import { motion } from 'motion/react';
import { Linkedin, Instagram } from 'lucide-react';
import { caseStudies } from './data/caseStudies';
import CaseStudyComponent from './components/CaseStudy';
import { FeatureCard, ServiceItem } from './components/UI';

export default function App() {
  return (
    <div className="bg-espresso text-cream min-h-screen selection:bg-gold selection:text-espresso">
      {/* Header */}
      <nav className="fixed top-0 left-0 right-0 z-[500] px-8 md:px-16 py-6 flex items-center justify-between bg-espresso/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 border-[1.5px] border-gold flex items-center justify-center font-serif text-lg font-bold text-gold tracking-tighter">
            INI
          </div>
          <div className="text-[10px] font-medium tracking-[3px] uppercase text-cream/80">
            Influencer Network India
          </div>
        </div>
        <div className="hidden md:flex items-center gap-10">
          {['Services', 'Work', 'About', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`}
              className="text-[10px] text-warm-gray hover:text-gold transition-colors tracking-[3px] uppercase"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative flex flex-col justify-center px-8 md:px-20 py-40 overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[55%] h-full bg-radial-[ellipse_at_80%_30%] from-gold/10 to-transparent" />
        <div 
          className="absolute top-0 right-0 w-[55%] h-full opacity-5 pointer-events-none"
          style={{ 
            backgroundImage: 'linear-gradient(rgba(232,160,48,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(232,160,48,0.4) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />
        <div className="absolute right-20 bottom-16 font-serif text-[clamp(100px,15vw,180px)] font-bold text-gold/5 leading-none tracking-[-8px] pointer-events-none">
          2026
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10"
        >
          <div className="mb-12">
            <h1 className="display-title font-light">We Don't</h1>
            <h1 className="display-title font-bold text-gold">Sell Influence.</h1>
            <h1 className="display-title font-light">We Build</h1>
            <h1 className="display-title font-light italic">Belief.</h1>
          </div>

          <p className="max-w-lg text-base text-cream/75 font-light leading-relaxed mb-16">
            Influencer Network India is India's foremost founder-led creator economy agency. We turn cultural moments into brand equity — for brands that want to matter, not just be seen.
          </p>

          <div className="grid grid-cols-2 md:flex gap-10 md:gap-16 pt-10 border-t border-gold/15 max-w-4xl">
            {[
              { num: '500+', label: 'Campaigns Executed' },
              { num: '100+', label: 'Brands Served' },
              { num: '5+', label: 'Years of Expertise' },
              { num: '10+', label: 'Campaign Verticals' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="font-serif text-4xl font-bold text-gold leading-none">{stat.num}</div>
                <div className="text-[10px] tracking-[2px] uppercase text-warm-gray mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Who We Are Section */}
      <section className="bg-dark min-h-screen py-32 px-8 md:px-20 relative overflow-hidden flex items-center">
        <div className="absolute -left-24 top-1/2 -translate-y-1/2 font-serif text-[clamp(200px,25vw,320px)] font-bold text-gold/[0.02] leading-none tracking-[-16px] pointer-events-none">
          INI
        </div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="eyebrow">Who We Are</div>
            <h2 className="display-md mb-8">
              An agency that thinks<br />before it <span className="text-gold italic">acts.</span>
            </h2>
            <div className="space-y-6">
              <p className="body-text">
                Influencer Network India is an independent, founder-led influencer marketing agency — built to do one thing better than anyone else: create campaigns that move culture, not just metrics.
              </p>
              <p className="body-text">
                Founded in 2020, we have spent five years quietly building the most comprehensive creator intelligence network in India — spanning nano to celebrity, Instagram to LinkedIn, local to national, FMCG to government.
              </p>
              <p className="body-text">
                We are not a marketplace. We are not a tech platform. We are strategic thinkers who happen to have an extraordinary creator ecosystem and the execution muscle to back every idea up.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="eyebrow">What We Believe</div>
            {[
              { id: '01', title: 'Authenticity Over Reach', content: 'A 50K creator who genuinely believes in your brand will always outperform a 5M celebrity who reads a script. We choose alignment, not audience size.' },
              { id: '02', title: 'Culture Before Content', content: "Great campaigns don't interrupt culture. They become part of it. We study what India is thinking, feeling, and sharing — then build campaigns inside that conversation." },
              { id: '03', title: 'Strategy Before Execution', content: 'We spend as much time on the thinking as the doing. Insight-driven campaigns consistently outperform brief-driven campaigns. This is not negotiable for us.' },
              { id: '04', title: 'Founder Involvement, Always', content: 'Every campaign that leaves INI has been thought through at the founding level. Clients get a strategic partner — not a campaign executor.' },
            ].map((belief) => (
              <div key={belief.id} className="pl-8 border-l-2 border-gold flex flex-col gap-2">
                <div className="text-[10px] tracking-[3px] text-gold uppercase">{belief.id}</div>
                <h3 className="font-serif text-2xl font-semibold text-white">{belief.title}</h3>
                <p className="text-[13px] leading-relaxed text-cream/70 font-light">{belief.content}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Origin Story Section */}
      <section className="bg-cream min-h-screen py-32 px-8 md:px-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="eyebrow text-amber before:bg-amber">The INI Story</div>
            <h2 className="display-md text-espresso mb-8">
              Built from<br />conviction,<br /><span className="text-amber italic">not capital.</span>
            </h2>
            <div className="space-y-6 text-espresso/70">
              <p className="body-text text-espresso/70">
                Influencer Network India was not born from a business plan. It was born from a frustration — watching brands spend enormous budgets on influence campaigns that lacked any strategic thinking, cultural awareness, or real creator relationships.
              </p>
              <p className="body-text text-espresso/70">
                Agnesh Khamitkar — after 15+ years navigating the digital marketing world from Account Manager to Business Head — decided to build the agency he always wished existed. One where founders stayed involved. Where campaigns began with insight, not media lists.
              </p>
              <p className="body-text text-espresso/70">
                Five years later, INI has executed 500+ campaigns across 100+ brands — from Parle-G to Coca-Cola, from the Government of India to D2C startups. The agency Agnesh imagined now exists. And it is just getting started.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
             <div className="eyebrow text-amber before:bg-amber">The Journey</div>
             <div className="relative pl-8 space-y-12 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-amber before:to-amber/10">
                {[
                  { year: '2020 — FOUNDING YEAR', text: 'Influencer Network India founded by Agnesh Khamitkar with a singular vision: founder-led, strategy-first influencer marketing.' },
                  { year: '2021 — CATEGORY EXPANSION', text: 'First government mandate — Azadi Ka Amrit Mahotsav with the Ministry of Culture. Proved INI could operate at national scale.' },
                  { year: '2022 — TWITTER TRENDING EXPERTISE', text: '#PMMementosAuction trending campaign: 159M impressions. INI establishes itself as India\'s leading Twitter trending agency.' },
                  { year: '2023 — NATIONAL BRANDS', text: 'G20 India Campaign (700+ influencers), Parle Snackers League, KrackJack Diwali. Major FMCG brands join core portfolio.' },
                  { year: '2024 — DEEP RETAINERS', text: 'Godrej Secure becomes flagship retainer client. Multi-format capability across stores, festive, and in-flight proven.' },
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[36.5px] top-1.5 w-2 h-2 rounded-full bg-amber border-2 border-cream ring-4 ring-amber/20" />
                    <div className="text-[10px] font-bold tracking-[3px] text-amber mb-2 uppercase">{item.year}</div>
                    <p className="text-[15px] leading-relaxed text-espresso/75 font-light">{item.text}</p>
                  </div>
                ))}
             </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-dark2 py-32 px-8 md:px-20 overflow-hidden">
        <div className="max-w-7xl mx-auto w-full">
          <div className="eyebrow">What We Do</div>
          <h2 className="display-md mb-4">
            Everything a brand needs<br />to build <span className="text-gold italic">real influence.</span>
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-16 bg-gold/10">
            {[
              { num: '01', title: 'Influencer Outreach', desc: 'End-to-end creator identification, briefing, content review, and campaign management.' },
              { num: '02', title: 'Twitter / X Trending', desc: 'India\'s most reliable Twitter trending service. Coordinated influencer activation for velocity.' },
              { num: '03', title: 'Meme & Community', desc: 'Strategic content seeding through mass-followed meme and niche community accounts.' },
              { num: '04', title: 'Moment Marketing', desc: 'Reactive cultural campaigns built within 24–48 hours of a viral event.' },
              { num: '05', title: 'LinkedIn Influence', desc: 'Professional platform seeding via LinkedIn creators for B2B and decision-maker targeting.' },
              { num: '06', title: 'Celebrity Outreach', desc: 'Brand partnerships with macro creators and Bollywood talent. Negotiation and oversight.' },
              { num: '07', title: 'UGC & Contests', desc: 'Community-driven participation campaigns that turn audiences into advocates.' },
              { num: '08', title: 'Event Amplification', desc: 'Influencer activation for store launches and live events across multiple cities.' },
              { num: '09', title: 'Content Production', desc: 'Digital-first video production, product shoots, and high-performance Reels.' },
            ].map((s, i) => (
              <ServiceItem key={i} number={s.num} title={s.title} description={s.desc} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Advantage Section */}
      <section className="bg-espresso py-32 px-8 md:px-20 relative overflow-hidden">
        <div className="absolute right-[-40px] bottom-[-40px] font-serif text-[280px] font-bold text-gold/[0.03] leading-none pointer-events-none">
          USP
        </div>
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="eyebrow">Why INI</div>
          <h2 className="display-md mb-4">
            Seven things that make<br />us <span className="text-gold italic">genuinely different.</span>
          </h2>
          <p className="body-text mb-16">These are not marketing claims. These are operational realities built over 500+ campaigns across 5 years.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-6">
              <FeatureCard icon="🧠" title="Founder-Led Strategy" description="Agnesh Khamitkar personally oversees every brief. You are not handed to an account executive. Your partner is the person who built the agency." index={0} />
              <FeatureCard icon="⚡" title="Moment Intelligence" description="When a protest video went viral showing a Godrej locker's durability, we had a zero-spend campaign live in 48 hours for 6.2M views." index={1} />
              <FeatureCard icon="🌐" title="Cross-Platform Fluency" description="Instagram, X, LinkedIn, Facebook, YouTube — we operate natives on every platform, while others just focus on one." index={2} />
              <FeatureCard icon="🗺️" title="Pan-India Execution" description="Store visit campaigns across 10+ cities from Raipur to Kochi. We have on-ground relationships in Tier 1, 2, and 3 cities." index={3} />
            </div>
            <div className="space-y-6">
              <FeatureCard icon="📰" title="Hybrid Distribution" description="The unique model of combining traditional creators with regional reporters and journalists for high-trust regional OTT reach." index={4} />
              <FeatureCard icon="🏛️" title="Government-Grade Trust" description="Trusted by the Ministry of Culture and G20 India. The highest bar for compliance and brand safety in the industry." index={5} />
              <FeatureCard icon="📐" title="End-to-End Ownership" description="Strategy → Selection → Content → Measurement. We manage every step internally with no outsourcing of thinking." index={6} />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-gold p-10 rounded text-espresso"
              >
                <div className="font-serif text-[11px] tracking-[3px] uppercase opacity-60 mb-4">The INI Difference</div>
                <div className="font-serif text-[28px] italic leading-[1.4] mb-6">
                  "Most agencies sell you a creator list. We sell you a cultural strategy. The creators are just the delivery mechanism."
                </div>
                <div className="text-[11px] tracking-[2px] uppercase opacity-50">— Agnesh Khamitkar, Founder</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="min-h-[70vh] flex items-center justify-center bg-espresso px-8 md:px-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-[circle_at_center] from-gold/5 to-transparent pointer-events-none" />
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 1.5 }}
           className="max-w-4xl relative z-10"
        >
          <div className="eyebrow justify-center after:h-[1px] after:w-8 after:bg-gold after:opacity-60">The INI Philosophy</div>
          <blockquote className="font-serif text-[clamp(32px,5vw,72px)] font-light italic text-white leading-[1.25] mb-12">
            "In a world obsessed with reach,<br />we obsess over <span className="text-gold not-italic">resonance.</span><br />In a world chasing virality,<br />we chase <span className="text-gold not-italic">trust.</span><br />Because trust <span className="text-gold not-italic">compounds.</span><br />Virality doesn't."
          </blockquote>
          <div className="text-[11px] tracking-[4px] uppercase text-warm-gray">Influencer Network India — Core Belief</div>
        </motion.div>
      </section>

      {/* Case Studies */}
      {caseStudies.map((study) => (
        <CaseStudyComponent key={study.id} study={study} />
      ))}

      {/* Metrics Section */}
      <section className="bg-dark2 py-32 px-8 md:px-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="eyebrow">Impact at Scale</div>
          <h2 className="display-md mb-16">
            Numbers that speak<br />for <span className="text-gold italic">themselves.</span>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-gold/5">
            {[
              { val: '500+', label: 'Campaigns Executed' },
              { val: '100+', label: 'Brands Served' },
              { val: '159M+', label: 'Impressions Single Campaign' },
              { val: '49M', label: 'Reach Twitter Campaign' },
              { val: '8.6M', label: 'Views KrackJack Diwali' },
              { val: '11.3M', label: 'Views American Tourister' },
              { val: '10+', label: 'Cities Store Visit Network' },
              { val: '700+', label: 'Influencers Multi-Activation' },
            ].map((m, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-dark2 p-12 text-center hover:bg-dark3 transition-colors group"
              >
                <div className="font-serif text-[clamp(40px,5vw,72px)] font-bold text-gold leading-none mb-3 group-hover:scale-110 transition-transform duration-500">
                  {m.val}
                </div>
                <div className="text-[11px] tracking-[2px] uppercase text-warm-gray leading-tight">
                  {m.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="bg-dark py-32 px-8 md:px-20">
        <div className="max-w-7xl mx-auto w-full">
          <div className="eyebrow">Trusted By</div>
          <h2 className="display-md mb-16">
            Brands that chose<br /><span className="text-gold italic">strategy over size.</span>
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-[2px] bg-gold/5">
            {[
              "Godrej Secure", "Parle-G", "KrackJack", "Coca-Cola", "Capri Loans", "American Tourister",
              "BMW Motorrad", "Havmor Ice Cream", "Flair Pens", "Godrej Properties", "Parcos", "Max Protein",
              "Mad Over Donuts", "Stage OTT", "L&T Electrical", "Sugarfree Green", "Emami", "Utkarsh India",
              "Cello", "Walkway Shoes", "Blue Buddha", "Ministry of Culture, GoI", "G20 India", "+ Many More"
            ].map((brand, i) => (
              <div key={i} className="bg-dark p-8 flex items-center justify-center text-center hover:bg-dark2 transition-colors">
                <div className="text-[11px] font-semibold tracking-[2px] uppercase text-warm-gray hover:text-gold transition-colors">
                  {brand}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="bg-cream py-32 px-8 md:px-20 relative">
        <div className="max-w-7xl mx-auto w-full">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 lg:gap-32 items-start">
            <div>
              <div className="eyebrow text-amber before:bg-amber">The Founder</div>
              <div className="aspect-[3/4] bg-stone-100 border border-amber/20 relative overflow-hidden group">
                 <img 
                   src="/agnesh.png" 
                   alt="Agnesh Khamitkar" 
                   className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"
                 />
                 <div className="absolute top-5 left-5 w-10 h-10 border-t-2 border-l-2 border-amber" />
                 <div className="absolute bottom-5 right-5 w-10 h-10 border-b-2 border-r-2 border-amber" />
                 <div className="absolute bottom-6 left-6 text-[10px] tracking-[2px] uppercase text-amber font-semibold bg-cream/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                   Agnesh Khamitkar
                 </div>
              </div>
            </div>

            <div>
              <div className="inline-block bg-amber text-white text-[10px] font-bold tracking-[3px] uppercase px-4 py-2 mb-6">
                India's Creator Economy Strategist
              </div>
              <h2 className="font-serif text-[clamp(28px,3.5vw,48px)] font-normal leading-tight text-espresso mb-8">
                The founder who still<br />thinks about every<br /><span className="text-amber italic">campaign himself.</span>
              </h2>
              <div className="space-y-6 text-espresso/70 mb-10">
                <p className="text-[15px] leading-relaxed">
                  Agnesh Khamitkar brings 15+ years of digital expertise to every campaign he touches. His career spans leadership roles at firms like Digital Refresh Network.
                </p>
                <p className="text-[15px] leading-relaxed">
                  In 2020, he founded INI to build a precise agency where the thinking was never outsourced and creators were partners, not vendors.
                </p>
                <div className="font-serif text-[28px] italic leading-[1.4] text-espresso border-l-4 border-amber pl-8 my-10">
                  "I help brands earn trust at cultural speed. The creator is the vehicle. The culture is the fuel. Strategy is the engine."
                </div>
              </div>
              
              <div className="eyebrow text-amber before:bg-amber mb-4">Personality Pillars</div>
              <div className="flex flex-wrap gap-3">
                {["Strategic Thinker", "Cultural Intelligence", "Founder-Led", "Creator Expert", "Capital Built", "Honest & Direct"].map(p => (
                  <span key={p} className="px-4 py-2 border border-burnt/25 bg-burnt/5 text-[12px] text-sienna font-medium hover:bg-amber hover:text-white transition-all cursor-default">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer / Closing Section */}
      <section id="contact" className="min-h-screen flex items-center justify-center bg-gold text-center relative overflow-hidden px-8">
        <div className="absolute inset-0 bg-radial-[circle_at_20%_50%] from-burnt/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-radial-[circle_at_80%_50%] from-espresso/20 to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="eyebrow justify-center opacity-50 text-espresso before:bg-espresso italic">Ready to make an impact?</div>
          <h2 className="display-title text-espresso mb-8">
            Let's build <span className="font-bold italic">together.</span>
          </h2>
          <p className="text-espresso/65 text-base font-light leading-relaxed mb-12">
             Every great brand journey begins with a conversation. We'd love to understand your brand and the cultural moment you want to own.
          </p>
          
          <div className="pt-10 border-t border-espresso/15 grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-espresso/45 mb-1">Email</div>
              <a href="mailto:agnesh@influencernetworkindia.in" className="text-sm font-medium text-espresso hover:underline underline-offset-4">agnesh@influencernetworkindia.in</a>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-espresso/45 mb-1">Phone</div>
              <a href="tel:+918446456879" className="text-sm font-medium text-espresso hover:underline underline-offset-4">+91 8446456879</a>
            </div>
            <div>
              <div className="text-[9px] font-bold tracking-[3px] uppercase text-espresso/45 mb-1">Office</div>
              <div className="text-sm font-medium text-espresso line-clamp-1">Mumbai, India</div>
            </div>
          </div>

          <div className="flex justify-center gap-8 mb-16">
            <a 
              href="https://www.linkedin.com/company/influencer-network-india/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border border-espresso/20 flex items-center justify-center group-hover:bg-espresso group-hover:text-gold transition-all duration-300">
                <Linkedin size={20} />
              </div>
              <span className="text-[10px] font-bold tracking-[2px] uppercase text-espresso/40">LinkedIn</span>
            </a>
            <a 
              href="https://www.instagram.com/influencer_network_india/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-2"
            >
              <div className="w-12 h-12 rounded-full border border-espresso/20 flex items-center justify-center group-hover:bg-espresso group-hover:text-gold transition-all duration-300">
                <Instagram size={20} />
              </div>
              <span className="text-[10px] font-bold tracking-[2px] uppercase text-espresso/40">Instagram</span>
            </a>
          </div>
          
          <div className="text-[10px] tracking-[4px] uppercase text-espresso/30">
            © 2026 Influencer Network India · All Rights Reserved
          </div>
        </div>
      </section>
    </div>
  );
}
