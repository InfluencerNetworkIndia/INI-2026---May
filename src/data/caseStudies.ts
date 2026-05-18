import { LucideIcon } from 'lucide-react';

export interface CaseStudy {
  id: string;
  brand: string;
  title: string;
  type: 'odd' | 'even' | 'cream';
  subtitle: string;
  innovation?: {
    label: string;
    content: string;
  };
  approach?: string;
  strategy?: {
    label: string;
    content: string;
  };
  metrics: {
    label: string;
    value: string;
  }[];
  tags: string[];
  insight?: {
    label: string;
    text: string;
  };
  conclusion?: string;
  details?: string;
}

export const caseStudies: CaseStudy[] = [
  {
    id: "01",
    brand: "Godrej Secure — Akshaya Tritiya 2026",
    title: "India's First Integrated LinkedIn + Instagram Festive Campaign for a Security Brand",
    type: 'odd',
    subtitle: "The Innovation",
    innovation: {
      label: "The Innovation",
      content: "Akshaya Tritiya is traditionally a gold-buying occasion. INI identified that the LinkedIn audience — urban professionals, business owners, salaried individuals — are significant gold buyers who think about wealth protection differently from the general public. A LinkedIn campaign for a security brand was our hypothesis."
    },
    details: "LinkedIn (4 creators): Professional-tonality posts around wealth protection and smart festive planning. Creators: Vidhi Toshniwal (1.29L followers), Aaina Chopra (1.37L), Mohit Sardana (74K), Vinita Dalal (89K). Instagram (3 creators): Visual, warm, occasion-driven content for festive audiences.",
    metrics: [
      { label: "LinkedIn Impressions", value: "2.65L" },
      { label: "LinkedIn Reach", value: "1.96L" },
      { label: "Instagram Views", value: "79.7K" }
    ],
    tags: ["LinkedIn Innovation", "Dual Platform", "Festive Strategy", "B2C + Professional Audience"],
    conclusion: "This campaign proved that LinkedIn is not just for B2B brands. Consumer brands that target urban, affluent, decision-making audiences can — and should — be activating on LinkedIn. INI is the only agency in India doing this systematically for FMCG and consumer durable brands."
  },
  {
    id: "02",
    brand: "Capri Loans — #TarakkiKeHaath",
    title: "Making an NBFC Feel Like a National Movement — Featuring Pankaj Tripathi",
    type: 'even',
    subtitle: "The Challenge",
    approach: "Financial services brands rarely earn emotional connection. Most NBFC campaigns talk about interest rates and loan features. #TarakkiKeHaath set out to build something completely different: a campaign about the people money empowers, not the money itself.",
    details: "Layer 1 — Celebrity Anchor: Pankaj Tripathi as the voice of real India's ambitions. Layer 2 — Meme Marketing: 35+ memes seeding the brand film. Layer 3 — Regional Storytelling: 30 city-specific pages producing hyperlocal documentary reels of skilled workers.",
    insight: {
      label: "Brand Truth",
      text: "The best financial brand campaigns don't talk about money. They talk about the people money gives a chance."
    },
    metrics: [
      { label: "Meme Views", value: "1.76M" },
      { label: "Regional Reach", value: "1.36M" },
      { label: "Total Engagements", value: "44K+" },
      { label: "City Pages", value: "30" }
    ],
    tags: ["Celebrity Integration", "Meme Marketing", "Regional Storytelling", "NBFC Category", "3-Layer Strategy"],
    conclusion: "The combination of Pankaj Tripathi's cultural credibility with grassroots regional storytelling created a campaign that felt national in ambition and local in truth — the hardest combination to execute and the most powerful when done right."
  },
  {
    id: "03",
    brand: "Godrej Secure — Republic Day 2026",
    title: "10 Creators. 2.1M+ Views. Making a Security Brand Feel Aspirational on Republic Day.",
    type: 'cream',
    subtitle: "Campaign Context",
    approach: "Republic Day 2026 — Godrej Secure launches a limited-period offer on its NX Pro Luxe, NX Advance, and Matrix ranges. The challenge: make a product promotion feel culturally meaningful on a national occasion, not transactional.",
    details: "10 creators across home, lifestyle, and travel niches — carefully selected for audience overlap with security-conscious, aspirational homeowners. Each creator positioned the Godrej Secure product as an investment in protecting what they've worked for.",
    insight: {
      label: "Top Performers",
      text: "Siddhi @thedreamctchr: 4.91L views, 15K likes, 5K shares. Shubham @thefoodie_explorer: 3.22L views. Anchal Agarwal @hom_epreneur: 3.13L views."
    },
    metrics: [
      { label: "Total Views", value: "2.1M+" },
      { label: "Total Likes", value: "49.5K" },
      { label: "Comments", value: "841" },
      { label: "Shares", value: "15.6K" }
    ],
    tags: ["National Occasion", "Product Promotion", "Home Security", "10 Creator Ensemble"],
    conclusion: "Godrej Secure is INI's flagship long-term retainer client — spanning festive campaigns (Dhanteras, Raksha Bandhan, Akshaya Tritiya), national occasions (Republic Day), viral moment marketing (Nepal), in-flight activations (Air India Express), store visit campaigns across 10+ cities, and LinkedIn + Instagram integrated campaigns."
  },
  {
    id: "04",
    brand: "Stage OTT — Bhairavi (Rajasthani)",
    title: "The Creator–Journalist Hybrid: A New Distribution Model for Regional OTT",
    type: 'odd',
    subtitle: "The Innovation",
    innovation: {
      label: "The Innovation",
      content: "Most OTT campaigns rely entirely on entertainment creators. INI developed a proprietary hybrid model for Stage's Rajasthani content: combining traditional Instagram/YouTube creators with local reporters and journalists who had deep credibility with the exact Rajasthani-speaking audience the platform needed to reach."
    },
    strategy: {
      label: "The Logic",
      content: "For regional-language content, credibility is as important as reach. A reporter with 53K followers who covers Rajasthan daily will drive higher intent-to-subscribe than an entertainment creator with 500K followers who has never addressed that audience's cultural identity before."
    },
    insight: {
      label: "Format Innovation",
      text: "Creators bring reach. Journalists bring credibility. For regional OTT — you need both. This model is INI's original architecture."
    },
    metrics: [
      { label: "Total Views", value: "6,06,746" },
      { label: "Total Interactions", value: "14,951" },
      { label: "Total Likes", value: "14,642" }
    ],
    tags: ["Regional OTT", "Journalist + Creator Mix", "Rajasthani Vernacular", "Multi-Platform"],
    details: "Top Creators: Rishabh Raj (103K views), Ranveer Singh (73.3K views). Top Journalists: Soniya Sharma (92.1K views, 8K interactions), Ramesh K (48.5K views), Niranjan (47.4K views)."
  },
  {
    id: "05",
    brand: "Parle-G — #CelebratingLohri",
    title: "Making Parle-G Trend on Twitter AND Seed LinkedIn — A Two-Platform Lohri First",
    type: 'even',
    subtitle: "The Dual Strategy",
    approach: "Most Lohri campaigns target mass social. INI identified two simultaneous opportunities: a Twitter trending campaign for broad cultural reach, and a LinkedIn seeding campaign targeting marketing, finance, and business professionals — an underserved Parle-G audience with high brand affinity.",
    details: "8 LinkedIn professionals across advertising, marketing, finance, banking, and entrepreneurship seeded the Lohri brand film. Deeply unusual for an FMCG brand — but successful as it brought Parle-G into professional conversations during a universal festival.",
    insight: {
      label: "Platform Insight",
      text: "Parle-G is India's most democratic brand. Every Indian has a memory with it — the IT professional, the banker, the entrepreneur. LinkedIn gave us access to that audience for the first time."
    },
    metrics: [
      { label: "Twitter Reach", value: "22.2M" },
      { label: "#1 Trend", value: "1+ Hour" },
      { label: "LinkedIn Reach", value: "1,20,126" },
      { label: "LinkedIn Impressions", value: "1,66,657" }
    ],
    tags: ["Dual Platform", "Twitter + LinkedIn", "Festival Campaign", "FMCG Innovation"]
  },
  {
    id: "06",
    brand: "Godrej Secure — Dhanteras 2025",
    title: "Six Metro Cities. One Festive Insight. 4.6M Story Views.",
    type: 'cream',
    subtitle: "The Insight",
    approach: "During Dhanteras, Indians obsess over buying gold. But rarely do they think about where to keep it safely. The anxiety of storage is real — and entirely unaddressed in most gold-season marketing.",
    details: "Six entertainment creators across six metros — Mumbai, Kolkata, Delhi, Chennai, Bangalore, and Hyderabad — each depicting familiar festive chaos, with Godrej Secure as the calm, smart resolution. Instagram Stories-first strategy.",
    insight: {
      label: "Festive Marketing Truth",
      text: "Everyone talks about buying gold during Dhanteras. We talked about protecting it. That's the gap most brands never look for."
    },
    metrics: [
      { label: "Story Views", value: "4.6M+" },
      { label: "Story Reach", value: "163K+" },
      { label: "Story Link Clicks", value: "1,213" },
      { label: "Cities", value: "6" }
    ],
    tags: ["Multi-City Execution", "Festive Campaign", "Stories Format", "Hyperlocal Casting"]
  },
  {
    id: "07",
    brand: "Parle KrackJack — #KrackJackWaaliDiwali",
    title: "8 Creators. 8 Relatable Diwali Moments. 8.6 Million Views.",
    type: 'odd',
    subtitle: "Campaign Concept",
    approach: "KrackJack's sweet-and-salty identity was the perfect metaphor for Diwali — a festival of joy and drama in equal measure. 8 creators portrayed relatable Diwali moments where sweet-salty flavour was the emotional punctuation.",
    details: "Diverse casting across age groups, geographies, and content styles. No celebrity dependency. Pure creator authenticity at scale.",
    insight: {
      label: "The Creative Brief",
      text: "Diwali has sweet moments and salty moments. So does KrackJack. Celebrate all of them — without judgment, without filters, with a lot of fun."
    },
    metrics: [
      { label: "Total Views", value: "8.6M" },
      { label: "Total Reach", value: "7.9M" },
      { label: "Interactions", value: "64.5K" },
      { label: "Creators", value: "8" }
    ],
    tags: ["Festive Campaign", "FMCG – Snacks", "Ensemble Creator Cast", "Relatability-First"],
    conclusion: "The key was the creative insight, not the creator size. By anchoring each reel in a deeply relatable Diwali situation, the content earned genuine shares from people tagging their own relatives."
  },
  {
    id: "08",
    brand: "American Tourister — Back to School 2024",
    title: "9 Mom Influencers. 9 Unique Concepts. 11.3 Million Views.",
    type: 'even',
    subtitle: "The Approach",
    approach: "Instead of a uniform brief, each mom influencer had creative freedom to develop her own unique concept around the collection. Result: 9 distinctly different pieces of authentic content catering to the full breadth of the mom creator audience.",
    details: "Concepts: What's In My Kid's Bag?, Who's More Likely To?, Vibe Match, Millennial Moms vs. Gen Z Kids.",
    insight: {
      label: "Format Innovation",
      text: "Nine concepts, nine reels, nine stories. No repetition. Maximum variety. The audience saw 9 different reasons to want the same product."
    },
    metrics: [
      { label: "Total Reel Views", value: "11.3M+" },
      { label: "Total Reach", value: "4.83M+" },
      { label: "Interactions", value: "41.8K+" },
      { label: "Mom Creators", value: "9" }
    ],
    tags: ["Mom Creator Niche", "Multi-Concept Briefing", "Lifestyle – Bags", "Creative Freedom"],
    conclusion: "When you trust creators to find their own angle, engagement goes up because authenticity is not scriptable. The agency's job is selecting the right creator and setting the right guardrails."
  },
  {
    id: "09",
    brand: "Parle-G — #ForAllThatsReal",
    title: "The Anti-AI Campaign That Generated 16,500+ Shares",
    type: 'cream',
    subtitle: "The Cultural Tension",
    approach: "As AI content flooded social media, audiences grew tired of manufactured moments. Parle-G owned the opposite position — the champion of everything real.",
    details: "Two creators (Richa Gautam & Linda Fernandes) chosen for raw authenticity. Brief: shoot yourself. No lighting rigs. No perfection. Just a real moment with Parle-G.",
    insight: {
      label: "Campaign Truth",
      text: "Shares and saves are the highest-trust signals in social media. This campaign earned them in thousands — organically."
    },
    metrics: [
      { label: "Total Views", value: "1.44M" },
      { label: "Shares", value: "16.5K+" },
      { label: "Saves", value: "4K+" },
      { label: "UGC Entries", value: "500+" }
    ],
    tags: ["Anti-AI Narrative", "UGC Campaign", "Authentic Storytelling", "High-Share Content"]
  },
  {
    id: "10",
    brand: "Government of India — G20 India 2023",
    title: "700+ Influencers. 18M+ Impressions. India's Biggest Hashtag Trending Campaign.",
    type: 'odd',
    subtitle: "The Scale Challenge",
    approach: "Coordinated 700+ influencers across Twitter and Instagram simultaneously. Largest single activation in INI history. Zero errors, complete brand safety, and message discipline across hundreds of independent voices.",
    details: "Structured tiers: verified accounts as anchors, macro creators as amplifiers, broad base for volume. Staggered posting windows for trending velocity.",
    insight: {
      label: "Government Campaign Truth",
      text: "Government campaigns taught us the highest standard in our industry: zero errors, national scale, maximum brand safety, and absolute message discipline."
    },
    metrics: [
      { label: "Influencers Activated", value: "700+" },
      { label: "Total Tweets", value: "8,323+" },
      { label: "Twitter Impressions", value: "18.12M" },
      { label: "Trending Duration", value: "6 Hrs+" }
    ],
    tags: ["Government Mandate", "Mass Mobilisation", "Twitter + Instagram", "National Scale", "Brand Safety Critical"]
  },
  {
    id: "11",
    brand: "Godrej Secure — Multi-City Store Visit Programme",
    title: "Building Hyperlocal Awareness Across 10+ Cities — India's Most Consistent Store Visit Campaign",
    type: 'even',
    subtitle: "The Programme",
    approach: "Scalable influencer framework for driving retail footfall in new cities. Run across 10+ markets including Raipur, Siliguri, Guwahati, Kochi, Mumbai, Delhi, and more.",
    details: "In Tier 2 and Tier 3 cities, local creator credibility is exponentially higher than national creator reach. A local voice drives more store footfall than a distant celebrity.",
    insight: {
      label: "Programme Design",
      text: "The store visit programme works because we don't use the same creators in every city. We find the right local voice in each market — someone the local audience trusts."
    },
    metrics: [
      { label: "Cities Covered", value: "10+" },
      { label: "Views (Flagship)", value: "7.8L" },
      { label: "Reach (Flagship)", value: "6.5L" },
      { label: "Interactions", value: "39K" }
    ],
    tags: ["Multi-City Execution", "Festive Campaign", "Hyperlocal Casting", "Store Footfall"]
  },
  {
    id: "12",
    brand: "Coca-Cola India — #DietCoke",
    title: "Riding the Global Trump–Elon Diet Coke Moment to Trend in India",
    type: 'cream',
    subtitle: "The Global Moment",
    approach: "Elon Musk praised a Diet Coke bottle gifted to Donald Trump. INI's mandate: make India part of that conversation within hours — and make it feel organic, not corporate.",
    details: "Rapid Twitter activation starting at 4:30 PM. 2,000+ micro-influencers coordinated for volume, with emotional storytelling rooted in India's relationship with Diet Coke.",
    insight: {
      label: "Reactive Marketing Power",
      text: "The best moment to activate a global brand conversation in India is when the global conversation is already happening. The window is 6–12 hours. We use every minute of it."
    },
    metrics: [
      { label: "Total Tweets", value: "7,200+" },
      { label: "Impressions", value: "25M+" },
      { label: "Trending Duration", value: "4+ Hrs" },
      { label: "Positive Sentiment", value: "65.4%" }
    ],
    tags: ["Moment Marketing", "Twitter Trending", "MNC Brand", "Sentiment Mapping"]
  },
  {
    id: "13",
    brand: "Godrej Secure — Locking Solutions",
    title: "Turning a Nepal Protest Video Into 6.2M Views",
    type: 'odd',
    subtitle: "The Moment",
    approach: "Viral video showed protestors failing to destroy a Godrej locker. The locker stood unbothered. INI responded within 48 hours to own that cultural moment.",
    details: "Rapid-response meme marketing operation. Multiple niche community pages seeded with custom humorous content celebrating the locker's invincibility.",
    insight: {
      label: "Campaign Insight",
      text: "The best brand campaigns don't feel like campaigns. This one felt like the internet just happened to agree that Godrej lockers are indestructible."
    },
    metrics: [
      { label: "Total Views", value: "6.2M" },
      { label: "Reach", value: "4.5M" },
      { label: "Likes", value: "76.2K" },
      { label: "Ad Spend", value: "Zero" }
    ],
    tags: ["Moment Marketing", "Meme Strategy", "Zero Media Spend", "Cultural Intelligence"]
  },
  {
    id: "14",
    brand: "Parle-G — #BharatKaApnaBiscuit",
    title: "Trending #1 on Twitter/X Across India — National Biscuit Day",
    type: 'even',
    subtitle: "Objective",
    approach: "Celebrate National Biscuit Day and make Parle-G the unmissable conversation of the day on Twitter/X across India.",
    details: "10 verified influencers as anchors + 200+ amplifiers. Emotional messaging built around nostalgia and national pride. Sharpe volume spike to force algorithmic trending.",
    insight: {
      label: "Key Learning",
      text: "Twitter trending is not about volume. It's about velocity within a defined window. Coordination IS the product."
    },
    metrics: [
      { label: "Total Tweets", value: "9,000+" },
      { label: "Trending Position", value: "#1" },
      { label: "Follower Base", value: "5.4M+" },
      { label: "Over-Delivery", value: "56%" }
    ],
    tags: ["Twitter Trending", "Hashtag Campaign", "National FMCG", "Over-Delivery"]
  },
  {
    id: "15",
    brand: "Flair Pens — #LikhKeDuKya",
    title: "2.2M Reel Views + 18.12M Twitter Impressions for a Pen Brand",
    type: 'cream',
    subtitle: "The Two-Phase Campaign",
    approach: "Phase 1: Meme Marketing on 70 community pages seeding the Ranveer Singh brand film. Phase 2: Twitter Trending activation driving Top 5 India trending for 3 hours.",
    details: "Combined 126 million follower base. Phase 1 built content saturation while Phase 2 built conversation velocity for cultural ubiquity.",
    insight: {
      label: "The Two-Phase Power",
      text: "Phase 1 built content saturation. Phase 2 built conversation velocity. Together, they created an illusion of cultural ubiquity for a fraction of traditional cost."
    },
    metrics: [
      { label: "Reel Views", value: "2.23M" },
      { label: "Twitter Impressions", value: "18.12M" },
      { label: "Trending Postion", value: "Top 5" },
      { label: "Follower Base", value: "126M" }
    ],
    tags: ["Meme + Twitter", "Celebrity Campaign", "Two-Phase Strategy", "Stationery Category"]
  }
];
