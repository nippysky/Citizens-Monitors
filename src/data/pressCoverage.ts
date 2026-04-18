export type PressCoverageItem = {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
  excerpt: string;
  content: string[];
};

export const mockPressCoverage: PressCoverageItem[] = [
  {
    id: "press-1",
    title:
      "Citizen Monitors Queries ₦1.01 Trillion Budget for Nigeria’s 2027 Elections",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Citizen Monitors has raised serious concerns over the reported ₦1.01 trillion budget for Nigeria’s 2027 general elections.",
    content: [
      "Lagos, Nigeria — Citizen Monitors, a civic technology and election integrity organisation, has raised serious concerns over the reported ₦1.01 trillion budget for Nigeria’s 2027 general elections, warning that the figure is excessive, unjustified, and disconnected from measurable electoral outcomes.",
      "Nigeria is grappling with rising insecurity, failing infrastructure, and severe fiscal strain. In this context, allocating over one trillion Naira to conduct an election demands a level of transparency, efficiency, and accountability that has not been demonstrated.",
      "“Elections are a public service, not a spectacle,” said Olajumoke Alawode-James, spokesperson for Citizen Monitors. “₦1.01 trillion without a clear, itemised and performance-based framework is not reform—it is institutionalised waste. If Nigerians are going to get elections like 2023, where INEC’s result-upload system failed, then this level of spending is indefensible.”",
      "The organisation called on relevant institutions to publish a detailed cost breakdown, implementation benchmarks, and a public accountability framework before any final appropriations are made.",
    ],
  },
  {
    id: "press-2",
    title:
      "Tax Changes Must Come With Clarity, Fairness and Real Protection for Households",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Citizen Monitors says fiscal reforms must not deepen hardship for already struggling households.",
    content: [
      "Citizen Monitors has called for greater clarity, fairness, and social protection in the rollout of new tax and revenue measures affecting Nigerians.",
      "The organisation said reforms cannot succeed where communication is weak and where the burden falls hardest on low-income citizens already facing inflation and weak purchasing power.",
      "According to the group, government must pair tax changes with transparent public education, measurable service delivery improvements, and credible protections for vulnerable households.",
      "Citizen Monitors added that trust in reform grows when citizens can see both the logic behind policy and the practical benefits that follow.",
    ],
  },
  {
    id: "press-3",
    title:
      "Unchecked Borrowings: Citizen Monitors Demands Transparency",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "The organisation is urging stronger public disclosure around debt accumulation and how borrowed funds are used.",
    content: [
      "Citizen Monitors has demanded stronger transparency standards around public borrowing, warning that opaque debt practices weaken citizen trust and reduce democratic accountability.",
      "The organisation said the public deserves timely and understandable disclosure of borrowing terms, repayment risks, and the actual use of loan-backed funds.",
      "It added that debt cannot be treated as an abstract policy tool when its consequences shape inflation, public services, and generational fiscal pressure.",
      "Citizen Monitors urged lawmakers and oversight institutions to strengthen monitoring so borrowing decisions reflect public interest rather than administrative convenience.",
    ],
  },
  {
    id: "press-4",
    title:
      "Democracy Under Siege: Tinubu’s Unconstitutional Takeover in Rivers State Must Be Reversed",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1494172961521-33799ddd43a5?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Citizen Monitors says constitutional order and democratic legitimacy must not be weakened by political overreach.",
    content: [
      "Citizen Monitors has condemned what it described as unconstitutional political overreach in Rivers State, warning that democratic norms must never be suspended for partisan convenience.",
      "The organisation stated that executive power must remain subject to constitutional limits and that political crises cannot be used as pretexts for undermining federal balance and due process.",
      "It argued that democracy is tested not only by elections, but by whether institutions respect the rules when tensions rise.",
      "Citizen Monitors called for an immediate return to lawful constitutional procedures and a public recommitment to institutional restraint.",
    ],
  },
  {
    id: "press-5",
    title:
      "Edo Tribunal Verdict Deepens Crisis of Confidence in Electoral and Judicial Accountability",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "The organisation says public trust depends on transparent reasoning, procedural consistency, and institutional credibility.",
    content: [
      "Citizen Monitors says the latest tribunal developments in Edo have deepened a wider crisis of confidence around electoral and judicial accountability in Nigeria.",
      "According to the organisation, citizens increasingly want decisions that are not only lawful, but clearly reasoned and transparently communicated.",
      "It warned that institutions lose legitimacy when processes appear distant, inconsistent, or inaccessible to the public they serve.",
      "Citizen Monitors called for stronger openness in electoral adjudication and better public access to the factual and legal basis of major rulings.",
    ],
  },
  {
    id: "press-6",
    title: "INEC’s position on e-transmission of election results",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Citizen Monitors says clarity on digital result systems remains essential for electoral trust.",
    content: [
      "Citizen Monitors has reiterated the importance of clarity and consistency in public communication around the electronic transmission of election results.",
      "The organisation said debates around e-transmission are not merely technical; they go directly to public trust in whether votes are protected from polling unit to final collation.",
      "It noted that technology can strengthen elections only when policy, law, training, and infrastructure are aligned.",
      "Citizen Monitors urged election managers to communicate clearly, prepare thoroughly, and reduce ambiguity ahead of future nationwide contests.",
    ],
  },
  {
    id: "press-7",
    title: "2027: ADC vows mass mobilisation over Electoral Act",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    excerpt:
      "Citizen Monitors says public reform conversations must translate into practical safeguards before the next cycle.",
    content: [
      "Citizen Monitors says the growing mobilisation around Electoral Act reform reflects a broader public appetite for stronger electoral safeguards ahead of 2027.",
      "The organisation noted that reform conversations must move beyond slogans into enforceable rules, credible logistics, and transparent implementation timelines.",
      "It added that election credibility is built long before polling day through law, preparation, and institutional discipline.",
      "Citizen Monitors called on political actors, civil society, and electoral authorities to treat reform as a practical governance task rather than campaign symbolism.",
    ],
  },
];

export function getPressCoverageById(
  id: string
): PressCoverageItem | undefined {
  return mockPressCoverage.find((item) => item.id === id);
}