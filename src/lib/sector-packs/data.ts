import type { PromptPattern, StudyType } from "@/generated/prisma/client";

export type PackPersona = {
  name: string;
  tagline: string;
  role: string;
  demographics: Record<string, string>;
  context: string;
  beliefs: string;
  priorAttempts: string;
  skepticismSources: string;
  decisionProcess: string;
  consults: string;
  dealbreakers: string;
  bigFive: { openness: number; conscientiousness: number; extraversion: number; agreeableness: number; neuroticism: number };
  values: string[];
  motivations: string;
  decisionBehaviour: string;
  tags: string[];
};

export type PackSegment = {
  name: string;
  definition: string;
  personas: PackPersona[];
};

export type PackStudyTemplate = {
  type: StudyType;
  label: string;
  researchQuestion: string;
  promptPattern: PromptPattern;
};

export type SectorPack = {
  slug: string;
  name: string;
  description: string;
  segments: PackSegment[];
  studyTemplates: PackStudyTemplate[];
  journeyScaffold: { name: string; stages: { key: string; label: string }[] };
  groundingTemplates: string[];
  note?: string;
};

const defaultBigFive = { openness: 55, conscientiousness: 60, extraversion: 50, agreeableness: 55, neuroticism: 45 };

export const SECTOR_PACKS: SectorPack[] = [
  {
    slug: "ecommerce",
    name: "E-commerce / Marketplace",
    description: "Segments and study framings for online retail and marketplaces.",
    segments: [
      {
        name: "Bargain-hunter",
        definition: "Shops primarily on price; waits for sales and compares aggressively before buying.",
        personas: [
          {
            name: "Priya Nair",
            tagline: "Never pays full price if she can help it",
            role: "Shopper, price-first",
            demographics: { ageRange: "25-34", location: "Suburban", income: "Middle" },
            context: "Runs three price-comparison tabs before any purchase over $30.",
            beliefs: "Believes most 'sales' are inflated-then-discounted marketing tricks.",
            priorAttempts: "Uses browser extensions to track price history before buying.",
            skepticismSources: "Been burned by a 'discount' that was the regular price relisted.",
            decisionProcess: "Waits, compares, checks price-history tools, then buys at the lowest point.",
            consults: "Reddit deal threads and price-tracking communities.",
            dealbreakers: "No visible price history, no free returns, discount that doesn't check out.",
            bigFive: { ...defaultBigFive, conscientiousness: 75, neuroticism: 55 },
            values: ["Value for money", "Transparency"],
            motivations: "Wants to feel like she got the best possible deal, not just a fair one.",
            decisionBehaviour: "Deal-driven; will abandon cart and return later if price doesn't feel like a win.",
            tags: ["ecommerce", "bargain-hunter"],
          },
        ],
      },
      {
        name: "Loyal repeat buyer",
        definition: "Sticks with brands/sellers they trust; values convenience over lowest price.",
        personas: [
          {
            name: "Tom Baker",
            tagline: "Buys from the same three sellers out of habit and trust",
            role: "Repeat customer",
            demographics: { ageRange: "45-54", location: "Urban" },
            context: "Has a saved address, saved card, and a short list of go-to sellers.",
            beliefs: "Trusts a seller more after two or three good experiences; rarely re-shops after that.",
            priorAttempts: "Tried switching to a cheaper competitor once, had a bad delivery experience, went back.",
            skepticismSources: "One bad experience with an unfamiliar seller years ago still lingers.",
            decisionProcess: "Defaults to the familiar seller unless something is clearly broken.",
            consults: "Nobody — decides fast based on habit.",
            dealbreakers: "A trusted seller changing return policy or shipping getting unreliable.",
            bigFive: { ...defaultBigFive, openness: 35, agreeableness: 65 },
            values: ["Reliability", "Convenience"],
            motivations: "Wants shopping to require zero thought.",
            decisionBehaviour: "Fast, habitual, low price-sensitivity within trusted sellers.",
            tags: ["ecommerce", "loyal"],
          },
        ],
      },
      {
        name: "High-value / premium shopper",
        definition: "Prioritises quality, service, and experience; price is a secondary signal.",
        personas: [
          {
            name: "Camille Dubois",
            tagline: "Pays more for white-glove service and doesn't think twice",
            role: "Premium shopper",
            demographics: { ageRange: "35-44", income: "High" },
            context: "Shops on curated marketplaces and brand flagship stores, rarely on generic marketplaces.",
            beliefs: "Believes price often signals quality, within reason.",
            priorAttempts: "Has returned cheaper alternatives that felt low-quality.",
            skepticismSources: "Distrusts marketplaces with heavy discounting as a default state.",
            decisionProcess: "Evaluates brand reputation and service promises before price.",
            consults: "A small circle of friends with similar taste.",
            dealbreakers: "Poor packaging, slow or unclear support, no concierge-level service.",
            bigFive: { ...defaultBigFive, conscientiousness: 50, extraversion: 60 },
            values: ["Quality", "Experience", "Status"],
            motivations: "Wants the purchase experience itself to feel premium, not just the product.",
            decisionBehaviour: "Decisive once trust is established; low price sensitivity.",
            tags: ["ecommerce", "premium"],
          },
        ],
      },
      {
        name: "Cart-abandoner",
        definition: "Frequently adds to cart but drops off before completing checkout.",
        personas: [
          {
            name: "Jordan Lee",
            tagline: "Fills a cart to 'think about it' and often never comes back",
            role: "Hesitant shopper",
            demographics: { ageRange: "18-24" },
            context: "Browses on mobile during downtime; rarely completes purchases in one sitting.",
            beliefs: "Adding to cart is a bookmark, not a commitment.",
            priorAttempts: "Has abandoned dozens of carts over unexpected shipping costs or account requirements.",
            skepticismSources: "Surprise fees revealed only at the final checkout step.",
            decisionProcess: "Needs a reason to finish now — urgency, a saved cart reminder, or frictionless checkout.",
            consults: "Nobody, decides alone and often impulsively when they do convert.",
            dealbreakers: "Forced account creation, surprise shipping/import fees, too many checkout steps.",
            bigFive: { ...defaultBigFive, conscientiousness: 35, neuroticism: 60 },
            values: ["Low friction", "No surprises"],
            motivations: "Wants to buy without feeling pressured or tricked.",
            decisionBehaviour: "Impulsive when it converts, easily deterred by friction.",
            tags: ["ecommerce", "cart-abandoner"],
          },
        ],
      },
      {
        name: "Cross-border / import-sensitive buyer",
        definition: "Buys from international sellers; highly sensitive to duties, customs, and delivery time.",
        personas: [
          {
            name: "Anke Schmidt",
            tagline: "Has been surprised by an import-duty bill before and won't let it happen again",
            role: "Cross-border shopper",
            demographics: { location: "Germany", ageRange: "35-44" },
            context: "Regularly orders from non-EU sellers for items not available locally.",
            beliefs: "Assumes any cross-border order will have a hidden cost unless proven otherwise.",
            priorAttempts: "Was billed an unexpected customs fee after delivery and had to pay at the door.",
            skepticismSources: "That one unexpected customs bill still shapes every purchase decision.",
            decisionProcess: "Looks specifically for 'duties included' or landed-cost pricing before buying.",
            consults: "Cross-border shopping forums for horror stories and safe sellers.",
            dealbreakers: "Any ambiguity about who pays duties, or delivery estimates over 3 weeks.",
            bigFive: { ...defaultBigFive, neuroticism: 60, conscientiousness: 70 },
            values: ["Predictability", "Total-cost transparency"],
            motivations: "Wants the price shown at checkout to be the only price she ever pays.",
            decisionBehaviour: "Will abandon at the first sign of an unclear landed cost.",
            tags: ["ecommerce", "cross-border"],
          },
        ],
      },
      {
        name: "Marketplace seller",
        definition: "Runs a storefront on the marketplace; cares about seller-center usability and payout clarity.",
        personas: [
          {
            name: "Marcus Boyd",
            tagline: "Runs his shop between shifts and needs the seller tools to just work",
            role: "Independent marketplace seller",
            demographics: { ageRange: "25-34" },
            context: "Manages listings, orders, and returns from his phone in short bursts.",
            beliefs: "Believes most seller dashboards are built for power users, not people like him.",
            priorAttempts: "Has abandoned bulk-listing tools that were too complex for his catalog size.",
            skepticismSources: "A past payout delay with no clear explanation.",
            decisionProcess: "Judges a marketplace by how fast and clear payouts and dispute resolution are.",
            consults: "A small seller community group for platform comparisons.",
            dealbreakers: "Opaque fee structures, slow payouts, unresponsive seller support.",
            bigFive: { ...defaultBigFive, conscientiousness: 65 },
            values: ["Fairness", "Clarity", "Speed"],
            motivations: "Wants running his shop to feel low-stress alongside a day job.",
            decisionBehaviour: "Sticks with a platform once payouts and support prove reliable.",
            tags: ["ecommerce", "seller"],
          },
        ],
      },
    ],
    studyTemplates: [
      { type: "UX_WALKTHROUGH", label: "Checkout & duty-line friction", researchQuestion: "Does the duty/import-fee line item at checkout cause hesitation or abandonment?", promptPattern: "OBJECTION_SURFACE" },
      { type: "UX_WALKTHROUGH", label: "Returns & refunds experience", researchQuestion: "Is the returns flow clear enough that customers trust they'll get refunded?", promptPattern: "STANDARD" },
      { type: "MESSAGE_TEST", label: "Promotional-mechanics response", researchQuestion: "Which promotion framing (percent-off vs. dollar-off vs. bundle) feels most credible?", promptPattern: "COMPARE_AND_JUSTIFY" },
      { type: "UX_WALKTHROUGH", label: "Search & discovery", researchQuestion: "Can shoppers find what they're looking for without switching to a competitor?", promptPattern: "STANDARD" },
      { type: "UX_WALKTHROUGH", label: "Seller-center usability", researchQuestion: "Can a new seller list a product and understand their payout without support?", promptPattern: "OBJECTION_SURFACE" },
    ],
    journeyScaffold: {
      name: "E-commerce purchase journey",
      stages: [
        { key: "discover", label: "Discover" },
        { key: "compare", label: "Compare" },
        { key: "add_to_cart", label: "Add to cart" },
        { key: "checkout", label: "Checkout" },
        { key: "delivery", label: "Delivery" },
        { key: "returns", label: "Returns" },
        { key: "repeat", label: "Repeat purchase" },
      ],
    },
    groundingTemplates: ["Order reviews", "Support tickets", "Seller feedback", "Abandoned-cart reasons"],
  },
  {
    slug: "banking",
    name: "Banking / Financial Services",
    description: "Segments and study framings for retail and SME banking products.",
    note: "Regulated context — lean on confidence-framing and auditability (§9) and keep real customer data GDPR-tight (§11).",
    segments: [
      {
        name: "Mass-retail current-account holder",
        definition: "Everyday banking customer, price- and fee-sensitive, low engagement with the app beyond basics.",
        personas: [
          {
            name: "Sam Okafor",
            tagline: "Just wants their money to be there and fees to make sense",
            role: "Current-account holder",
            demographics: { ageRange: "25-34", income: "Middle" },
            context: "Checks balance a few times a week, rarely explores other products.",
            beliefs: "Assumes banks bury fees in fine print until proven otherwise.",
            priorAttempts: "Switched banks once over an unexplained monthly fee.",
            skepticismSources: "An unexplained charge that took three calls to resolve.",
            decisionProcess: "Sticks with 'good enough' unless something goes visibly wrong.",
            consults: "Rarely consults anyone; checks a comparison site if truly frustrated.",
            dealbreakers: "Unexplained fees, hard-to-reach support, app outages during payday.",
            bigFive: { ...defaultBigFive, neuroticism: 55 },
            values: ["Fairness", "Simplicity"],
            motivations: "Wants banking to be invisible until something needs attention.",
            decisionBehaviour: "Inertia-driven; switching cost feels higher than the annoyance, until it doesn't.",
            tags: ["banking", "mass-retail"],
          },
        ],
      },
      {
        name: "Credit-cautious borrower",
        definition: "Wary of debt products; needs clear, honest framing of rates and terms before engaging.",
        personas: [
          {
            name: "Elena Petrova",
            tagline: "Reads every clause because a past loan surprised her",
            role: "Prospective borrower",
            demographics: { ageRange: "35-44" },
            context: "Considering a loan but has avoided credit products for years.",
            beliefs: "Believes APR headlines hide the real cost, based on past experience.",
            priorAttempts: "Took a loan years ago where the total repayment was far higher than expected.",
            skepticismSources: "That past loan experience colors every credit offer since.",
            decisionProcess: "Wants a plain-language total-cost figure before even considering the rate.",
            consults: "An independent financial advice website, never just the bank's own materials.",
            dealbreakers: "Any ambiguity about total repayment, variable-rate surprises, prepayment penalties.",
            bigFive: { ...defaultBigFive, neuroticism: 65, conscientiousness: 75 },
            values: ["Honesty", "Predictability"],
            motivations: "Wants to never be surprised by a bill again.",
            decisionBehaviour: "Slow, research-heavy; needs explicit reassurance before committing.",
            tags: ["banking", "credit-cautious"],
          },
        ],
      },
      {
        name: "Digital-first young saver",
        definition: "Mobile-only relationship with banking; expects app parity with consumer tech.",
        personas: [
          {
            name: "Zoe Martins",
            tagline: "Has never set foot in a branch and never plans to",
            role: "Digital-first saver",
            demographics: { ageRange: "18-24" },
            context: "Manages all money via app; compares it to the polish of consumer apps she uses daily.",
            beliefs: "Assumes any bank app should be as smooth as her favorite consumer apps.",
            priorAttempts: "Left a bank whose app felt dated and slow.",
            skepticismSources: "A clunky onboarding flow that took days to resolve identity verification.",
            decisionProcess: "Judges a bank almost entirely by app experience and speed of onboarding.",
            consults: "Social media reviews and friends' recommendations.",
            dealbreakers: "Slow KYC, ugly or confusing UI, no instant notifications.",
            bigFive: { ...defaultBigFive, openness: 70, extraversion: 60 },
            values: ["Speed", "Design quality"],
            motivations: "Wants saving and spending to feel effortless and modern.",
            decisionBehaviour: "Switches quickly if the digital experience disappoints.",
            tags: ["banking", "digital-first"],
          },
        ],
      },
      {
        name: "SME owner",
        definition: "Runs a small business; needs banking that doesn't add operational overhead.",
        personas: [
          {
            name: "Diego Fernandez",
            tagline: "Banking is a tool for the business, not a relationship",
            role: "Small business owner",
            demographics: { ageRange: "35-54" },
            context: "Handles payroll, invoicing, and cash flow personally for a small team.",
            beliefs: "Believes most business banking tools are built for larger companies, not his size.",
            priorAttempts: "Tried reconciling accounting software with the bank feed manually for months.",
            skepticismSources: "A failed integration that cost him hours during a tax deadline.",
            decisionProcess: "Evaluates based on integrations, fees per transaction, and support responsiveness.",
            consults: "His accountant and a peer-owner network.",
            dealbreakers: "Poor accounting integrations, per-transaction fees that scale badly, slow support.",
            bigFive: { ...defaultBigFive, conscientiousness: 70 },
            values: ["Efficiency", "Reliability"],
            motivations: "Wants banking admin to take minutes, not hours, each week.",
            decisionBehaviour: "Pragmatic; will switch for a materially better operational fit.",
            tags: ["banking", "sme"],
          },
        ],
      },
      {
        name: "Wealth / premium client",
        definition: "Higher-balance client expecting personalised service and proactive advice.",
        personas: [
          {
            name: "Helena Voss",
            tagline: "Expects to be known, not routed through a call queue",
            role: "Premium banking client",
            demographics: { ageRange: "45-64", income: "High" },
            context: "Has a relationship manager but increasingly interacts via app for routine needs.",
            beliefs: "Believes premium status should mean proactive advice, not just fee waivers.",
            priorAttempts: "Was routed to general support for a premium-tier request once and it soured trust.",
            skepticismSources: "That misrouting incident made her question the value of the premium tier.",
            decisionProcess: "Weighs personalised service quality above product terms.",
            consults: "Her relationship manager directly, rarely public reviews.",
            dealbreakers: "Being treated like a generic customer despite premium status.",
            bigFive: { ...defaultBigFive, extraversion: 55, agreeableness: 60 },
            values: ["Recognition", "Personalised service"],
            motivations: "Wants her bank to proactively look out for her, not just react.",
            decisionBehaviour: "Loyal but will move significant assets if service quality slips.",
            tags: ["banking", "wealth"],
          },
        ],
      },
      {
        name: "Compliance officer (hard-to-recruit)",
        definition: "B2B stakeholder role; evaluates products for regulatory and audit fit.",
        personas: [
          {
            name: "Ravi Chandran",
            tagline: "Needs an audit trail before he needs a feature",
            role: "Compliance officer",
            demographics: { ageRange: "35-54" },
            context: "Evaluates any new financial product or vendor for regulatory exposure.",
            beliefs: "Assumes a vendor hasn't thought about compliance until they show documentation.",
            priorAttempts: "Rejected a vendor whose data-handling documentation was incomplete.",
            skepticismSources: "A near-miss audit finding tied to a vendor's undocumented data flow.",
            decisionProcess: "Requires documentation and audit trail before any pilot begins.",
            consults: "Legal and internal audit before signing off on anything.",
            dealbreakers: "Missing audit trails, unclear data residency, no documented consent flows.",
            bigFive: { ...defaultBigFive, conscientiousness: 85, openness: 35 },
            values: ["Rigor", "Accountability"],
            motivations: "Wants to never be the reason for a regulatory finding.",
            decisionBehaviour: "Extremely slow, evidence-first, will block on a single missing document.",
            tags: ["banking", "compliance", "hard-to-recruit"],
          },
        ],
      },
    ],
    studyTemplates: [
      { type: "UX_WALKTHROUGH", label: "Onboarding & KYC friction", researchQuestion: "Where does identity verification create drop-off during onboarding?", promptPattern: "OBJECTION_SURFACE" },
      { type: "CONCEPT_TEST", label: "Product comprehension", researchQuestion: "Do customers understand the fees, rate, and terms well enough to trust the product?", promptPattern: "EXPLAIN_AND_EVALUATE" },
      { type: "MESSAGE_TEST", label: "Trust & security objections", researchQuestion: "What security or trust concerns come up unprompted when we describe this feature?", promptPattern: "OBJECTION_SURFACE" },
      { type: "UX_WALKTHROUGH", label: "App usability", researchQuestion: "Can a customer complete this everyday task in the app without confusion?", promptPattern: "STANDARD" },
      { type: "PRODUCT_VALIDATION", label: "Cross-sell / upgrade response", researchQuestion: "Does this upgrade offer feel relevant enough to consider, or does it feel like a sales push?", promptPattern: "OBJECTION_SURFACE" },
    ],
    journeyScaffold: {
      name: "Banking relationship journey",
      stages: [
        { key: "awareness", label: "Awareness" },
        { key: "application", label: "Application" },
        { key: "onboarding_kyc", label: "Onboarding / KYC" },
        { key: "first_transaction", label: "First transaction" },
        { key: "servicing", label: "Servicing" },
        { key: "churn_retention", label: "Churn / retention" },
      ],
    },
    groundingTemplates: ["Complaint logs", "App-store reviews", "Call-centre summaries"],
  },
  {
    slug: "fashion",
    name: "Fashion Retail",
    description: "Segments and study framings for apparel and fashion retail.",
    segments: [
      {
        name: "Trend-led shopper",
        definition: "Buys to stay current; influenced by campaigns, lookbooks, and social trends.",
        personas: [
          {
            name: "Ines Moreau",
            tagline: "Wants to wear it before it's everywhere",
            role: "Trend-led shopper",
            demographics: { ageRange: "18-24" },
            context: "Follows fashion accounts closely and buys into trends early.",
            beliefs: "Believes being early to a trend matters more than the price.",
            priorAttempts: "Has bought trend pieces that felt dated within a season.",
            skepticismSources: "A hyped item that didn't match the campaign imagery in person.",
            decisionProcess: "Decides fast off campaign imagery and social proof.",
            consults: "Social media and a few trusted style accounts.",
            dealbreakers: "Product photos that clearly don't match reality, no size availability.",
            bigFive: { ...defaultBigFive, openness: 75, extraversion: 65 },
            values: ["Self-expression", "Novelty"],
            motivations: "Wants to feel current and visible.",
            decisionBehaviour: "Impulsive, driven by imagery and social proof over specs.",
            tags: ["fashion", "trend-led"],
          },
        ],
      },
      {
        name: "Value-conscious buyer",
        definition: "Wants fashion at accessible price points; sensitive to promotions.",
        personas: [
          {
            name: "Grace Kim",
            tagline: "Loves the look but waits for it to hit her price",
            role: "Value-conscious shopper",
            demographics: { ageRange: "25-34", income: "Middle" },
            context: "Wishlists items and waits for a promotion before buying.",
            beliefs: "Believes almost everything eventually goes on sale.",
            priorAttempts: "Has waited weeks for a discount and missed the size she wanted.",
            skepticismSources: "Missing a size during a wait is a recurring frustration.",
            decisionProcess: "Wishlists, waits for a promo notification, then decides fast.",
            consults: "Nobody, decides alone based on price triggers.",
            dealbreakers: "No restock notifications, promotions that exclude wishlisted items.",
            bigFive: { ...defaultBigFive, conscientiousness: 60 },
            values: ["Value for money", "Style"],
            motivations: "Wants to look good without overspending.",
            decisionBehaviour: "Patient until a price threshold is hit, then decisive.",
            tags: ["fashion", "value-conscious"],
          },
        ],
      },
      {
        name: "Sustainability-motivated shopper",
        definition: "Weighs environmental and labor claims heavily in purchase decisions.",
        personas: [
          {
            name: "Freja Larsen",
            tagline: "Checks the materials tab before the price tag",
            role: "Sustainability-motivated shopper",
            demographics: { ageRange: "25-34" },
            context: "Actively researches brand sustainability claims before buying.",
            beliefs: "Assumes sustainability claims are marketing unless backed by specifics.",
            priorAttempts: "Bought from a brand over a vague 'eco-friendly' claim and felt misled later.",
            skepticismSources: "That vague claim turning out to mean very little in practice.",
            decisionProcess: "Looks for specific certifications and material breakdowns, not slogans.",
            consults: "Sustainability rating sites and brand transparency reports.",
            dealbreakers: "Vague claims with no specifics, no material or supply-chain transparency.",
            bigFive: { ...defaultBigFive, conscientiousness: 70, openness: 60 },
            values: ["Sustainability", "Transparency"],
            motivations: "Wants her spending to align with her values without being greenwashed.",
            decisionBehaviour: "Research-heavy; will pay more for verified claims.",
            tags: ["fashion", "sustainability"],
          },
        ],
      },
      {
        name: "Size/fit-anxious buyer",
        definition: "Has been burned by inconsistent sizing; needs strong fit confidence signals.",
        personas: [
          {
            name: "Maya Thompson",
            tagline: "Has three different 'usual sizes' across brands and hates it",
            role: "Fit-anxious shopper",
            demographics: { ageRange: "25-44" },
            context: "Reads every fit-related review before buying anything she can't try on.",
            beliefs: "Assumes a size label is unreliable until reviews confirm it.",
            priorAttempts: "Has returned multiple items that didn't match the sizing chart.",
            skepticismSources: "Repeated sizing inconsistencies across brands and even within one brand's lines.",
            decisionProcess: "Cross-checks size charts against reviewer body-type comments before buying.",
            consults: "Reviews from people who mention their size and how it fit.",
            dealbreakers: "No size chart, no fit-related reviews, restrictive return policy on fit issues.",
            bigFive: { ...defaultBigFive, neuroticism: 60, conscientiousness: 65 },
            values: ["Confidence", "Fit reliability"],
            motivations: "Wants to stop guessing and start trusting sizing.",
            decisionBehaviour: "Cautious; abandons purchase without clear fit evidence.",
            tags: ["fashion", "fit-anxious"],
          },
        ],
      },
      {
        name: "Omnichannel shopper",
        definition: "Browses online, buys in store (or vice versa); expects channel continuity.",
        personas: [
          {
            name: "Liam O'Connor",
            tagline: "Researches online, wants it ready to try on in store",
            role: "Omnichannel shopper",
            demographics: { ageRange: "35-44" },
            context: "Checks in-store stock online before making a special trip.",
            beliefs: "Expects online and in-store inventory to be in sync.",
            priorAttempts: "Drove to a store for an item the app showed in stock, and it wasn't there.",
            skepticismSources: "That mismatch made him distrust the app's stock indicator since.",
            decisionProcess: "Verifies stock online, then commits to visiting only if confident.",
            consults: "Calls the store directly now as a backup check.",
            dealbreakers: "Inaccurate stock info, no click-and-collect option, inconsistent pricing across channels.",
            bigFive: { ...defaultBigFive, conscientiousness: 60 },
            values: ["Reliability", "Convenience"],
            motivations: "Wants channels to feel like one connected experience.",
            decisionBehaviour: "Plans ahead; a broken channel promise reduces trust in both channels.",
            tags: ["fashion", "omnichannel"],
          },
        ],
      },
    ],
    studyTemplates: [
      { type: "UX_WALKTHROUGH", label: "Product-page and imagery reaction", researchQuestion: "Does the product page give enough confidence to buy without seeing it in person?", promptPattern: "STANDARD" },
      { type: "CONCEPT_TEST", label: "Fit/sizing confidence", researchQuestion: "Does the sizing information reduce fit anxiety enough to convert?", promptPattern: "OBJECTION_SURFACE" },
      { type: "MESSAGE_TEST", label: "Price-and-promotion framing", researchQuestion: "Which promotion framing feels most compelling without feeling gimmicky?", promptPattern: "COMPARE_AND_JUSTIFY" },
      { type: "MESSAGE_TEST", label: "Sustainability-claim credibility", researchQuestion: "Does this sustainability claim read as credible or as greenwashing?", promptPattern: "OBJECTION_SURFACE" },
      { type: "CONCEPT_TEST", label: "Lookbook/campaign response", researchQuestion: "Does this campaign make the shopper want to buy in, and why or why not?", promptPattern: "EXPLAIN_AND_EVALUATE" },
    ],
    journeyScaffold: {
      name: "Fashion retail journey",
      stages: [
        { key: "inspiration", label: "Inspiration" },
        { key: "browse", label: "Browse" },
        { key: "fit_assessment", label: "Fit assessment" },
        { key: "purchase", label: "Purchase" },
        { key: "wear", label: "Wear" },
        { key: "return_repeat", label: "Return / repeat" },
      ],
    },
    groundingTemplates: ["Product reviews (fit/quality verbatims)", "Return reasons", "Style-quiz responses"],
  },
  {
    slug: "cpg",
    name: "Consumer Goods (CPG)",
    description: "Segments and study framings for packaged goods and household brands.",
    note: "CPG is where the say-do gap is widest (stated recall of purchases is unreliable) — surface predicted-behaviour confidence caveats prominently.",
    segments: [
      {
        name: "Primary household shopper",
        definition: "Does most of the household grocery shopping; balances multiple needs per trip.",
        personas: [
          {
            name: "Nadia Hussain",
            tagline: "Shops for a family of four on a tight weekly routine",
            role: "Primary household shopper",
            demographics: { ageRange: "35-44", household: "Family with children" },
            context: "Does a big weekly shop plus quick top-up trips; time-pressured.",
            beliefs: "Believes she doesn't have time to evaluate every new product on the shelf.",
            priorAttempts: "Has tried new products that then sat unused because they didn't fit routine.",
            skepticismSources: "Marketing claims that didn't hold up once actually used at home.",
            decisionProcess: "Sticks to a routine list, only diverges for a strong, quick signal.",
            consults: "Family preferences drive most swaps.",
            dealbreakers: "Anything that adds decision time or doesn't fit existing routine.",
            bigFive: { ...defaultBigFive, conscientiousness: 65 },
            values: ["Efficiency", "Family fit"],
            motivations: "Wants the weekly shop to require as little thought as possible.",
            decisionBehaviour: "Routine-driven; new products need to earn attention fast.",
            tags: ["cpg", "primary-shopper"],
          },
        ],
      },
      {
        name: "Brand-loyal buyer",
        definition: "Consistently buys the same brand; resistant to switching even for savings.",
        personas: [
          {
            name: "Robert Chen",
            tagline: "Has bought the same brand for a decade without a second thought",
            role: "Brand-loyal buyer",
            demographics: { ageRange: "45-64" },
            context: "Buys on autopilot; the brand is part of his routine identity.",
            beliefs: "Believes switching risks a worse experience for a marginal saving.",
            priorAttempts: "Tried a private-label swap once and didn't like the difference.",
            skepticismSources: "That one disappointing swap reinforced loyalty to the original brand.",
            decisionProcess: "Doesn't actively decide — repurchases without comparison.",
            consults: "Nobody; loyalty is automatic.",
            dealbreakers: "A noticeable quality or formula change to his usual brand.",
            bigFive: { ...defaultBigFive, openness: 30, conscientiousness: 55 },
            values: ["Consistency", "Trust"],
            motivations: "Wants zero surprises from a category he's stopped thinking about.",
            decisionBehaviour: "Near-automatic repurchase; very low switching propensity.",
            tags: ["cpg", "brand-loyal"],
          },
        ],
      },
      {
        name: "Private-label switcher",
        definition: "Actively compares name-brand vs. store-brand and switches based on perceived value.",
        personas: [
          {
            name: "Sofia Ricci",
            tagline: "Checks unit price and switches to store brand without hesitation",
            role: "Private-label switcher",
            demographics: { ageRange: "25-34", income: "Middle" },
            context: "Compares unit prices and ingredient lists at shelf before deciding.",
            beliefs: "Believes most store brands now match name brands on quality.",
            priorAttempts: "Has switched several categories to store brand successfully.",
            skepticismSources: "A few name-brand premiums that didn't feel justified by taste or quality.",
            decisionProcess: "Compares unit price and ingredients, switches if the gap feels unjustified.",
            consults: "Nobody; decides at shelf based on visible information.",
            dealbreakers: "Store brand quality dropping noticeably, unclear unit pricing.",
            bigFive: { ...defaultBigFive, conscientiousness: 60, openness: 60 },
            values: ["Value for money", "Practicality"],
            motivations: "Wants to spend less without a noticeable quality trade-off.",
            decisionBehaviour: "Comparison-driven, switches readily when value case is clear.",
            tags: ["cpg", "private-label"],
          },
        ],
      },
      {
        name: "Health/ingredient-conscious buyer",
        definition: "Reads labels closely; motivated by health claims and ingredient transparency.",
        personas: [
          {
            name: "Amara Obi",
            tagline: "Turns the pack around to read the ingredient list first",
            role: "Health-conscious buyer",
            demographics: { ageRange: "25-44" },
            context: "Manages a family member's dietary restriction, so label-reading is habitual.",
            beliefs: "Assumes front-of-pack health claims oversimplify what's actually inside.",
            priorAttempts: "Was misled by a 'natural' claim that still had a long ingredient list.",
            skepticismSources: "That mismatch between front-of-pack claim and back label ingredients.",
            decisionProcess: "Reads the full ingredient list before trusting any front-of-pack claim.",
            consults: "A dietitian's advice and ingredient-scanning apps.",
            dealbreakers: "Vague claims unsupported by the ingredient list, undisclosed allergens.",
            bigFive: { ...defaultBigFive, conscientiousness: 75, neuroticism: 55 },
            values: ["Health", "Transparency"],
            motivations: "Wants to trust a label without independently fact-checking every time.",
            decisionBehaviour: "Careful, label-driven; will pay more for genuine transparency.",
            tags: ["cpg", "health-conscious"],
          },
        ],
      },
      {
        name: "Promotion-driven stockpiler",
        definition: "Buys in bulk when a strong promotion appears; low loyalty, high deal-sensitivity.",
        personas: [
          {
            name: "Kevin Walsh",
            tagline: "Buys six when it's 'buy one get one free', regardless of brand",
            role: "Promotion-driven stockpiler",
            demographics: { ageRange: "35-54", household: "Large household" },
            context: "Has pantry space and stocks up hard on any strong promotion.",
            beliefs: "Believes brand matters far less than getting a genuinely good deal.",
            priorAttempts: "Has stockpiled items that later got discontinued or reformulated.",
            skepticismSources: "A 'deal' that turned out to be a smaller pack size at the same unit price.",
            decisionProcess: "Scans weekly promotions and buys in bulk wherever the deal is strongest.",
            consults: "Deal-alert apps and store flyers.",
            dealbreakers: "Shrinkflation disguised as a promotion, purchase limits on deep discounts.",
            bigFive: { ...defaultBigFive, openness: 40, conscientiousness: 45 },
            values: ["Value for money", "Practicality"],
            motivations: "Wants to feel like he's beaten the system on price.",
            decisionBehaviour: "Deal-triggered bulk buying with low brand loyalty.",
            tags: ["cpg", "stockpiler"],
          },
        ],
      },
    ],
    studyTemplates: [
      { type: "UX_WALKTHROUGH", label: "Packaging and shelf-standout", researchQuestion: "Does this packaging stand out and communicate the right thing at shelf/scroll speed?", promptPattern: "STANDARD" },
      { type: "CONCEPT_TEST", label: "Claim and ingredient comprehension", researchQuestion: "Do shoppers understand and believe this product claim?", promptPattern: "EXPLAIN_AND_EVALUATE" },
      { type: "MESSAGE_TEST", label: "Price-pack-architecture response", researchQuestion: "Which pack size and price point feels like the best value without feeling like a downgrade?", promptPattern: "COMPARE_AND_JUSTIFY" },
      { type: "MESSAGE_TEST", label: "Message/positioning test", researchQuestion: "Does this positioning message resonate more than our current messaging?", promptPattern: "COMPARE_AND_JUSTIFY" },
      { type: "CONCEPT_TEST", label: "New-variant concept test", researchQuestion: "Would this new variant get tried, and would it earn a repeat purchase?", promptPattern: "OBJECTION_SURFACE" },
    ],
    journeyScaffold: {
      name: "CPG purchase journey",
      stages: [
        { key: "need", label: "Need" },
        { key: "shelf_scroll", label: "Shelf / scroll" },
        { key: "evaluate", label: "Evaluate" },
        { key: "buy", label: "Buy" },
        { key: "use", label: "Use" },
        { key: "repurchase", label: "Repurchase" },
      ],
    },
    groundingTemplates: ["Retailer reviews", "Panel verbatims", "Category survey data"],
  },
];

export function getSectorPack(slug: string): SectorPack | undefined {
  return SECTOR_PACKS.find((p) => p.slug === slug);
}
