export const SITE = {
  site: 'https://vecticum.lt',
  base: '/',
  trailingSlash: false,
  title: 'Vecticum',
  description: 'Verslo procesų valdymo sistema',
};

export const I18N = {
  defaultLanguage: 'lt',
  languages: {
    lt: 'Lietuvių',
    en: 'English',
  },
};

export const APP_BLOG = {
  isEnabled: true,
  postsPerPage: 6,
  isRelatedPostsEnabled: true,
  relatedPostsCount: 4,
  post: {
    isEnabled: true,
    permalink: '/%slug%', // Variables: %slug%, %year%, %month%, %day%, %hour%, %minute%, %second%, %category%
    robots: {
      index: true,
      follow: true,
    },
  },
  list: {
    isEnabled: true,
    pathname: 'blog', // Blog main path, you can change this to "articles" (/articles)
    robots: {
      index: true,
      follow: true,
    },
  },
  category: {
    isEnabled: true,
    pathname: 'category', // Category main path /category/some-category, you can change this to "group" (/group/some-category)
    robots: {
      index: true,
      follow: true,
    },
  },
  tag: {
    isEnabled: true,
    pathname: 'tag', // Tag main path /tag/some-tag, you can change this to "topics" (/topics/some-tag)
    robots: {
      index: false,
      follow: true,
    },
  },
};
