// Mangayomi JavaScript Scraper for comix.to
const client = new Client();

async function getPopular(page) {
    // 1. Fetch target directory page
    const res = await client.get(`${baseUrl}/directory?page=${page}`);
    const html = res.body;

    // 2. Target the grid items containing titles and covers
    const elements = jsonSelector(html, '.directory-item, .manga-card, .comic-item'); 
    const mangaList = [];
    
    for (const el of elements) {
        mangaList.push({
            name: attr(el, '.title, h3, .manga-title', 'text').trim(),
            imageUrl: attr(el, 'img', 'src'),
            link: attr(el, 'a', 'href') 
        });
    }

    return {
        list: mangaList,
        hasNextPage: elements.length > 0
    };
}

async function getDetail(url) {
    const res = await client.get(`${baseUrl}${url}`);
    const html = res.body;

    // Extract comic description text blocks
    const description = attr(html, '.synopsis, .description, .manga-summary', 'text').trim();
    const author = attr(html, '.author, .artist', 'text').trim() || "Unknown";

    // Locate individual list items inside the chapter layout
    const chapterElements = jsonSelector(html, '.chapter-item, .chapters li, .chapter-list a');
    const chapters = [];

    for (const ch of chapterElements) {
        // Handle variations where the container element itself might be the anchor tag
        const chLink = attr(ch, 'tagName') === 'a' ? attr(ch, 'href') : attr(ch, 'a', 'href');
        const chName = attr(ch, '.chapter-title, span, text', 'text').trim();

        if (chLink) {
            chapters.push({
                name: chName || "Chapter",
                url: chLink
            });
        }
    }

    return {
        description: description,
        author: author,
        chapters: chapters.reverse(), // Keeps oldest chapters at the top
        status: 5 
    };
}

async function getPageList(url) {
    const res = await client.get(`${baseUrl}${url}`);
    const html = res.body;

    // Select the reader image elements streamed inside the chapter page
    const imageElements = jsonSelector(html, '.page-image, .reader-image, .chapter-images img');
    const pages = [];

    for (const img of imageElements) {
        const imgUrl = attr(img, 'src') || attr(img, 'data-src');
        if (imgUrl) {
            pages.push({
                url: imgUrl,
                headers: { 
                    "Referer": baseUrl,
                    "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
                }
            });
        }
    }

    return pages;
}
