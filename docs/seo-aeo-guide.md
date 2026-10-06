# SEO & AEO Implementation Guide

This document describes the comprehensive SEO (Search Engine Optimization) and AEO (Answer Engine Optimization) implementation added to Costwatch.

## Overview

Costwatch now includes a complete SEO and AEO strategy designed to maximize visibility in search engines and answer engines (like AI assistants, featured snippets, and voice search).

## What's Been Added

### 1. Structured Data (JSON-LD Schema)

**Location:** `/web/components/seo/structured-data.tsx`

Structured data helps search engines understand your content and enables rich snippets in search results.

- **Organization Schema**: Defines Costwatch as an organization with logo and social links
- **WebPage Schema**: Provides context for individual pages
- **SoftwareApplication Schema**: Describes Costwatch as a software application with features, pricing, and screenshots
- **FAQ Schema**: Marks up frequently asked questions for featured snippet eligibility

**Benefits:**
- Rich snippets in search results
- Better understanding by search engines
- Eligibility for "People Also Ask" boxes
- Voice search optimization

### 2. FAQ Section with Schema Markup

**Location:** `/web/components/marketing/faq-section.tsx`

An interactive, accordion-style FAQ section that answers common questions about Costwatch.

**Questions Covered:**
- What is Costwatch?
- Is Costwatch free?
- How does it calculate costs?
- Multi-product support
- Data security
- Bank connection requirements
- Difference from accounting software
- Data export capabilities
- Tech stack details
- Self-hosting instructions

**Benefits:**
- Targets long-tail keywords
- Answers user questions directly
- Optimized for answer engines
- Improves user experience
- Reduces support burden

### 3. Enhanced Metadata

**Location:** `/web/app/layout.tsx`

Comprehensive metadata for the entire application:

- **Extended Keywords**: 17+ targeted keywords for cost tracking, SaaS management, profit calculations
- **Open Graph Tags**: Complete social media preview optimization
- **Twitter Cards**: Large image cards for Twitter/X sharing
- **Verification Tags**: Ready for Google Search Console and other platforms
- **Format Detection**: Prevents false detection of phone numbers/emails
- **Robots Meta**: Instructs search engines on crawling and indexing
- **Canonical URLs**: Prevents duplicate content issues

### 4. Sitemap

**Location:** `/web/app/sitemap.ts`

Dynamic XML sitemap generation for search engines.

**Includes:**
- Homepage (priority: 1.0, weekly updates)
- Documentation page
- Login page
- Signup page

**Benefits:**
- Helps search engines discover pages
- Indicates update frequency
- Sets page priorities

### 5. Robots.txt

**Location:** `/web/app/robots.ts`

Instructs search engine crawlers on which pages to index.

**Configuration:**
- Allows: Public pages (/, /docs, /login, /signup)
- Disallows: Private areas (/app/), APIs (/api/), build files (/_next/)
- Sitemap reference for crawlers

### 6. Open Graph Image Generation

**Location:** `/web/app/opengraph-image.tsx`

Dynamically generated social media preview image using Next.js Image Response API.

**Features:**
- 1200x630px optimized for all platforms
- Costwatch branding and tagline
- "Open Source · Self-Hostable · Private & Secure" highlights
- Edge runtime for fast generation

**Benefits:**
- Professional social media appearance
- Increases click-through rates
- Consistent branding

### 7. Breadcrumb Navigation with Schema

**Location:** `/web/components/seo/breadcrumbs.tsx`

Hierarchical navigation with structured data.

**Benefits:**
- Breadcrumb rich snippets in search results
- Improved user navigation
- Better site structure understanding

### 8. Semantic HTML Improvements

Added proper ARIA labels and semantic HTML throughout:
- `aria-labelledby` for major sections
- Proper heading hierarchy
- Enhanced accessibility

## SEO Best Practices Implemented

### Technical SEO
- ✅ Mobile-responsive design
- ✅ Fast page load times (Next.js optimization)
- ✅ Proper meta tags
- ✅ Canonical URLs
- ✅ XML sitemap
- ✅ Robots.txt
- ✅ HTTPS ready
- ✅ Semantic HTML5

### On-Page SEO
- ✅ Keyword-optimized titles
- ✅ Descriptive meta descriptions
- ✅ Header tag hierarchy (H1, H2, H3)
- ✅ Alt text for images
- ✅ Internal linking
- ✅ Content length and quality
- ✅ FAQ content targeting long-tail keywords

### Schema Markup
- ✅ Organization
- ✅ WebPage
- ✅ SoftwareApplication
- ✅ FAQPage
- ✅ BreadcrumbList

### Social SEO
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Social preview images
- ✅ Shareable content

## AEO (Answer Engine Optimization)

Answer Engine Optimization targets AI assistants, featured snippets, and voice search.

### Strategies Implemented:

1. **FAQ Schema**: Structured Q&A format that answer engines love
2. **Direct Answers**: Clear, concise answers to specific questions
3. **Natural Language**: Content written how people actually speak
4. **Question Targeting**: Titles and headers as questions
5. **Structured Data**: Machine-readable content format

### Target Question Types:
- "What is Costwatch?"
- "How to track product costs?"
- "Is Costwatch free?"
- "How to self-host cost tracking software?"
- "What's the difference between Costwatch and accounting software?"

## Setup Instructions

### 1. Environment Variables

Add to your `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

This is used for:
- Canonical URLs
- Sitemap generation
- Open Graph URLs
- Structured data

### 2. Search Console Verification

When ready to verify with search engines, add verification codes to `/web/app/layout.tsx`:

```typescript
verification: {
  google: "your-google-verification-code",
  yandex: "your-yandex-verification-code",
  // Add others as needed
}
```

### 3. Analytics (Optional)

To track SEO performance, add analytics:

- Google Analytics
- Google Search Console
- Plausible Analytics
- Umami Analytics

### 4. Social Media

Update social links in `/web/components/seo/structured-data.tsx`:

```typescript
sameAs: [
  "https://github.com/App-Chef/costwatch",
  "https://twitter.com/costwatch",  // Add when available
  "https://linkedin.com/company/costwatch",  // Add when available
]
```

## Testing Your SEO

### Tools to Use:

1. **Google Search Console**
   - Monitor indexing status
   - Check for errors
   - View search performance

2. **Rich Results Test**
   - https://search.google.com/test/rich-results
   - Validate structured data

3. **Mobile-Friendly Test**
   - https://search.google.com/test/mobile-friendly

4. **PageSpeed Insights**
   - https://pagespeed.web.dev/

5. **Schema Validator**
   - https://validator.schema.org/

6. **Open Graph Preview**
   - https://www.opengraph.xyz/

### Manual Testing:

```bash
# View sitemap
curl https://your-domain.com/sitemap.xml

# View robots.txt
curl https://your-domain.com/robots.txt

# Check meta tags
curl https://your-domain.com | grep -i "meta"
```

## Monitoring & Improvement

### Key Metrics to Track:

1. **Search Rankings**: Position for target keywords
2. **Organic Traffic**: Visitors from search engines
3. **Click-Through Rate (CTR)**: Clicks vs impressions
4. **Featured Snippets**: FAQ answers in position zero
5. **Bounce Rate**: User engagement quality
6. **Page Load Speed**: Core Web Vitals

### Continuous Optimization:

- Monitor Search Console for issues
- Update content based on search trends
- Add more FAQ questions over time
- Keep keywords up to date
- Monitor competitor SEO strategies

## Target Keywords

Primary keywords:
- cost tracking
- product cost tracker
- SaaS cost management
- subscription tracking
- profit margin calculator
- operating expenses tracker

Long-tail keywords:
- "how to track software costs"
- "calculate monthly operating costs"
- "open source cost management"
- "self-hosted expense tracker"
- "track SaaS subscriptions"

## Future Enhancements

Consider adding:
- [ ] Blog with keyword-targeted content
- [ ] Case studies and testimonials
- [ ] Video content (demos, tutorials)
- [ ] Guest posts and backlinks
- [ ] Community forums or discussions
- [ ] Multilingual support
- [ ] Local SEO (if applicable)
- [ ] Regular content updates

## Resources

- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Next.js Metadata Docs](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Open Graph Protocol](https://ogp.me/)
- [Structured Data Guidelines](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)

## Support

For SEO questions or issues:
1. Check Google Search Console
2. Validate structured data
3. Test with Google's Rich Results tool
4. Review this documentation

---

**Last Updated:** October 2026
