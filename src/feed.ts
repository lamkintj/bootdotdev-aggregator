import { XMLParser } from "fast-xml-parser";
import { isValidRSS, processRSSItems } from "./rssvalidate";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    const result = await fetch(feedURL, {
        headers: {
            "User-Agent": "gator"
        }
    });
    const resultText = await result.text();
    const parser = new XMLParser();
    const jsObj = await parser.parse(resultText);
    const feed = jsObj["rss"];
    if (!isValidRSS(feed)) {
        throw new Error("Invalid RSS channel, or unknown error occurred while fetching data");
    }
    const channel = feed.channel;
    if (!Array.isArray(channel.item)) {
        throw new Error("Error: channel item field is not an object or array of objects");
    }
    const RSSItems: RSSItem[] = processRSSItems(channel.item);
    return {
        channel: {
            title: channel.title,
            link: channel.link,
            description: channel.description,
            item: RSSItems
        }
    };
};