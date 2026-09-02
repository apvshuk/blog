Crime-file / newspaper blog — src folder
=========================================

Structure
  src/
    index.jsx, index.css      — app entry point + global tokens/fonts
    App.jsx, App.css          — router + page shell
    components/Header.jsx/.css — newspaper masthead
    pages/HomePage.jsx/.css    — clickable case-file grid (homepage)
    pages/PostPage.jsx/.css    — single report page, fetches Markdown
    data/posts.js              — sample post metadata (title, case
                                  number, date, status, excerpt) —
                                  swap for your real data source

Dependencies (add to your project)
  npm install react react-dom react-router-dom

Markdown source
  Open src/pages/PostPage.jsx and set MD_BASE_URL near the top to
  wherever your .md files live. PostPage requests:
      `${MD_BASE_URL}/${slug}.md`
  where `slug` comes from the route (/post/:slug), matching the
  `slug` field in data/posts.js.

  A small dependency-free Markdown parser (markdownToHtml) is
  included so this works out of the box — handles headings, bold,
  italic, links, lists, blockquotes, and code blocks. Swap it for
  `react-markdown` later if you need full CommonMark support.

Routes
  /              -> HomePage (folder grid)
  /post/:slug    -> PostPage (renders that post's .md file)
