// Developer and Project Information Configuration
// Update this file with your actual project details

export interface DeveloperInfo {
  university: {
    name: string;
    subtitle: string;
    description: string;
    logo?: string; // Optional university logo URL
    website?: string; // Optional university website
  };
  department: {
    name: string;
    school: string;
    description: string;
    hod?: string; // Head of Department
  };
  projectGuide: {
    name: string;
    designation: string;
    specialization: string;
    email?: string; // Optional guide email
    experience?: string; // Years of experience
  };
  team: Array<{
    name: string;
    role: string;
    details: string;
    skills?: string[]; // Optional skills array
    rollNumber?: string; // Student roll number
    avatar?: string; // Optional avatar URL
  }>;
  project: {
    name: string;
    description: string;
    techStack: string;
    category: string; // Project category
    startDate: string;
    endDate?: string;
    status: 'In Development' | 'Completed' | 'Testing' | 'Deployed';
    features: string[]; // List of features
    objectives: string[]; // Project objectives
    stats: {
      duration: string;
      linesOfCode: string;
      features: string;
      commits?: string; // Git commits
      testCases?: string; // Number of test cases
    };
    repository?: string; // GitHub repository URL
    documentation?: string; // Documentation URL
    demo?: string; // Demo/live URL
  };
  contact: {
    email: string;
    github: string;
    linkedin: string;
    phone?: string; // Optional phone number
    portfolio?: string; // Optional portfolio website
  };
  academic: {
    year: string;
    semester: string;
    batch: string;
    cgpa?: string; // Optional CGPA
    submissionDate?: string;
    presentationDate?: string;
  };
  acknowledgments?: {
    specialThanks?: string[];
    resources?: string[];
    inspiration?: string;
  };
}

export const developerInfo: DeveloperInfo = {
  university: {
    name: "Amity University Patna",
    subtitle: "Leading Private University in Bihar",
    description: "Established with excellence in education and research",
    website: "https://www.amity.edu/patna/"
  },
  department: {
    name: "Amity Institute Of Information Technology",
    school: "AIIT",
    description: "Focused on innovative technology solutions",
    hod: "Dr Rashmi Shekhar"
  },
  projectGuide: {
    name: "Dr Sushant Kumar Dubey", // Replace with actual name
    designation: "Associate Professor, AIIT Department",
    specialization: "French Language experts",
    experience: "10+ years"
  },
  team: [
    {
      name: "Bikash Kumar", // Replace with your actual name
      role: "Lead Developer & Project Manager",
      details: "Full-Stack Development, UI/UX Design, System Architecture",
      skills: ["React Native", "TypeScript", "Supabase", "AI Integration", "Project Management"],
      rollNumber: "A45304824010"
    },
    {
      name: "Harshraj Shrivastav, Nikhil Anand and Sushant Mishra", // Replace with teammate's name
      role: "Backend Developer & Database Architect",
      details: "Database Design, API Development, Authentication Systems",
      skills: ["Supabase", "PostgreSQL", "API Design", "Authentication", "Database Optimization"],
      rollNumber: "[Teammate Roll Number]"
    }
    // Add more team members as needed
  ],
  project: {
    name: "French Learning App",
    description: "An AI-powered interactive language learning platform with gamification",
    techStack: "React Native, TypeScript, Supabase, Groq AI, Expo",
    category: "Educational Technology / Mobile Application",
    startDate: "june 2025",
    endDate: "July 2025",
    status: "Completed",
    features: [
      "AI-Powered Conversational Chat Partner",
      "Interactive Lesson System with Multiple Question Types",
      "Real-time Grammar Correction & Feedback",
      "Gamification with Points & Achievements",
      "Comprehensive Question Practice Module",
      "Admin Panel for Content Management",
      "User Progress Tracking & Analytics"
    ],
    objectives: [
      "Create an engaging French learning experience",
      "Implement AI-driven language assistance",
      "Develop comprehensive assessment system",
      "Build scalable admin management system",
      "Ensure responsive and intuitive user interface"
    ],
    stats: {
      duration: "1",
      linesOfCode: "3500+",
      features: "7",
      commits: "150+",
      testCases: "50+"
    },
    repository: "https://github.com/CypherNinjaa/french-learning-app",
    documentation: "Available in project repository"
  },
  contact: {
    email: "aiit@ptn.amity.edu", // Replace with your actual email
    github: "github.com/CypherNinjaa", // Replace with your GitHub
    linkedin: "linkedin.com/school/amity-university-patna/", // Replace with your LinkedIn
    portfolio: "[your-portfolio-website]"
  },
  academic: {
    year: "2024-25",
    semester: "1st Year Project",
    batch: "2024-2028",
    submissionDate: "June 2025",
    presentationDate: "July 2025"
  },
  acknowledgments: {
    specialThanks: [
      "Project Guide for invaluable guidance and support",
      "Department faculty for technical expertise",
      "University for providing excellent infrastructure",
      "Teammates for collaborative development efforts"
    ],
    resources: [
      "Groq AI for advanced language processing",
      "Supabase for robust backend infrastructure",
      "React Native community for comprehensive documentation",
      "Open source libraries and tools"
    ],
    inspiration: "Inspired by the need for interactive and AI-enhanced language learning solutions"
  }
};

