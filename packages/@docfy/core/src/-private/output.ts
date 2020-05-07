import { Page, PageContent, Output, NestedOutput } from '../types';

function findChild(node: NestedOutput, name: string): NestedOutput | undefined {
  return node.children.find((item) => {
    return item.name === name;
  });
}

function sortByOrder(pages: Page[]): Page[] {
  return pages.sort((a, b) => {
    const aOrder =
      typeof a.frontmatter.order !== 'undefined'
        ? Number(a.frontmatter.order)
        : 998;
    const bOrder =
      typeof b.frontmatter.order !== 'undefined'
        ? Number(b.frontmatter.order)
        : 999;
    return aOrder - bOrder;
  });
}

function transformToPage(pageContents: PageContent[]): Page[] {
  const pages: Page[] = pageContents.map((page) => {
    const { url, headings, title, source, frontmatter, editUrl } = page;

    return {
      url,
      headings,
      title,
      source,
      frontmatter,
      editUrl
    };
  });

  return pages;
}

function transformNestedOutput(
  pages: Page[],
  labels: Record<string, string> = {},
  existingObj?: NestedOutput
): NestedOutput {
  const node: NestedOutput = existingObj || {
    name: '/',
    label: labels['/'] || '/',
    pages: [],
    children: []
  };

  pages.forEach((item): void => {
    let url =
      typeof item.frontmatter.relativeUrl === 'string'
        ? item.frontmatter.relativeUrl
        : item.url;

    url = url[0] === '/' ? url.substring(1) : url;
    const urlParts = url.split('/');

    if (urlParts.length === 1) {
      item.frontmatter.relativeUrl = urlParts[0];
      node.pages.push(item);
    } else {
      const name = urlParts.shift();

      if (typeof name === 'string') {
        let child = findChild(node, name);

        if (!child) {
          child = {
            name: name,
            label: labels[name] || name,
            pages: [],
            children: []
          };
          node.children.push(child);

          node.children.sort((a, b) => {
            const labelA = a.label.toUpperCase();
            const labelB = b.label.toUpperCase();
            if (labelA < labelB) {
              return -1;
            }
            if (labelA > labelB) {
              return 1;
            }

            return 0;
          });
        }

        item.frontmatter.relativeUrl = urlParts.join('/');
        transformNestedOutput([item], labels, child);

        sortByOrder(child.pages);
      }
    }
  });

  sortByOrder(node.pages);
  return node;
}

// We flat the nested output to keep the nested order
function flatNested(output: NestedOutput, pages: Page[] = []): Page[] {
  pages.push(...output.pages);

  output.children.forEach((child) => {
    flatNested(child, pages);
  });

  return pages;
}

export function transformOutput(
  pageContents: PageContent[],
  labels: Record<string, string> = {}
): Output {
  const nested = transformNestedOutput(transformToPage(pageContents), labels);
  const flat = flatNested(nested);

  return { flat, nested };
}
