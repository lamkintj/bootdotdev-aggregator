import { RSSFeed, RSSItem } from "./feed";

export function isValidRSS(feed: RSSFeed): boolean {
    const hasChannel = feed.channel ? true : false;
    const hasMetadata = (
        (feed.channel.title !== "" && isString(feed.channel.title))
        && (feed.channel.link !== "" && isString(feed.channel.link))
        && (feed.channel.description !== "" && isString(feed.channel.description)) 
        ? true : false
    );
    return hasChannel && hasMetadata;
}

export function processRSSItems(items: RSSItem[]): RSSItem[] {
    const processedItems: RSSItem[] = [];
    for (const item of items) {
        if (isValidItem(item)) {
            processedItems.push({
                title: item.title,
                link: item.link,
                description: item.description,
                pubDate: item.pubDate
            });
        }
    }
    return processedItems;
}

function isString(item: any): boolean {
    return typeof(item) === "string";
}

function isValidItem(item: RSSItem): boolean {
    const validTitle = (item.title !== "" && isString(item.title));
    const validLink = (item.link !== "" && isString(item.link));
    const validDesc = (item.description !== "" && isString(item.description));
    const validPubDate = (item.pubDate !== "" && isString(item.pubDate));
    return (validTitle && validLink && validDesc && validPubDate);
}
