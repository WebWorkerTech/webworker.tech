#!/usr/bin/env node

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// RSS URL - 请提供您的RSS地址
const RSS_URL = process.env.RSS_URL || 'https://feed.xyzfm.space/rv449dl9kqka';

// 输出路径
const OUTPUT_PATH = join(__dirname, '../src/data/podcast-data.json');

/**
 * 直接解析RSS XML格式
 */
async function parseRSSXML(xmlContent) {
  // 简单的XML解析函数
  function extractXMLData(xml, tag) {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
    const matches = [];
    let match;
    while ((match = regex.exec(xml)) !== null) {
      matches.push(match[1].trim());
    }
    return matches;
  }

  function extractXMLAttribute(xml, tag, attr) {
    const regex = new RegExp(`<${tag}[^>]*${attr}\\s*=\\s*["']([^"']*?)["'][^>]*>`, 'gi');
    const match = regex.exec(xml);
    return match ? match[1] : null;
  }

  function extractCDATA(content) {
    const cdataMatch = content.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
    return cdataMatch ? cdataMatch[1] : content;
  }

  function cleanHTML(html) {
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .trim();
  }

  // 解析频道信息
  const channelTitle = extractXMLData(xmlContent, 'title')[0] || '';
  const channelDescription = extractXMLData(xmlContent, 'description')[0] || '';
  const channelLink = extractXMLData(xmlContent, 'link')[0] || '';
  const channelImage = extractXMLData(xmlContent, 'image')[0];
  let imageUrl = '';
  
  if (channelImage) {
    const imageUrlMatch = extractXMLData(channelImage, 'url');
    imageUrl = imageUrlMatch[0] || '';
  }

  // 解析单集信息
  const items = [];
  const itemMatches = xmlContent.match(/<item[\s\S]*?<\/item>/gi) || [];

  for (const itemXml of itemMatches) {
    const title = extractCDATA(extractXMLData(itemXml, 'title')[0] || '');
    const description = extractCDATA(extractXMLData(itemXml, 'description')[0] || '');
    const content = extractCDATA(extractXMLData(itemXml, 'content:encoded')[0] || description);
    const link = extractXMLData(itemXml, 'link')[0] || '';
    const guid = extractXMLData(itemXml, 'guid')[0] || '';
    const pubDate = extractXMLData(itemXml, 'pubDate')[0] || '';
    const author = extractXMLData(itemXml, 'author')[0] || extractXMLData(itemXml, 'itunes:author')[0] || '';
    
    // 解析enclosure（音频文件）
    let enclosure = null;
    const enclosureMatch = itemXml.match(/<enclosure[^>]*>/i);
    if (enclosureMatch) {
      const url = extractXMLAttribute(itemXml, 'enclosure', 'url');
      const type = extractXMLAttribute(itemXml, 'enclosure', 'type');
      const length = extractXMLAttribute(itemXml, 'enclosure', 'length');
      
      if (url) {
        enclosure = {
          link: url,
          type: type || 'audio/mpeg',
          length: length ? parseInt(length) : 0,
          duration: 0, // 这需要从其他地方获取
          image: imageUrl,
          rating: { scheme: "urn:itunes", value: "no" }
        };
      }
    }

    // 提取缩略图
    let thumbnail = imageUrl;
    const itunesImage = extractXMLAttribute(itemXml, 'itunes:image', 'href');
    if (itunesImage) {
      thumbnail = itunesImage;
    }

    // 提取分类
    const categories = extractXMLData(itemXml, 'category');

    items.push({
      title: title,
      pubDate: pubDate,
      link: link,
      guid: guid,
      author: author,
      thumbnail: thumbnail,
      description: cleanHTML(description),
      content: cleanHTML(content),
      enclosure: enclosure,
      categories: categories
    });
  }

  return {
    status: 'ok',
    feed: {
      url: RSS_URL,
      title: extractCDATA(channelTitle),
      link: channelLink,
      author: extractXMLData(xmlContent, 'itunes:author')[0] || '',
      description: extractCDATA(channelDescription),
      image: imageUrl
    },
    items: items
  };
}

/**
 * 获取RSS内容并转换为JSON
 */
async function fetchRSSToJSON() {
  try {
    console.log('正在获取RSS内容...');
    console.log(`RSS URL: ${RSS_URL}`);
    
    // 尝试直接获取RSS XML
    let data;
    try {
      const response = await fetch(RSS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const xmlContent = await response.text();
      data = await parseRSSXML(xmlContent);
      console.log('✅ 直接解析RSS XML成功');
    } catch (xmlError) {
      console.log('⚠️ 直接解析RSS失败，尝试使用rss2json服务...');
      
      // 使用rss2json服务作为备选方案
      const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_URL)}&api_key=&count=50`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const jsonData = await response.json();
      
      if (jsonData.status !== 'ok') {
        throw new Error(`RSS解析失败: ${jsonData.message || '未知错误'}`);
      }
      
      // 处理rss2json的数据格式
      data = {
        status: jsonData.status,
        feed: {
          url: jsonData.feed.url,
          title: jsonData.feed.title,
          link: jsonData.feed.link,
          author: jsonData.feed.author,
          description: jsonData.feed.description,
          image: jsonData.feed.image
        },
        items: jsonData.items.map(item => ({
          title: item.title,
          pubDate: item.pubDate,
          link: item.link,
          guid: item.guid,
          author: item.author,
          thumbnail: item.thumbnail,
          description: item.description || '',
          content: item.content || item.description || '',
          enclosure: item.enclosure || null,
          categories: item.categories || []
        }))
      };
      console.log('✅ rss2json服务解析成功');
    }
    
    // 确保输出目录存在
    await fs.mkdir(dirname(OUTPUT_PATH), { recursive: true });
    
    // 保存JSON文件
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');
    
    console.log(`✅ RSS数据已成功转换并保存到: ${OUTPUT_PATH}`);
    console.log(`📊 获取到 ${data.items.length} 个播客节目`);
    console.log(`📑 播客标题: ${data.feed.title}`);
    
    return data;
    
  } catch (error) {
    console.error('❌ RSS转换失败:', error.message);
    
    // 如果转换失败，检查是否有现有的JSON文件
    try {
      const existingData = await fs.readFile(OUTPUT_PATH, 'utf8');
      console.log('💡 使用现有的播客数据文件');
      return JSON.parse(existingData);
    } catch (readError) {
      console.error('❌ 无法读取现有数据文件:', readError.message);
      process.exit(1);
    }
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  fetchRSSToJSON();
}

export default fetchRSSToJSON;