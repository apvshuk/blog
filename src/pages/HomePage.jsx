import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import './HomePage.css';

const RAW_BASE =
  'https://raw.githubusercontent.com/apvshuk/blog-content/main';

export default function HomePage() {
  const [tree, setTree] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let cancelled = false;

    async function loadTree() {
      try {
        const response = await fetch(`${RAW_BASE}/tree.json`);

        if (!response.ok) {
          throw new Error(
            `Could not load tree.json (${response.status})`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setTree(data);
          setStatus('ready');
        }
      } catch (error) {
        console.error(error);

        if (!cancelled) {
          setStatus('error');
        }
      }
    }

    loadTree();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <main className="archive">
        <div className="archive__status">
          ACCESSING ARCHIVE...
        </div>
      </main>
    );
  }

  if (status === 'error') {
    return (
      <main className="archive">
        <div className="archive__status archive__status--error">
          ARCHIVE COULD NOT BE ACCESSED.
        </div>
      </main>
    );
  }

  if (!tree) {
    return null;
  }

  return (
    <main className="archive">
      <header className="archive-header">
        <div>
          <div className="archive-header__eyebrow">
            PERSONAL ARCHIVE
          </div>

          <h1 className="archive-header__title">
            Case Files
          </h1>
        </div>

        <div className="archive-header__mark">
          BLOG / 001
        </div>
      </header>

      <div className="archive-header__line" />

      <div className="archive-tree">
        <RenderTree
          node={tree}
          depth={0}
          root
        />
      </div>
    </main>
  );
}


/* =========================================================
   TREE
   ========================================================= */

function RenderTree({
  node,
  depth,
  root = false
}) {
  /*
   * Hide only the artificial repository root.
   * Its children are still rendered recursively.
   */

  if (root && node.type === 'folder') {
    return (
      <>
        {node.children?.map((child) => (
          <RenderTree
            key={child.path || child.name}
            node={child}
            depth={0}
          />
        ))}
      </>
    );
  }


  /* =======================================================
     FOLDER
     ======================================================= */

  if (node.type === 'folder') {
    return (
      <section
        className={`archive-folder archive-folder--depth-${Math.min(
          depth,
          4
        )}`}
      >
        <div className="folder-tab">
          <span className="folder-tab__index">
            {String(depth + 1).padStart(2, '0')}
          </span>

          <span className="folder-tab__name">
            {node.name}
          </span>
        </div>

        <div className="folder-body">
          {node.children?.map((child) => (
            <RenderTree
              key={child.path || child.name}
              node={child}
              depth={depth + 1}
            />
          ))}
        </div>
      </section>
    );
  }


  /* =======================================================
     FILE
     ======================================================= */

  if (node.type !== 'file') {
    return null;
  }

  if (
    !node.name ||
    !node.name.toLowerCase().endsWith('.md')
  ) {
    return null;
  }


  return (
    <Link
      to={`/post/${encodePath(node.path)}`}
      className="archive-file"
    >
      <div className="archive-file__left">

        <div className="archive-file__topline">
          <span className="archive-file__type">
            FILE
          </span>

          <span className="archive-file__name">
            {node.name}
          </span>
        </div>

        <h2 className="archive-file__title">
          {node.title || getTitle(node.name)}
        </h2>

        {node.excerpt && (
          <p className="archive-file__excerpt">
            {node.excerpt}
          </p>
        )}

        <Metadata node={node} />

      </div>

      <div className="archive-file__arrow">
        ↗
      </div>
    </Link>
  );
}


/* =========================================================
   METADATA
   ========================================================= */

function Metadata({ node }) {
  return (
    <div className="archive-metadata">

      {node.status && (
        <span className="archive-metadata__item">
          <span className="archive-metadata__key">
            STATUS
          </span>

          <span>
            {node.status}
          </span>
        </span>
      )}

      {typeof node.completed === 'boolean' && (
        <span
          className={`archive-metadata__item ${node.completed
              ? 'archive-metadata__item--complete'
              : ''
            }`}
        >
          <span className="archive-metadata__key">
            STATE
          </span>

          <span>
            {node.completed
              ? 'COMPLETED'
              : 'IN PROGRESS'}
          </span>
        </span>
      )}

      {node.tags?.length > 0 && (
        <span className="archive-metadata__tags">
          {node.tags.map((tag) => (
            <span
              className="archive-tag"
              key={String(tag)}
            >
              #{String(tag)}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}


/* =========================================================
   HELPERS
   ========================================================= */

function encodePath(path) {
  return path
    .split('/')
    .map((part) => encodeURIComponent(part))
    .join('/');
}

function getTitle(filename) {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[-_]/g, ' ')
    .replace(
      /\b\w/g,
      (char) => char.toUpperCase()
    );
}