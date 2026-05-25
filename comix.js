// Mangayomi JavaScript Scraper for comix.to
const client = new Client();

async function getPopular(page) {
    // 1. Fetch target catalog page
    const res = await client.get(`${baseUrl}/directory?page=${page}`);
    const html = res.body;

    // 2. Locate container cards and parse elements
    const elements = jsonSelector(html, '.comic-card'); 
    const mangaList = [];
    
    for (const el of elements) {
        mangaList.push({
            name: attr(el, '.comic-title', 'text'),
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

    // Extract basic overview details
    const description = attr(html, '.synopsis', 'text');
    const author = attr(html, '.author-link', 'text');

    // Pull the chapter index list
    const chapterElements = jsonSelector(html, '.chapter-list-item');
    const chapters = [];

    for (const ch of chapterElements) {
        chapters.push({
            name: attr(ch, '.chapter-title', 'text'),
            url: attr(ch, 'a', 'href')
        });
    }

    return {
        description: description,
        author: author,
        chapters: chapters,
        status: 5 // Set to "unknown" status
    };
}

async function getPageList(url) {
    const res = await client.get(`${baseUrl}${url}`);
    const html = res.body;

    // Target the reader images loaded on the page
    const imageElements = jsonSelector(html, '.page-image');
    const pages = [];

    for (const img of imageElements) {
        pages.push({
            url: attr(img, 'src'),
            headers: { "Referer": baseUrl } // Anti-hotlinking shield
        });
    }

    return pages;
}
