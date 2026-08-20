export interface ShantoPlace {
  id: string;
  title: string;
  shortDescription: string;
  image: string;
  details?: string;
  location?: string;
}

export interface ShantoNote {
  id: string;
  title: string;
  text: string;
  image: string;
  date: string;
  category: string;
}

export interface ShantoGalleryItem {
  id: string;
  title: string;
  caption?: string;
  image: string;
  resolution?: string;
  category?: string;
}

export interface ShantoVideoItem {
  id: string;
  title: string;
  duration?: string;
  thumbnailUrl: string;
  videoUrl: string;
  description?: string;
}

export interface ShantoPageConfig {
  heroImage: string;
  pageTitle: string;
  pageSubtitle: string;
  heroInfoHeading: string;
  heroInfoText: string;
  exploreGalleryBtnText: string;
  watchVideosBtnText: string;
  aboutHeading: string;
  aboutText: string;
  places: ShantoPlace[];
  notes: ShantoNote[];
  featuredGalleryIds?: string[];
  featuredVideoIds?: string[];
}

export const DEFAULT_SHANTO_PAGE_DATA: ShantoPageConfig = {
  heroImage: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=2400&auto=format&fit=crop",
  pageTitle: "SHANTO",
  pageSubtitle: "A Personal Journey Through Mostar",
  heroInfoHeading: "Welcome to My Mostar Journey",
  heroInfoText:
    "This page is a personal collection of places, memories, photographs, videos, and stories connected to Mostar. Explore the beauty of the Old Town, historic streets, the Neretva River, architecture, local life, and unforgettable moments.",
  exploreGalleryBtnText: "EXPLORE GALLERY",
  watchVideosBtnText: "WATCH VIDEOS",
  aboutHeading: "About Shanto",
  aboutText:
    "This space is for my personal introduction, journey, experiences, and thoughts about Mostar. Ever since I first set foot in this historic valley, the juxtaposition of emerald waters, medieval Ottoman masonry, and warm mountain light has inspired my creative vision.",
  places: [
    {
      id: "place-old-town",
      title: "Old Town",
      shortDescription: "Historic streets, stone buildings, and traditional atmosphere.",
      image: "https://images.unsplash.com/photo-1596484552834-6a58f850e0a1?q=80&w=1200&auto=format&fit=crop",
      details:
        "The ancient cobblestones of Mostar's Old Town date back over five centuries, winding between stone-built heritage homes, copper artisans, and peaceful river overlooks.",
      location: "Stari Grad, Mostar",
    },
    {
      id: "place-stari-most",
      title: "Stari Most",
      shortDescription: "The iconic bridge and one of Mostar's most recognizable landmarks.",
      image: "https://images.unsplash.com/photo-1561571994-3c61c554181a?q=80&w=1200&auto=format&fit=crop",
      details:
        "Commissioned by Suleiman the Magnificent in 1557 and completed by Mimar Hayruddin in 1566, Stari Most stands as a masterpiece of Islamic Balkan engineering.",
      location: "Stari Most, Neretva River",
    },
    {
      id: "place-neretva-river",
      title: "Neretva River",
      shortDescription: "Beautiful river views and peaceful surroundings.",
      image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=1200&auto=format&fit=crop",
      details:
        "Renowned for its breathtaking cold emerald-green waters that carve dramatically through deep limestone canyons into the Adriatic basin.",
      location: "Neretva Canyon & Riverbanks",
    },
    {
      id: "place-old-bazaar",
      title: "Old Bazaar",
      shortDescription: "Traditional shops, crafts, cafés, and local life.",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
      details:
        "The lively Kujundžiluk bazaar echoes with the timeless hammer strikes of master coppersmiths crafting traditional Bosnian coffee pots and intricate lanterns.",
      location: "Kujundžiluk Street, Mostar",
    },
  ],
  notes: [
    {
      id: "note-morning-neretva",
      title: "A Morning by the Neretva",
      category: "Neretva Experience",
      date: "May 14, 2026",
      image: "https://images.unsplash.com/photo-1575089776834-8be34696ffb9?q=80&w=1200&auto=format&fit=crop",
      text: "At 5:45 AM, Mostar is completely still. The morning mist hovers gently above the turquoise surface of the Neretva, and the first golden rays strike the dome of Koski Mehmed Pasha Mosque. Sitting by the rocky riverbank with a warm camera lens in hand, you understand why travelers have fallen in love with this place for half a millennium.",
    },
    {
      id: "note-bazaar-rhythm",
      title: "Echoes of the Old Bazaar",
      category: "Old Town Stories",
      date: "May 18, 2026",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop",
      text: "Wandering down Kujundžiluk as shopkeepers open their wooden shutters. The aroma of freshly ground dark coffee beans drifts across the limestone walkway while master artisans engrave delicate floral patterns on gleaming copper plates.",
    },
    {
      id: "note-sunset-arch",
      title: "Twilight Reflections on Stari Most",
      category: "Architectural Wonders",
      date: "May 21, 2026",
      image: "https://images.unsplash.com/photo-1561571994-3c61c554181a?q=80&w=1200&auto=format&fit=crop",
      text: "As dusk descends, the warm lamps beneath the great stone arch begin to glow, casting golden amber ripples across the fast-moving river. Looking up at the bridge silhouette against the purple mountain horizon is an unforgettable sight.",
    },
  ],
};

const STORAGE_KEY = "shanto_standalone_page_config";

export function loadShantoPageData(): ShantoPageConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHANTO_PAGE_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SHANTO_PAGE_DATA,
      ...parsed,
      places: parsed.places && parsed.places.length ? parsed.places : DEFAULT_SHANTO_PAGE_DATA.places,
      notes: parsed.notes && parsed.notes.length ? parsed.notes : DEFAULT_SHANTO_PAGE_DATA.notes,
    };
  } catch (err) {
    console.error("Failed to load Shanto page config from localStorage:", err);
    return DEFAULT_SHANTO_PAGE_DATA;
  }
}

export function saveShantoPageData(data: ShantoPageConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save Shanto page config to localStorage:", err);
  }
}

export function resetShantoPageData(): ShantoPageConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  return DEFAULT_SHANTO_PAGE_DATA;
}
