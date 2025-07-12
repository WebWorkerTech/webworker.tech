# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **static HTML podcast website** called "MindTech" (技术与人文的对话) - a Chinese tech and humanities podcast platform. The project consists of HTML files that create an interactive podcast website featuring:

- Modern, responsive design using Tailwind CSS
- Interactive audio player with wave animations
- Podcast episode browsing and categorization
- Host profiles and listener testimonials
- Subscription management and statistics

## Project Structure

The codebase contains:
- `podcast-tech-website.html` - Main website file (identical content to website2)
- `podcast-tech-website2.html` - Duplicate of main website

Both files are complete, self-contained HTML documents with embedded CSS and JavaScript.

## Technology Stack

- **Frontend**: Pure HTML5 with embedded styles and scripts
- **Styling**: Tailwind CSS (via CDN)
- **Icons**: Font Awesome 4.7.0
- **Charts**: Chart.js 4.4.8
- **Fonts**: Inter font family from Google Fonts
- **Language**: Chinese (zh-CN) with UTF-8 encoding

## Design System

### Color Palette
- **Cream colors**: Used for backgrounds and neutral elements
  - cream-50: #FFFDF6 (main background)
  - cream-100 to cream-500: Various shades for cards and accents
- **Mint colors**: Primary brand colors
  - mint-400: #34CC85 (main theme color)
  - mint-100 to mint-500: Various accent shades
- **Slate colors**: Text and UI elements
  - slate-800: #1E293B, slate-900: #0F172A

### Key Components
- **Audio Player**: Fixed bottom player with wave animations and controls
- **Navigation**: Sticky header with logo, menu, and search
- **Cards**: Podcast episodes, hosts, and categories use consistent card layouts
- **Animations**: Hover effects, wave animations, and smooth transitions

## File Architecture

Each HTML file contains:
1. **Head Section**: Meta tags, external dependencies, Tailwind config, custom styles
2. **Audio Player**: Fixed bottom player component
3. **Header**: Navigation with logo and menu
4. **Main Content**: Hero section, categories, episodes, hosts, testimonials
5. **Footer**: Links, contact info, subscription form
6. **Scripts**: Player controls, scroll effects, Chart.js initialization

## Development Notes

- **No build process**: Files are standalone HTML with CDN dependencies
- **Responsive design**: Mobile-first approach with Tailwind responsive classes
- **Custom animations**: CSS keyframes for audio wave effects
- **Chart integration**: Listener growth statistics using Chart.js
- **Accessibility**: Proper semantic HTML and alt text usage

## Editing Guidelines

When modifying these files:
- Maintain the existing design system and color palette
- Use Tailwind utility classes for styling consistency
- Preserve the responsive grid layouts
- Keep the Chinese language content and cultural context
- Test interactive elements (audio player, navigation, hover effects)
- Maintain the clean, modern aesthetic with cream/mint color scheme

## Browser Compatibility

The website uses modern CSS features including:
- CSS Grid and Flexbox
- CSS Custom Properties (--variables)
- backdrop-filter effects
- Modern animation properties

Designed for modern browsers that support these features.