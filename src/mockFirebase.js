// src/mockFirebase.js

// 1. Core Users Ledger Collection (Simulating "voting" collection)
export const mockVotingCollection = [
  {
    uid: "admin123",
    fullName: "Chief Executive Officer",
    email: "admin@company.com",
    company: "P2SA Governance Core",
    hasVoted: false,
    role: "admin",
    votedCategories: [],
    votes: {}
  },
  {
    uid: "voter123",
    fullName: "Sarah Connor",
    email: "sarah@cyberdyne.com",
    company: "Tech Solutions Corp",
    hasVoted: false,
    role: "voter",
    votedCategories: ["president"], // Pretend she already voted for President
    votes: {
      president: ["David Miller"]
    }
  },
  {
    uid: "voter456",
    fullName: "Alex Mercer",
    email: "alex@gentek.com",
    company: "BioInnovations Inc",
    hasVoted: false,
    role: "voter",
    votedCategories: [],
    votes: {}
  }
];

// 2. Candidate Registry Matrix Collection (Simulating "candidates" collection)
export const mockCandidatesCollection = [
  { id: "p1", name: "David Miller", category: "president" },
  { id: "p2", name: "Elena Rostova", category: "president" },
  { id: "d1", name: "Marcus Vance", category: "deputy" },
  { id: "d2", name: "Sophia Lin", category: "deputy" },
  { id: "v1", name: "Jordan Kross", category: "vice" },
  { id: "v2", name: "Naomi Watts", category: "vice" },
  { id: "s1", name: "Christian Bale", category: "secretary" },
  { id: "t1", name: "Tony Stark", category: "treasurer" },
  { id: "e1", name: "Bruce Wayne", category: "exco" },
  { id: "e2", name: "Clark Kent", category: "exco" },
  { id: "e3", name: "Diana Prince", category: "exco" },
  { id: "e4", name: "Barry Allen", category: "exco" }
];

// 3. Central Switch State Node (Simulating "settings" document)
export const mockSettingsDocument = {
  activeCategory: "president" // 'locked', 'president', 'deputy', 'vice', etc.
};