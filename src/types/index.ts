export interface Post {
  id: string;
  slug: string;
  permalink?: string;
  publishDate: Date;
  updateDate?: Date;
  title: string;
  excerpt?: string;
  image?: string;
  tags?: Tag[];
  category?: Category;
  author?: string;
  metadata?: {
    canonical?: string;
    robots?: {
      index?: boolean;
      follow?: boolean;
    };
  };
  draft?: boolean;
  Content?: any;
  content?: string;
  readingTime?: number;
}

export interface Category {
  slug: string;
  title: string;
  description?: string;
}

export interface Tag {
  slug: string;
  title: string;
  description?: string;
}

export interface MetaData {
  title?: string;
  ignoreTitleTemplate?: boolean;
  canonical?: string;
  robots?: {
    index?: boolean;
    follow?: boolean;
  };
  description?: string;
  openGraph?: {
    url?: string;
    siteName?: string;
    images?: OpenGraphImages[];
    locale?: string;
    type?: string;
  };
  twitter?: {
    handle?: string;
    site?: string;
    cardType?: string;
  };
}

export interface OpenGraphImages {
  url: string;
  width?: number;
  height?: number;
}

export interface Image {
  src: string;
  alt?: string;
}

export interface Widget {
  id?: string;
  isDark?: boolean;
  bg?: string;
  classes?: Record<string, string>;
}

export interface Headline {
  title?: string;
  subtitle?: string;
  tagline?: string;
  classes?: Record<string, string>;
}
