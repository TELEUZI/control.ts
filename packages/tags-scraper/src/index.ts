import { load } from 'cheerio';
import { writeFile } from 'fs/promises';
import path from 'path';

const tagsScrapeURL = 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element';
const tagsSelector = 'section > h2:not(#obsolete_and_deprecated_elements) + div  table > tbody > tr > td > a > code';
const tagOutsideTHTMLElementTagNameMap = new Set(['portal', 'svg']);

async function fetchHTMLTags(url: string) {
  try {
    const response = await fetch(url);
    const body = await response.text();
    return body;
  } catch (error) {
    console.error('Error fetching HTML tags', error);
    process.exitCode = 1;
  }
}

function parseHTMLTags(body: string, tag: string) {
  const $ = load(body);
  const tags = $(tag)
    .filter((_, el) => $(el).text().startsWith('<') && $(el).text().endsWith('>'))
    .map((_, el) => $(el).text())
    .get();
  return Array.from(new Set(tags));
}

function createElementsFileContent(tags: string[]) {
  return `
  import { createElementFactory } from './base-component';

  ${tags
    .map((tag) => tag.slice(1, -1))
    .filter((tag) => !tagOutsideTHTMLElementTagNameMap.has(tag))
    .map((tagName) => {
      return `export const ${tagName !== 'var' ? tagName : 'varTag'} = createElementFactory('${tagName}');\n`;
    })
    .join('')}`;
}

function createComponentsFileContent(tags: string[]) {
  return `
  import { createElementFactory$ } from './factories';

  ${tags
    .map((tag) => tag.slice(1, -1))
    .filter((tag) => !tagOutsideTHTMLElementTagNameMap.has(tag))
    .map((tagName) => {
      return `export const ${tagName}$ = createElementFactory$('${tagName}');\n`;
    })
    .join('')}`;
}

function createFileWithTags(fileContent: string, fileName: string) {
  const filePath = path.join(__dirname, path.relative('packages/tags-scraper/src/', 'packages/min/src/'), fileName);
  return writeFile(filePath, fileContent);
}

async function run() {
  const html = await fetchHTMLTags(tagsScrapeURL);
  if (!html) {
    return;
  }
  const tags = parseHTMLTags(html, tagsSelector);
  const content = createElementsFileContent(tags);
  const componentsContent = createComponentsFileContent(tags);
  try {
    await createFileWithTags(content, 'element-tags.ts');
    await createFileWithTags(componentsContent, 'component-tags.ts');
    console.log('File is with tags is created!');
  } catch (error) {
    console.error('File is not created!', error);
    process.exitCode = 1;
  }
}

run();
