const Apify = require('apify');

const { utils: { log } } = Apify;


exports.handleStart = async ({ request, page }) => {
    // Handle Start URLs
    await Apify.utils.enqueueLinks({
        page,
        requestQueue,
        selector: 'a', 
        pseudoUrls: ['https://hipages.com.au/connect/[.*]']
    });
};

exports.handleList = async ({ request, page }) => {
    // Handle pagination
};

exports.handleDetail = async ({ request, page }) => {
    // Handle details
};
