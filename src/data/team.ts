export interface TeamMember {
  id: string;
  name: string;
  role: string;
  kicker: string;
  category: "Leadership" | "Engineering" | "Design" | "Content" | "Operations";
  colorClass: string;
  themeColor: string;
  bio: string;
  fullDescription: string;
  experience: string;
  skills: string[];
  avatar: string;
  instagram?: string;
  travelStyle?: string;
  socials: {
    instagram?: string;
    linkedin?: string;
    github?: string;
    email?: string;
  };
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "shanto-khan",
    name: "SHANTO KHAN",
    role: "Trip Leader & Lead Creator",
    kicker: "CREW LEADER & CREATOR",
    category: "Leadership",
    colorClass: "card-blue",
    themeColor: "#38bdf8",
    bio: "Lead explorer and digital creator leading photography, itinerary mapping, and trip coordination.",
    fullDescription: "Shanto Khan is the founder and crew captain. Passionate about exploring breathtaking natural vistas, scenic drone filming, and cinematic travel storytelling across mountains, beaches, and historical heritage routes.",
    experience: "Crew Captain & Lead Explorer",
    skills: ["Trip Itinerary", "Drone Photography", "Cinematic Video", "Route Navigation", "Leadership"],
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/shantokhan.official",
    travelStyle: "🧭 Expedition Navigator & Drone Pilot",
    socials: {
      instagram: "https://instagram.com/shantokhan.official",
      email: "shanto.khan@platform.com",
    },
  },
  {
    id: "abdullah-al-raji",
    name: "ABDULLAH AL RAJI",
    role: "Route Master & Co-Explorer",
    kicker: "ROUTE MASTER & EXPLORER",
    category: "Engineering",
    colorClass: "card-emerald",
    themeColor: "#34d399",
    bio: "Specializing in mountain trails, off-road camping logistics, GPS tracking, and adventure coordination.",
    fullDescription: "Abdullah Al Raji is the tactical mastermind behind mountain treks, campsite planning, vehicle routes, and off-grid exploration. Known for keeping every trip smooth and adrenaline-packed.",
    experience: "Trekking & Camping Specialist",
    skills: ["Off-Grid Camping", "Mountain Trails", "GPS Navigation", "Campfire Cooking", "First Aid"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/abdullah_raji_travel",
    travelStyle: "⛺ Highland Trekker & Camp Master",
    socials: {
      instagram: "https://instagram.com/abdullah_raji_travel",
      email: "abdullah.raji@platform.com",
    },
  },
  {
    id: "shammo-jr",
    name: "SHAMMO JR",
    role: "Action Videographer & Reels Pilot",
    kicker: "ACTION VIDEOGRAPHER",
    category: "Engineering",
    colorClass: "card-red",
    themeColor: "#ef4444",
    bio: "Capturing high-energy action clips, cliff dives, 4K vertical reels, and epic sunset slow-mo shots.",
    fullDescription: "Shammo Jr brings cinematic energy to every expedition, filming high-speed boat rides, beach bonfires, 9:16 vertical travel reels, and behind-the-scenes moments.",
    experience: "Action Cinematographer",
    skills: ["4K Action Cam", "Reels & Shorts", "Color Grading", "Gimbal Pilot", "Soundtracks"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/shammo.jr_reels",
    travelStyle: "🎬 High-Octane Reels Creator",
    socials: {
      instagram: "https://instagram.com/shammo.jr_reels",
      email: "shammo.jr@platform.com",
    },
  },
  {
    id: "mahibhur-rahman",
    name: "MAHIBHUR RAHMAN",
    role: "Visual Storyteller & Photog",
    kicker: "VISUAL STORYTELLER",
    category: "Design",
    colorClass: "card-coffee",
    themeColor: "#d97706",
    bio: "Golden-hour landscape photography, aesthetic composition, and portrait specialist on the road.",
    fullDescription: "Mahibhur Rahman crafts world-class travel photo albums, capturing aesthetic light, candid friend laughs, vintage polaroid moments, and breathtaking vistas.",
    experience: "Lead Photographer",
    skills: ["Landscape Photography", "Portrait Retouching", "Golden Hour Scouting", "Vintage Film", "Visual Mood"],
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/mahibhur_captures",
    travelStyle: "📸 Golden Hour & Candid Frames",
    socials: {
      instagram: "https://instagram.com/mahibhur_captures",
      email: "mahibhur@platform.com",
    },
  },
  {
    id: "ishmam-mahadi",
    name: "ISHMAM MAHADI",
    role: "Food & Culture Scout",
    kicker: "FOOD & CULTURE SCOUT",
    category: "Content",
    colorClass: "card-purple",
    themeColor: "#c084fc",
    bio: "Uncovering authentic local eateries, traditional street delicacies, and rich cultural heritage spots.",
    fullDescription: "Ishmam Mahadi finds the hidden gems in every town — from fresh seafood on marine drives to indigenous hillside feasts and local tea stalls.",
    experience: "Food & Heritage Guide",
    skills: ["Local Food Hunting", "Cultural Stories", "Heritage Scouting", "Coffee Culture", "Travel Diary"],
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/ishmam.tastes",
    travelStyle: "🍲 Gourmet Street Food Explorer",
    socials: {
      instagram: "https://instagram.com/ishmam.tastes",
      email: "ishmam@platform.com",
    },
  },
  {
    id: "jahid-hossain",
    name: "JAHID HOSSAIN",
    role: "Night Sky & Astrophotographer",
    kicker: "ASTROPHOTOGRAPHY LEAD",
    category: "Engineering",
    colorClass: "card-cyan",
    themeColor: "#22d3ee",
    bio: "Milky way shooter, night camping long exposures, star trails, and stargazing equipment tech.",
    fullDescription: "Jahid Hossain turns midnight camps into glowing galaxies, photographing the stars, light painting, and capturing midnight campfire reflections.",
    experience: "Astro & Low-Light Master",
    skills: ["Astrophotography", "Long Exposure", "Star Tracker", "Night Cam Tuning", "Timelapse"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/jahid_stars",
    travelStyle: "🌌 Milky Way & Midnight Stargazer",
    socials: {
      instagram: "https://instagram.com/jahid_stars",
      email: "jahid.hossain@platform.com",
    },
  },
  {
    id: "shuvo",
    name: "SHUVO",
    role: "Creative Sound & Vibes Master",
    kicker: "SOUND & TRAVEL VIBES",
    category: "Design",
    colorClass: "card-rose",
    themeColor: "#fb7185",
    bio: "Curating road trip acoustic playlists, campfire guitar jams, and mood-setting travel vibes.",
    fullDescription: "Shuvo keeps the crew energy high with acoustic music, travel playlists for scenic highways, and creative artistic perspectives on every landmark.",
    experience: "Music & Creative Director",
    skills: ["Acoustic Guitar", "Playlist Curation", "Mood Lighting", "Visual Art", "Campfire Songs"],
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/shuvo_vibes",
    travelStyle: "🎸 Campfire Acoustic & Sunset Vibes",
    socials: {
      instagram: "https://instagram.com/shuvo_vibes",
      email: "shuvo@platform.com",
    },
  },
  {
    id: "showrov",
    name: "SHOWROV",
    role: "Gear, Power & 4x4 Tech",
    kicker: "OFF-ROAD & TECH GEAR",
    category: "Engineering",
    colorClass: "card-black",
    themeColor: "#e4e4e7",
    bio: "Power stations, drone battery banks, off-road vehicle rigs, and outdoor equipment management.",
    fullDescription: "Showrov ensures the team stays powered and connected in remote valleys, managing power inverters, solar panels, water purifiers, and off-road emergency kits.",
    experience: "Off-Road Logistics Tech",
    skills: ["Solar Generators", "Off-Road Vehicle", "Gear Maintenance", "Safety Equipment", "Tech Backup"],
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/showrov_adventures",
    travelStyle: "🚙 4x4 Rig & Off-Grid Tech",
    socials: {
      instagram: "https://instagram.com/showrov_adventures",
      email: "showrov@platform.com",
    },
  },
  {
    id: "arfan",
    name: "ARFAN",
    role: "Crew Host & Memories Chronicler",
    kicker: "MEMORIES & COMMUNITY",
    category: "Operations",
    colorClass: "card-orange",
    themeColor: "#fb923c",
    bio: "Keeping team spirits high, planning crew games, beach volleyball, and group souvenir gathering.",
    fullDescription: "Arfan brings warmth, laughter, and group memories together, ensuring everyone feels included and every funny moment is chronicled in the trip journal.",
    experience: "Crew Host & Event Lead",
    skills: ["Group Activities", "Beach Sports", "Trip Journal", "Team Bonding", "Hospitality"],
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
    instagram: "https://instagram.com/arfan_chronicles",
    travelStyle: "🎉 Group Games & Camp Host",
    socials: {
      instagram: "https://instagram.com/arfan_chronicles",
      email: "arfan@platform.com",
    },
  },
];
