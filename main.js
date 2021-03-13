/**
 * This template is a production ready boilerplate for developing with `PuppeteerCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */
/*
const Apify = require('apify');
const { handleStart, handleList, handleDetail } = require('./src/routes');

const { utils: { log } } = Apify;

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();

    // generate list of urls from 
    // https://hipages.com.au/tradesman_names
    
    const browser = await Apify.launchPuppeteer();
    const page = await browser.newPage();
    await page.goto("https://hipages.com.au/tradesman_names");
    
    //await page.type('#ctl00_generalContentPlaceHolder_SearchControl_txtLicenceNo', '1317628');
    // await page.click('#ctl00_generalContentPlaceHolder_SearchControl_btnSearch');

    await page.addScriptTag({url: 'https://code.jquery.com/jquery-3.2.1.min.js'});

    //let text = await page.$('a')
    //print(text)
    const readThis = await Apify.utils.downloadListOfUrls({
        "url": "https://hipages.com.au/tradesman_names"
    });
    console.log(readThis)


    /*const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();
    const proxyConfiguration = await Apify.createProxyConfiguration();

    const crawler = new Apify.PuppeteerCrawler({
        requestList,
        requestQueue,
        proxyConfiguration,
        launchContext: {
            // Chrome with stealth should work for most websites.
            // If it doesn't, feel free to remove this.
            useChrome: true,
            stealth: true,
        },
        handlePageFunction: async (context) => {
            const { url, userData: { label } } = context.request;
            log.info('Page opened.', { label, url });
            switch (label) {
                case 'LIST':
                    return handleList(context);
                case 'DETAIL':
                    return handleDetail(context);
                default:
                    return handleStart(context);
            }
        },
    });

    log.info('Starting the crawl.');
    await crawler.run();
    log.info('Crawl finished.');
});

const Apify = require('apify');

Apify.main(async () => {
    // Apify.openRequestQueue() creates a preconfigured RequestQueue instance.
    // We add our first request to it - the initial page the crawler will visit.
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest({ url: 'https://hipages.com.au/tradesman_names' });

    // Create an instance of the PuppeteerCrawler class - a crawler
    // that automatically loads the URLs in headless Chrome / Puppeteer.
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,

        // Here you can set options that are passed to the Apify.launchPuppeteer() function.
        launchContext: {
            launchOptions: {
                headless: true,
                // Other Puppeteer options
            },
        },

        // Stop crawling after several pages
        maxRequestsPerCrawl: 10,

        // This function will be called for each URL to crawl.
        // Here you can write the Puppeteer scripts you are familiar with,
        // with the exception that browsers and pages are automatically managed by the Apify SDK.
        // The function accepts a single parameter, which is an object with the following fields:
        // - request: an instance of the Request class with information such as URL and HTTP method
        // - page: Puppeteer's Page object (see https://pptr.dev/#show=api-class-page)
        handlePageFunction: async ({ request, page }) => {
            console.log(`Processing ${request.url}...`);

            // A function to be evaluated by Puppeteer within the browser context.
            const data = await page.$$eval('.athing', $posts => {
                const scrapedData = [];

                // We're getting the title, rank and URL of each post on Hacker News.
                $posts.forEach($post => {
                    scrapedData.push({
                        title: $post.querySelector('.title a').innerText,
                        rank: $post.querySelector('.rank').innerText,
                        href: $post.querySelector('.title a').href,
                    });
                });

                return scrapedData;
            });
            console.log(data);
            // Store the results to the default dataset.
            // await Apify.pushData(data);

            // // Find a link to the next page and enqueue it if it exists.
            // const infos = await Apify.utils.enqueueLinks({
            //     page,
            //     requestQueue,
            //     selector: '.morelink',
            // });

            
            // Add all links from page to RequestQueue
            const infos = await Apify.utils.enqueueLinks({
                page,
                requestQueue,
                baseUrl: request.loadedUrl, // <-------------- important to set the base url here
            });
            

            if (infos.length === 0) console.log(`${request.url} is the last page!`);
        },

        // This function is called if the page processing failed more than maxRequestRetries+1 times.
        handleFailedRequestFunction: async ({ request }) => {
            console.log(`Request ${request.url} failed too many times.`);
        },
    });

    // Run the crawler and wait for it to finish.
    await crawler.run();

    console.log('Crawler finished.');
});*/
const Apify = require('apify');

Apify.main(async () => {
    const requestQueue = await Apify.openRequestQueue();
    await requestQueue.addRequest(new Apify.Request({ url: 'https://hipages.com.au/tradesman_names' }));
    const dataset = await Apify.openDataset('hipages');
    // const pseudoUrls = [new Apify.PseudoUrl('https://hipages.com.au/tradesman_names/[.*]')];
    const proxyConfiguration = await Apify.createProxyConfiguration();
    const crawler = new Apify.PuppeteerCrawler({
        requestQueue,
        proxyConfiguration,
        handlePageFunction: async ({ request, page }) => {
            const title = await page.title();
            console.log(`Title of ${request.url}: ${title}`);
            
            const companyAlphabetList = new Apify.PseudoUrl('https://hipages.com.au/tradesman_names/[.*]', {});
            const individualPage = new Apify.PseudoUrl('https://hipages.com.au/connect/[.*]', {});
        
            if(companyAlphabetList.matches(request.url)){
                console.log("PROCESSING PARENT PAGE");
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'a', 
                    pseudoUrls: ['https://hipages.com.au/connect/[.*]']
                });
            } else if(individualPage.matches(request.url)){
                console.log("PROCESSING CHILD PAGE");
                const title = await page.$eval(
                    '.idcmFM',
                    (el => el.textContent)
                );
                console.log(title);
                
                // await page.$('a.phone-number__desktop');
                clickedItems = await page.$$eval('a.phone-number__desktop', links => links.forEach(link => link.click()));
                await page.waitFor(5000);

                console.log("5 seconds passed");
                const sidebarInfo = await page.$$eval('.kQnNlT', nodes =>
                    nodes.map(function(node) {
                        var contactType = "";
                        if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/43d7d708c91cc8ae97313ebbdf9f5668.svg"){
                            // Contact Name
                            contactType = "ContactName"
                        } else if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/90061bd9d1d44a93f59ab0914698cfed.svg"){
                            // Services offered at locations
                            contactType = "Location"
                        } else if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/1b25edac20d397dddda44a7cdcdfba10.svg"){
                            // Services offered at locations
                            contactType = "LocationsServiced"
                        } else if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/1aef7e9052e0129c51bd6c1654a07f7c.svg"){
                            // mobile
                            contactType = "Mobile"
                        } else if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/9b44df78867827263b3b669c4c9ab5cc.svg"){
                            // phone
                            contactType = "Phone"
                        } else if(node.getElementsByTagName('img')[0].src == "https://assets.homeimprovementpages.com.au/f8b6b653d9a866746eed2054f67b9730.svg"){
                            // phone
                            contactType = "Fax"
                        } else {}

                        return {
                            contactType: contactType,
                            value: node.innerText
                        }
                    })
                );
                console.log(sidebarInfo);

                var numberOfRecommendation = ""
                try {
                    numberOfRecommendation = await page.$eval(
                        '.UFbXr',
                        (el => el.textContent.replace("Recommendations", "").replace("Recommendation", ""))
                    );
                } catch(err){
                    // console.log(err);
                }
                console.log("number of recommendations", numberOfRecommendation);
                
                const credentials = await page.$$eval('a.dyoHpe', nodes =>
                    nodes.map(function(node) {
                        if(node.href == "" && node.text == ""){
                            node.text = node.parentElement.parentElement.textContent;
                        }
                        return {
                            "href": node.href,
                            "text": node.text
                        }
                    })
                );
                console.log(credentials);
                // .getElementsByTagName('a')[0].href

                var serviceCategories = await page.$$eval('.iUdCYM', nodes =>
                    nodes.map(function(node) {
                        return node.textContent
                    })
                );
                containsVerified = serviceCategories.filter(e => e.includes("Verified"));
                console.log(containsVerified);
                serviceCategories = serviceCategories.filter(e => e.includes("Verified") == false);

                console.log(serviceCategories);
                // results["html"] = await page.evaluate(() => document.body.outerHTML)
                // console.log(results);
                var rating = ""
                try {
                    rating = await page.$eval(
                        '.eCEdmk',
                        (el => el.textContent)
                    );
                    console.log(rating)
                } catch (err){
                    //console.log(err);
                }

                var websiteURL = ""
                try {
                    websiteURL = await page.$eval(
                        '.jGvxqU',
                        (el => el.getElementsByTagName('a')[0].href)
                    );
                } catch(err) {
                    //console.log(err);
                } 
                console.log("website url", websiteURL);

                fullHTML = await page.evaluate(() => document.body.outerHTML)
                var emails = Apify.utils.social.emailsFromText(fullHTML);
                emails = emails.filter(e => e !== 'support@hipages.com.au');
                console.log(emails);
                
                // const key = `${request.id}.html`;
                // await keyValueStore.setValue(key, body, { contentType: 'text/html; charset=utf-8' });
                // var htmlSnapshotUrl = keyValueStore.getPublicUrl(key);
                // console.log(htmlSnapshotUrl);
                
                results = {
                    "hipagesURL": request.url,
                    "sidebarInfo": sidebarInfo, 
                    "websiteURL": websiteURL, 
                    "rating": rating,
                    "serviceCategories": serviceCategories,
                    "containsVerified": containsVerified, 
                    "numberOfRecommendation": numberOfRecommendation,
                    "credentials": credentials,
                    "emails": emails
                };
                console.log(results);

                await dataset.pushData(results);
            } else {
                console.log("PROCESSING START PAGE");
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'a', 
                    pseudoUrls: ['https://hipages.com.au/tradesman_names/[.*]']
                });
                // await Apify.utils.enqueueLinks({
                //     page,
                //     requestQueue,
                //     selector: 'a', 
                //     pseudoUrls: ['https://hipages.com.au/connect/[.*]']
                // });
            }            
        },
        maxRequestsPerCrawl: 5000,
        maxConcurrency: 5,
    });

    await crawler.run();
});