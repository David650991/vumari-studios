import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function loadSiteData(root) {
  const readJson = async file => JSON.parse(await readFile(path.join(root, 'src/data', file), 'utf8'));
  const [company, author, legal, services, portfolio, site, socialLinks, contactChannels, toolsData] = await Promise.all([
    readJson('company.json'), readJson('author.json'), readJson('legal.json'),
    readJson('services.json'), readJson('portfolio.json'), readJson('site.json'),
    readJson('social-links.json'), readJson('contact-channels.json'), readJson('tools.json')
  ]);

  return { company, author, legal, services, portfolio, site, socialLinks, contactChannels, toolsData };
}
