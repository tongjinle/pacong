// export let wx = 123;
const delay = require('./delay');
const URL = require('url');

async function wx(client,url){
    let {Page,Runtime} = client;

    console.log(url);
    // return;
    // let myurl = url.replace(/PAGE_HOLDER/,1);
    await Page.navigate({url});
    await Page.loadEventFired();
    // await delay(5000);

    // 获取标题
    let title = await fetch(client,fetchTitle);
    console.log({title});
    

    // 拿到所有的页码
    let pageCount = await fetch(client,fetchPageCount);
    console.log({pageCount});

    // 获取作者
    let author = await fetch(client,fetchAuthor);
    console.log({author});

    // 获取内容
    let urlParam = URL.parse(url);
    let tid = url.match(/(\d+)\.html/)[1];
    formatUrl = `${urlParam.protocol}//${urlParam.hostname}/read.php?tid=${tid}&page=PAGE_HOLDER`;
    console.log({formatUrl});
    // return;
    // https://ss.postcc.us/read.php?tid=2672573&fpage=0&toread=&page=5
    let content = [];
    for(let i=0;i<pageCount;i++){
        // break;
        let myurl = formatUrl.replace(/PAGE_HOLDER/,i);
        console.log({myurl});
        // let myurl = formatUrl.replace(/PAGE_HOLDER/,(i+1));
        await Page.navigate({url:myurl});
        await Page.loadEventFired();
        console.log({i});
        // continue;
        await delay(5000);
        let cont = await fetch(client,fetchContent,{author});
        content.push(...JSON.parse(cont));
    }
    // console.log({content});

    return {title,author,content:content.join('\r\n')};
}

function fetchTitle(){
    return document.querySelector('h4').innerHTML;
}


function fetchPageCount(){
    let selector = '.pages a input[type="text"]';
    let [,count] = document.querySelector(selector).getAttribute('value').split('/');
    return count;
}

function fetchAuthor(){
    let selector = '.t2 .r_two b';
    let author = document.querySelector(selector).innerHTML;
    return author;
}

function fetchContent(opts){
    let {author} = opts;
    // console.log(Date.now());
    // return author;


    let ret = [];
    let nodes = document.querySelectorAll('.t2');
    for(let i = 0;i<nodes.length;i++){
        // console.log(i);
        // continue;

        let no = nodes[i];
        let currAuthor = no.querySelector('.r_two b').innerHTML;
        console.log({currAuthor,author});
        if(currAuthor == author){
            let cont = no.querySelector('.tpc_content').innerHTML;
            cont = cont.replace(/<br\/?>/g,'\r\n');
            console.log('cont:',cont);
            if(cont.length>=20){
                ret.push(cont);
            }
        }
    }
    return JSON.stringify(ret);
}


async function fetch(client,method,opts){
    let {Runtime} = client;
    let wrapMethod = (method,str)=>{
        let opts = str === undefined ? undefined : JSON.parse(str);
        return new Promise(resolve=>{
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
    let {result:{value:value}} = await Runtime.evaluate({
        expression: exp,
        awaitPromise: true
    });

    return value;
}




module.exports = wx;
