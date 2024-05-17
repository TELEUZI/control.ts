import { load } from 'cheerio';
import { writeFile } from 'fs/promises';
import path from 'path';

interface FileInfo {
  content: string;
  name: string;
  path: string;
}

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

function createElementsFileContent(tags: string[], additionalCharacter?: string) {
  return `
  import { createElementFactory } from './base-component';

  ${tags
    .map((tag) => tag.slice(1, -1))
    .filter((tag) => !tagOutsideTHTMLElementTagNameMap.has(tag))
    .map((tagName) => {
      return `export const ${tagName !== 'var' ? tagName : 'varTag'}${additionalCharacter} = createElementFactory${additionalCharacter}('${tagName}');\n`;
    })
    .join('')}`;
}

function createFiles(filesInfo: FileInfo[]) {
  Promise.all(filesInfo).then((fileInfo) =>
    fileInfo.map(({ content: fileContent, name: fileName, path: filePath }) => {
      const createdFilePath = path.join(__dirname, path.relative('packages/tags-scraper/src/', filePath), fileName);
      return writeFile(createdFilePath, fileContent);
    }),
  );
}

async function run() {
  const html = await fetchHTMLTags(tagsScrapeURL);
  if (!html) {
    return;
  }
  const tags = parseHTMLTags(html, tagsSelector);
  const content = createElementsFileContent(tags);
  const componentsContent = createElementsFileContent(tags, '$');
  const componentName = 'component-tags.ts';
  const elementTagsContent = `export * from '@control.ts/control/element-tags';`;
  const elementTagsName = 'element-tags.ts';
  const packagesControlPath = 'packages/control/src/';
  const packagesMinPath = 'packages/min/src';
  const packagesSignalsPath = 'packages/signals/src';

  const fileInfo = [
    { content: content, name: elementTagsName, path: packagesControlPath },
    { content: componentsContent, name: componentName, path: packagesMinPath },
    { content: elementTagsContent, name: elementTagsName, path: packagesMinPath },
    { content: elementTagsContent, name: elementTagsName, path: packagesSignalsPath },
  ];
  try {
    createFiles(fileInfo);
    console.log('File is with tags is created!');
  } catch (error) {
    console.error('File is not created!', error);
    process.exitCode = 1;
  }
}

run();
