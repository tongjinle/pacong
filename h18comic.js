let fetch = require('./fetch');
let delay = require('./delay');
let request = require('request');
let fs = require('fs');

// let basicUrl = 'http://18h.animezilla.com/manga/2797';
let basicUrl = 'http://18h.animezilla.com/manga/2785';
// http://18h.animezilla.com/manga/2785
let title = '姦熟乙女的脅迫法';
async function fetchList(client, url) {
    let ret = [];

    let {
        Page
    } = client;

    await Page.navigate({
        url
    });
    await Page.loadEventFired();

    await delay([3000, 6000]);
    // title = await fetch(client,fetchTitle);
    let pageCount = await fetch(client, fetchPageCount);
    console.log({
        pageCount
    });
    for (var i = 0; i < pageCount; i++) {
        ret.push(i == 0 ? url : url + '/' + (i + 1));
    }
    return ret;
}

async function fetchSingle(client, url) {
    let {
        Page
    } = client;

    await Page.navigate({
        url
    });
    await Page.loadEventFired();

    await delay([1500, 3000]);
    let imgUrl = await fetch(client, fetchImg);
    let match = url.match(/\/\d+\/(\d+)$/);
    let index = match == null ? 1 : match[1];
    return {
        imgUrl,
        index
    };
}

function processData(data) {
    let {
        index,
        imgUrl
    } = data;
    let path = `./comic/${title}-${index}.jpg`;
    let opts = {
        url:imgUrl,
        headers:{
            'User-Agent': 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8; en-US) AppleWebKit/534.2 (KHTML, like Gecko) Chrome/6.0.453.1 Safari/534.2',
            'Referer': 'http://18h.animezilla.com'
        }
    }


    request(opts)
    .on('error',function(err){
        console.log(err);
        throw err;
    })
    .pipe(fs.createWriteStream(path));
}


function fetchPageCount() {
    let href = document.querySelector('a.last').getAttribute('href');
    console.log({
        href
    });
    let ret = href.match(/\/(\d+)$/)[1];
    return ret;
}

function fetchTitle() {
    let title = document.querySelector('.entry-title').innerHTML;
    return title;
}

function fetchImg() {
    let imgUrl = document.querySelector('#comic').getAttribute('src');
    return imgUrl;
}


let script = {
    basicUrl,
    fetchSingle,
    fetchList,
    processData
};

module.exports = script;