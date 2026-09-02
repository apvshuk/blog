import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as yaml from 'js-yaml';

import './PostPage.css';

const RAW_BASE =
  'https://raw.githubusercontent.com/apvshuk/blog-content/main';


/* =========================================================
   FRONT MATTER
   ========================================================= */

function parseFrontMatter(markdown) {
  const match = markdown.match(
    /^---\s*\n([\s\S]*?)\n---\s*\n/
  );

  if (!match) {
    return {
      content: markdown,
      metadata: {}
    };
  }

  let metadata = {};

  try {
    metadata =
      yaml.load(match[1]) || {};
  } catch (error) {
    console.error(
      'Could not parse YAML front matter:',
      error
    );
  }

  return {
    content: markdown.slice(
      match[0].length
    ),
    metadata
  };
}


/* =========================================================
   MARKDOWN
   ========================================================= */

function markdownToHtml(markdown) {
  if (!markdown) {
    return '';
  }

  const escaped = markdown
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const withCodeBlocks = escaped.replace(
    /```([\s\S]*?)```/g,
    (_, code) =>
      `<pre><code>${code.trim()}</code></pre>`
  );

  const lines =
    withCodeBlocks.split('\n');

  const html = [];

  let inList = false;

  function closeList() {
    if (inList) {
      html.push('</ul>');
      inList = false;
    }
  }

  function inline(text) {
    return text
      .replace(
        /\*\*(.+?)\*\*/g,
        '<strong>$1</strong>'
      )
      .replace(
        /\*(.+?)\*/g,
        '<em>$1</em>'
      )
      .replace(
        /`(.+?)`/g,
        '<code>$1</code>'
      )
      .replace(
        /\[(.+?)\]\((.+?)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
      );
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('<pre>')) {
      closeList();
      html.push(rawLine);
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      closeList();

      const level =
        line.match(/^#{1,6}/)[0].length;

      const text =
        line.replace(/^#{1,6}\s/, '');

      html.push(
        `<h${level}>${inline(text)}</h${level}>`
      );

      continue;
    }

    if (/^>\s?/.test(line)) {
      closeList();

      html.push(
        `<blockquote>${inline(
          line.replace(/^>\s?/, '')
        )}</blockquote>`
      );

      continue;
    }

    if (/^[-*]\s/.test(line)) {
      if (!inList) {
        html.push('<ul>');
        inList = true;
      }

      html.push(
        `<li>${inline(
          line.replace(/^[-*]\s/, '')
        )}</li>`
      );

      continue;
    }

    closeList();

    if (line === '') {
      continue;
    }

    html.push(
      `<p>${inline(line)}</p>`
    );
  }

  closeList();

  return html.join('\n');
}


/* =========================================================
   POST PAGE
   ========================================================= */

export default function PostPage() {
  const { '*': slug } = useParams();

  const [content, setContent] =
    useState('');

  const [metadata, setMetadata] =
    useState({});

  const [status, setStatus] =
    useState('loading');


  useEffect(() => {
    let cancelled = false;

    async function loadPost() {
      try {
        setStatus('loading');

        if (!slug) {
          throw new Error(
            'No post path supplied'
          );
        }

        const path =
          slug
            .split('/')
            .map((part) =>
              decodeURIComponent(part)
            )
            .join('/');

        const url =
          `${RAW_BASE}/${path}`;

        const response =
          await fetch(url);

        if (!response.ok) {
          throw new Error(
            `File not found (${response.status})`
          );
        }

        const markdown =
          await response.text();

        const parsed =
          parseFrontMatter(markdown);

        if (!cancelled) {
          setContent(parsed.content);
          setMetadata(parsed.metadata);
          setStatus('ready');
        }

      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadPost();

    return () => {
      cancelled = true;
    };
  }, [slug]);


  if (status === 'error') {
    return (
      <main className="case-page">

        <Link
          to="/"
          className="case-back"
        >
          ← ARCHIVE
        </Link>

        <section className="case-sheet">
          <p className="case-error">
            THIS FILE COULD NOT BE RETRIEVED.
          </p>
        </section>

      </main>
    );
  }


  return (
    <main className="case-page">

      <Link
        to="/"
        className="case-back"
      >
        ← BACK TO ARCHIVE
      </Link>


      <article className="case-sheet">


        {/* ===============================================
            CASE HEADER
           =============================================== */}

        <header className="case-header">

          <div className="case-header__top">

            <span className="case-header__label">
              ARCHIVE FILE
            </span>

            {metadata.status && (
              <span className="case-status">
                {metadata.status}
              </span>
            )}

          </div>


          <div className="case-header__rule" />


          <h1 className="case-title">
            {metadata.title ||
              'Untitled Article'}
          </h1>


          {metadata.excerpt && (
            <p className="case-excerpt">
              {metadata.excerpt}
            </p>
          )}


          <PostMetadata
            metadata={metadata}
          />

        </header>


        {/* ===============================================
            CONTENT
           =============================================== */}

        <div className="case-content">

          {status === 'loading' && (
            <p className="case-loading">
              RETRIEVING FILE...
            </p>
          )}

          {status === 'ready' && (
            <div
              className="markdown"
              dangerouslySetInnerHTML={{
                __html:
                  markdownToHtml(
                    content
                  )
              }}
            />
          )}

        </div>

      </article>

    </main>
  );
}


/* =========================================================
   POST METADATA
   ========================================================= */

function PostMetadata({ metadata }) {
  const ignoredKeys = new Set([
    'title',
    'excerpt',
    'slug',
    'status',
    'tags',
    'completed'
  ]);

  const extraEntries =
    Object.entries(metadata).filter(
      ([key, value]) =>
        !ignoredKeys.has(key) &&
        value !== null &&
        value !== undefined
    );


  return (
    <div className="case-metadata">


      {metadata.slug && (
        <div className="case-metadata__row">

          <span className="case-metadata__key">
            SLUG
          </span>

          <span className="case-metadata__value">
            {metadata.slug}
          </span>

        </div>
      )}


      {typeof metadata.completed ===
        'boolean' && (
          <div className="case-metadata__row">

            <span className="case-metadata__key">
              COMPLETION
            </span>

            <span
              className={
                metadata.completed
                  ? 'case-complete'
                  : 'case-incomplete'
              }
            >
              {metadata.completed
                ? 'COMPLETED'
                : 'IN PROGRESS'}
            </span>

          </div>
        )}


      {Array.isArray(metadata.tags) &&
        metadata.tags.length > 0 && (
          <div className="case-metadata__row">

            <span className="case-metadata__key">
              TAGS
            </span>

            <span className="case-tags">

              {metadata.tags.map(
                (tag) => (
                  <span
                    className="case-tag"
                    key={String(tag)}
                  >
                    #{String(tag)}
                  </span>
                )
              )}

            </span>

          </div>
        )}


      {extraEntries.map(
        ([key, value]) => (
          <div
            className="case-metadata__row"
            key={key}
          >

            <span className="case-metadata__key">
              {formatKey(key)}
            </span>

            <span className="case-metadata__value">
              {formatValue(value)}
            </span>

          </div>
        )
      )}

    </div>
  );
}


function formatKey(key) {
  return key
    .replace(
      /([A-Z])/g,
      ' $1'
    )
    .replace(
      /[-_]/g,
      ' '
    )
    .replace(
      /^\w/,
      (char) =>
        char.toUpperCase()
    );
}


function formatValue(value) {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (
    typeof value === 'object' &&
    value !== null
  ) {
    return JSON.stringify(value);
  }

  return String(value);
}