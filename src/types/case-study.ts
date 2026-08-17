export type GalleryItem = { url: string; type: string };

export type VisualDirection = { colors?: string[]; fonts?: string[]; identity?: string[]; imageStyle?: string[] };

export type Project = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  sector?: string;
  category?: string;
  platform?: string;
  services?: string[];
  tools?: string[];
  year?: number;
  heroMediaUrl?: string;
  fullPageMockupUrl?: string;
  gallery?: GalleryItem[];
  beforeAfter?: { before: string; after: string }[];
  closingImageUrl?: string;
  closingImages?: string[];
  liveUrl?: string;
  visualDirection?: VisualDirection;
  sectionOrder?: string[];
};

export type NextProject = {
  slug: string;
  title: string;
  sector?: string;
  heroMediaUrl?: string;
  year?: number;
};
