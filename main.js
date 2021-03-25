const Apify = require('apify');

Apify.main(async () => {
    const { startUrls } = await Apify.getInput();
    const requestList = await Apify.openRequestList('start-urls', startUrls);
    const requestQueue = await Apify.openRequestQueue();
    // await requestQueue.addRequest(new Apify.Request({ url: 'https://hipages.com.au/tradesman_names/U' }));
    // const dataset = await Apify.openDataset('hipagesB');
    const dataset = await Apify.openDataset('hipagesbusinesses');
    // const pseudoUrls = [new Apify.PseudoUrl('https://hipages.com.au/tradesman_names/[.*]')];
    const proxyConfiguration = await Apify.createProxyConfiguration();
    const crawler = new Apify.PuppeteerCrawler({
        requestList,
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
                const titleOfPage = await page.$eval(
                    '.idcmFM',
                    (el => el.textContent)
                );
                console.log(titleOfPage);
                
                const memberSince = await page.$eval(
                    '.fGRaFI',
                    (el => el.textContent)
                );
                console.log(memberSince);

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
                    "memberSince": memberSince,
                    "businessName": titleOfPage,
                    "sidebarInfo": sidebarInfo, 
                    "websiteURL": websiteURL, 
                    "rating": rating,
                    "serviceCategories": serviceCategories,
                    "containsVerified": containsVerified, 
                    "numberOfRecommendation": numberOfRecommendation,
                    "credentials": credentials,
                    "emails": emails,
                    "fullHTML": fullHTML
                };
                console.log(results);

                await dataset.pushData(results);
            } else {
                console.log("PROCESSING START PAGE");
                // await Apify.utils.enqueueLinks({
                //     page,
                //     requestQueue,
                //     selector: 'a', 
                //     pseudoUrls: ['https://hipages.com.au/tradesman_names/[.*]']
                // });
                await Apify.utils.enqueueLinks({
                    page,
                    requestQueue,
                    selector: 'a', 
                    pseudoUrls: ['https://hipages.com.au/connect/[.*]']
                });
            }            
        },
        maxRequestsPerCrawl: 10000,
        maxConcurrency: 3,
    });

    await crawler.run();
});