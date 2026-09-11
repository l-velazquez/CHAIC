#!/usr/bin/env python3
"""Refresh crawlable article links and the sitemap from Soro's public embed."""
import html
import json
from pathlib import Path
import re
from urllib.parse import quote
from urllib.request import urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://www.chaicpr.com'
EMBED = 'https://app.trysoro.com/api/embed/40ed19b5-41cf-4466-80de-457d5cf25217'


def main():
    with urlopen(EMBED, timeout=30) as response:
        source = response.read().decode('utf-8')
    match = re.search(r'var SORO_ARTICLES\s*=\s*', source)
    if not match:
        raise ValueError('Soro embed format changed; no files updated')
    articles, _ = json.JSONDecoder().raw_decode(source[match.end():])
    if not isinstance(articles, list) or not articles:
        raise ValueError('No articles returned; no files updated')
    links = []
    urls = [SITE + path for path in ('/', '/blog/', '/speakers.html',
                                    '/workshops.html', '/tickets.html', '/privacy.html')]
    seen = set()
    for article in articles:
        slug, title = article['slug'], article['title']
        if not isinstance(slug, str) or not slug or not isinstance(title, str):
            raise ValueError('Invalid article; no files updated')
        if slug in seen:
            continue
        seen.add(slug)
        path = '/blog/?post=' + quote(slug, safe='')
        links.append(f'            <li><a href="{html.escape(path, quote=True)}">{html.escape(title)}</a></li>')
        urls.append(SITE + path)
    page = ROOT / 'blog/index.html'
    markup = page.read_text()
    replacement = '<!-- article-links:start -->\n          <ul class="blog-article-links">\n' + '\n'.join(links) + '\n          </ul>\n          <!-- article-links:end -->'
    markup, count = re.subn(r'<!-- article-links:start -->.*?<!-- article-links:end -->',
                            lambda _: replacement, markup, flags=re.S)
    if count != 1:
        raise ValueError('Missing or duplicated article markers; no files updated')
    namespace = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', namespace)
    sitemap = ET.Element(f'{{{namespace}}}urlset')
    for url in urls:
        entry = ET.SubElement(sitemap, f'{{{namespace}}}url')
        ET.SubElement(entry, f'{{{namespace}}}loc').text = url
    ET.indent(sitemap)
    xml = ET.tostring(sitemap, encoding='utf-8', xml_declaration=True)
    page.write_text(markup)
    (ROOT / 'sitemap.xml').write_bytes(xml + b'\n')
    print(f'Updated {len(links)} article links and {len(urls)} sitemap URLs.')


if __name__ == '__main__':
    main()
