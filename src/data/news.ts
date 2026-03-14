export type NewsFeedItem = {
  id: string;
  title: string;
  source: string;
  date: string;
  imageUrl: string;
  badgeText: string;
  badgeBg: string;
  excerpt: string;
  author?: string;
  readTime: string;
  likes: number;
  comments: number;
  category: string;
  content: string[];
};

export const mockNewsFeed: NewsFeedItem[] = [
  {
    id: "news-1",
    title: "Young Nigerians’ push for change must go beyond street protests",
    source: "Vanguard",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80",
    badgeText: "V",
    badgeBg: "#C8102E",
    excerpt:
      "Citizens and reform advocates say sustainable civic engagement must extend beyond viral moments and into policy action.",
    author: "Editorial Desk",
    readTime: "4 min read",
    likes: 184,
    comments: 29,
    category: "Politics",
    content: [
      "Young Nigerians demanding political accountability are being urged to take their activism beyond street protests and social media campaigns into more sustained civic participation.",
      "Analysts say public pressure can raise awareness, but meaningful democratic reform often requires long-term engagement with institutions, policies, and local communities.",
      "Observers argue that the next phase of citizen participation should include monitoring public office holders, engaging in legislative conversations, and building issue-based movements that survive beyond election cycles.",
      "For many civic groups, the broader challenge is turning outrage into structure — a difficult but necessary leap in any democracy trying to mature without slipping into spectacle.",
    ],
  },
  {
    id: "news-2",
    title: "Kano by-election: APC sweeps assembly seats",
    source: "The Guidance",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1541872705-1f73c6400ec9?auto=format&fit=crop&w=1200&q=80",
    badgeText: "T",
    badgeBg: "#2A8DD2",
    excerpt:
      "The ruling APC secured wins in key constituencies in Kano during Saturday’s by-election exercise.",
    author: "Political Correspondent",
    readTime: "5 min read",
    likes: 241,
    comments: 41,
    category: "Elections",
    content: [
      "The ruling All Progressives Congress (APC) has won the Saturday state Assembly by-election in two constituencies in Kano.",
      "The Independent National Electoral Commission (INEC) conducted the by-election in Kano Municipal and Ungogo state constituencies to fill the vacant seats in the state house of assembly.",
      "Declaring the result, election officials affirmed APC candidates as winners in the affected constituencies after the collation process was concluded.",
      "According to the announced figures, the APC candidates outpolled rivals by a clear margin, reinforcing the party’s foothold in the state’s assembly politics.",
      "Political observers say the outcome may shape local momentum ahead of future contests, especially as parties intensify grassroots mobilisation across the region.",
    ],
  },
  {
    id: "news-3",
    title: "El-Rufai vs Nuhu Ribadu: Tinubu’s secret opinion poll sparks debate",
    source: "Punch News",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
    badgeText: "P",
    badgeBg: "#F97316",
    excerpt:
      "Political insiders claim a confidential opinion poll has stirred new debate around influence, strategy, and succession.",
    author: "Sunday Report",
    readTime: "6 min read",
    likes: 319,
    comments: 66,
    category: "Politics",
    content: [
      "Fresh political debate has followed reports of a confidential opinion poll allegedly linked to strategic consultations among key figures in the ruling establishment.",
      "The names of prominent northern politicians have surfaced in the discussion, triggering speculation about alignments, influence, and future positioning.",
      "While there is no official confirmation of the poll’s intent or methodology, the mere suggestion of it has fueled arguments across media and party circles.",
      "Analysts caution that internal polling often reveals mood, not destiny — and Nigerian politics has a long tradition of turning whispers into theatre by lunchtime.",
    ],
  },
  {
    id: "news-4",
    title:
      "Phone tapping: ‘Withdraw unlawful mass surveillance regulations now’, SERAP tells FG",
    source: "Vanguard",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
    badgeText: "V",
    badgeBg: "#C8102E",
    excerpt:
      "Rights advocates have called for an immediate review of surveillance regulations they say threaten privacy and civil liberties.",
    author: "Civic Affairs Desk",
    readTime: "4 min read",
    likes: 207,
    comments: 33,
    category: "Rights",
    content: [
      "The Socio-Economic Rights and Accountability Project (SERAP) has urged the Federal Government to withdraw regulations it describes as enabling unlawful mass surveillance.",
      "The group argues that the framework, if left unchecked, could erode constitutional protections around privacy, communication, and civic freedom.",
      "Civil society organisations say any security-related regulation must be narrowly tailored, subject to judicial oversight, and consistent with democratic rights.",
      "The debate has renewed broader questions about how states should balance security imperatives with individual liberty in an age of expanding digital monitoring.",
    ],
  },
  {
    id: "news-5",
    title: "I didn’t collect money to defect to APC, says Taraba governor",
    source: "Channel TV",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
    badgeText: "C",
    badgeBg: "#2457C5",
    excerpt:
      "The governor denied allegations of financial inducement, insisting his political decisions were based on principle.",
    author: "State Politics Desk",
    readTime: "3 min read",
    likes: 146,
    comments: 18,
    category: "States",
    content: [
      "The Taraba governor has denied allegations that financial inducement influenced his reported movement toward the APC.",
      "Speaking to journalists, he maintained that his political choices were motivated by governance considerations and not personal gain.",
      "The controversy has drawn mixed reactions from party loyalists and critics, many of whom see defections as both ideological and transactional in today’s political climate.",
    ],
  },
  {
    id: "news-6",
    title: "INEC’s position on e-transmission of election results",
    source: "The National",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    badgeText: "N",
    badgeBg: "#15803D",
    excerpt:
      "The electoral body outlined its position amid continued public debate around transparency and digital result systems.",
    author: "Election Watch",
    readTime: "5 min read",
    likes: 274,
    comments: 52,
    category: "Elections",
    content: [
      "INEC has restated its position on the electronic transmission of election results amid renewed public scrutiny over transparency mechanisms.",
      "Officials say the commission remains committed to lawful and technically sound processes that strengthen trust in electoral outcomes.",
      "Election reform advocates continue to push for clearer communication, stronger infrastructure, and fewer ambiguities in how result technology is deployed.",
      "At the heart of the argument is a simple democratic principle: citizens trust elections more when the chain between voting and results is harder to bend.",
    ],
  },
  {
    id: "news-7",
    title: "2027: ADC vows mass mobilisation over Electoral Act reforms",
    source: "Vanguard",
    date: "02/02/2026",
    imageUrl:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    badgeText: "V",
    badgeBg: "#C8102E",
    excerpt:
      "Party leaders say they will intensify nationwide mobilisation around proposed electoral reforms ahead of 2027.",
    author: "National Politics",
    readTime: "4 min read",
    likes: 198,
    comments: 24,
    category: "Elections",
    content: [
      "The African Democratic Congress (ADC) says it plans to mobilise citizens across the country around reforms to the Electoral Act.",
      "Party officials argue that the credibility of the 2027 electoral cycle will depend heavily on how urgently reform gaps are addressed.",
      "The call adds to a growing chorus from opposition figures, civic groups, and election observers demanding clearer safeguards and stronger institutional accountability.",
    ],
  },
];

export function getNewsById(id: string): NewsFeedItem | undefined {
  return mockNewsFeed.find((item) => item.id === id);
}