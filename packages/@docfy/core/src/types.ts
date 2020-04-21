import { Node } from 'unist';
import { Processor, Plugin, Settings } from 'unified';

export interface Heading {
  title: string;
  id: string;
  depth: number;
  headings?: Heading[];
}

export interface Page {
  source: string;
  ast: Node;
  markdown: string;
  rendered: string;
  metadata: {
    title?: string;
    order?: number;
    package?: string;
    category?: string;
    url?: string;
    headings?: Heading[];
  };
  demos?: Page[];
}

export interface Context {
  root: string;
  remark: Processor;
  pages: Page[];
  settings: {
    tocMaxDepth: number;
  };
}

interface SourceSettings {
  /**
   * Match files using the patterns the shell uses, like stars and stuff. It
   * uses Glob package.
   */
  pattern: string;

  /**
   * Pattern to ignore.
   */
  ignore?: string[];

  /**
   * Option to change how urls are generated.
   *
   * There are two ways URLs can ge generated.
   *
   * 1. "auto": Uses the folder structure to inform how the urls are generated.
   *    For example, if you have the folowing files:
   *      - install.md
   *      - components/
   *        - button.md
   *        - card.md
   *    The urls would look like this, (assuming urlPrefix is set to "docs").
   *      - docs/install
   *      - docs/components/buttons
   *      - docs/components/card
   *
   * 2. "manual": It uses frontmatter information to inform "category" and
   *    "package" of the file, ignoring the original file location.
   *    The url schema is as follows:
   *    {package}/{category}/{file-name}
   *
   *    If no package or category is specified, all files will be at the root
   *    level.
   *
   *    This options is perfect for documenting monorepo projects while keeping
   *    documentation next to implementation.
   */
  urlSchema?: 'auto' | 'manual';

  /**
   * Option to prefix the urls.
   *
   * For example:
   * "docs" will generate urls like "/docs/something"
   * "blog" will generate urls like "/blog/something"
   */
  urlPrefix?: string;

  /**
   * Option to suffix the urls.
   *
   * For example:
   * ".html" will generate urls like "/something.html"
   */
  urlSuffix?: string;
}

export interface Options {
  root: string;
  sources: SourceSettings[];
  remarkPlugins?: ([Plugin, Settings] | Plugin)[];
  tocMaxDepth?: number;
}
