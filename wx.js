// export let wx = 123;
const URL = require('url');
const delay = require('./delay');
const wait = require('./wait');
const fs = require('fs');

async function fetchSingleNovel(client, url) {
    let {
        Page,
        Runtime
    } = client;

    console.log(url);
    // return;
    // let myurl = url.replace(/PAGE_HOLDER/,1);
    await Page.navigate({
        url
    });
    await Page.loadEventFired();
    // await delay(5000);

    // 获取标题
    // await wait(client,'h4');
    let title = await fetch(client, fetchTitle);
    console.log({
        title
    });


    // 拿到所有的页码
    // await wait(client,'.pages a input[type="text"]');
    let pageCount = await fetch(client, fetchPageCount);
    console.log({
        pageCount
    });

    // 获取作者
    let author = await fetch(client, fetchAuthor);
    console.log({
        author
    });

    // 获取内容
    // await wait(client,'.t2 .r_two b');
    let urlParam = URL.parse(url);
    let tid = url.match(/(\d+)\.html/)[1];
    formatUrl = `${urlParam.protocol}//${urlParam.hostname}/read.php?tid=${tid}&page=PAGE_HOLDER`;
    console.log({
        formatUrl
    });
    // return;
    // https://ss.postcc.us/read.php?tid=2672573&fpage=0&toread=&page=5
    let content = [];

    // 优化1-放弃
    // pageCount是不可能超过15页的，

    for (let i = 0; i < pageCount; i++) {
        let myurl = i==0 ? url : formatUrl.replace(/PAGE_HOLDER/, (i + 1));
        console.log({
            myurl
        });
        await Page.navigate({
            url: myurl
        });
        await Page.loadEventFired();
        // try{
        //     await wait(client,'.tpc_content');
        // }finally{
        let cont = await fetch(client, fetchContent, {
            author
        });

        let arr = JSON.parse(cont);
        content.push(...arr);
        // }

        // 优化2
        // 如果这页没有发现author的回帖，就认为小说已经完结
        if(!arr.length){
            break;
        }
    }
    // console.log({content});

    return {
        title,
        author,
        content: content.join('\r\n')
    };
}

function fetchTitle() {
    let title = document.querySelector('h4').innerHTML;
    title = title
        .replace(/&nbsp/g,' ')
        .replace(/\\/g,'_');
    return title;
}


function fetchPageCount() {
    let selector = '.pages a input[type="text"]';
    let [, count] = document.querySelector(selector).getAttribute('value').split('/');
    return count;
}

function fetchAuthor() {
    let selector = '.t2 .r_two b';
    let author = document.querySelector(selector).innerHTML;
    return author;
}

function fetchContent(opts) {
    let {
        author
    } = opts;
    // console.log(Date.now());
    // return author;


    let ret = [];
    let nodes = document.querySelectorAll('.t2');
    for (let i = 0; i < nodes.length; i++) {
        // console.log(i);
        // continue;

        let no = nodes[i];
        let currAuthor = no.querySelector('.r_two b').innerHTML;
        console.log({
            currAuthor,
            author
        });
        if (currAuthor == author) {
            let cont = no.querySelector('.tpc_content').innerHTML;
            // if (cont.length >= 20) {
                ret.push(cont);
            // }
        }
    }

    ret = ret.map(n=>{
        return n
            .replace(/<br\/?>/g, '\r\n')
            .replace(/&nbsp/g,' ');
    });

    return JSON.stringify(ret);
}


async function fetch(client, method, opts) {
    let {
        Runtime
    } = client;
    let wrapMethod = (method, str) => {
        let opts = str === undefined ? undefined : JSON.parse(str);
        return new Promise(resolve => {
            let ret = method(opts);
            // console.log(ret);
            resolve(ret);
        });
    };

    // 两次stringify
    // 第一次为了转字符串
    // 第二次为了套上引号

    let optsStr = JSON.stringify(opts);
    // console.log(optsStr);
    let exp = `(${wrapMethod})((${method}),${JSON.stringify(optsStr)})`;
    // console.log(exp);
    let {
        result: {
            value: value
        }
    } = await Runtime.evaluate({
        expression: exp,
        awaitPromise: true
    });

    return value;
}


async function fetchList(client, url) {
    const {
        Page
    } = client;
    
    let ret = [];

    // 获取页码
    await Page.navigate({url});
    await Page.loadEventFired();
    let pageCount = await fetch(client,fetchPageCount);
    console.log({pageCount});

    // https://ss.postcc.us/thread0806.php?fid=20
    // https://ss.postcc.us/thread0806.php?fid=20&search=&page=2
    // 找到每页的链接
    for (let i = 0; i < pageCount; i++) {
        let currUrl = `${url}&page=${i+1}`;
        await Page.navigate({url:currUrl});
        await Page.loadEventFired();
        let data = await fetch(client,fetchUrlList);
        // console.log({data});
        data = JSON.parse(data);
        ret.push(...data);
    }

    let urlParam =URL.parse(url);
    ret = ret.map(n=>`${urlParam.protocol}//${urlParam.hostname}/${n}`);

    return ret;
}

function fetchUrlList(){
    let ret = [];
    let nodes = document.querySelectorAll('tr.tr2,tr.tr3.tac');
    console.log(nodes);
    let index=-1;
    for (var i = 0; i < nodes.length; i++) {
        let node = nodes[i];
        if(node.className.indexOf('tr2')>=0){
            index = i;
        }
    }
    console.log({index});

    for (var i = index+1; i < nodes.length; i++) {
        let node = nodes[i];
        let url = node.querySelector('td a').getAttribute('href');
        ret.push(url);
    }

    return JSON.stringify(ret);
}

function processData(data){
    fs.writeFileSync(`novel/${data.title}.txt`,data.content,'utf-8');
}

let basicUrl = 'https://ss.postcc.us/thread0806.php?fid=20';


let wx = {
    basicUrl,
    fetchSingle:fetchSingleNovel,
    fetchList,
    processData
};

module.exports = wx;







