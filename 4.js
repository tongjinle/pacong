const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const url = require('url');
const fs = require('fs');
const _ = require('underscore');


// let headless = false;
let headless = true;

let chromeFlags = [];
if(headless){
    chromeFlags.push('--headless');
}

const option = {
    port: 9222,
    chromeFlags
};

let chrome;
chromeLauncher
    .launch(option)
    .then(chrome => {
        start(chrome);
    });


async function start(){
    let client = await CDP();

    const {Network, Page} = client;
    // catch request
    Network.requestIntercepted(({interceptionId, request}) => {
        console.log(interceptionId);
        // perform a test against the intercepted request
        const blocked = shallNotPass(request);
        console.log(`- ${blocked ? 'BLOCK' : 'ALLOW'} ${request.url}`);
        // decide whether allow or block the request
        Network.continueInterceptedRequest({
            interceptionId,
            errorReason: blocked ? 'Aborted' : undefined
        });
    });
    Network.requestWillBeSent((params) => {
        // console.log(params.request.url);
    });
    try {
        // enable domains
        await Network.enable();
        await Page.enable();
        // enable request interception
        await Network.setRequestInterceptionEnabled({enabled: true});
        await Network.setRequestInterceptionEnabled({enabled: true});
        // disable cache
        await Network.setCacheDisabled({cacheDisabled: true});
        // navigate to URL and wait for termination
        await delay(5000);
        await Page.navigate({url: 'https://sina.com.cn'});
        await Page.loadEventFired();
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}

function shallNotPass(request) {
    const {pathname} = url.parse(request.url);
    return pathname.match(/\.(css|png|svg)$/);
}


function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
