const chromeLauncher = require('chrome-launcher');const CDP = require('chrome-remote-interface');const fs = require('fs');const _ = require('underscore');const URL = require('url');// let headless = false;let headless = true;let chromeFlags = [];let isBlockRequest = false;if(headless){	chromeFlags.push('--headless');	chromeFlags.push('--disable-gpu');	// isBlockRequest = true;}const option = {	port: 9222,	chromeFlags};let chrome;chromeLauncher	.launch(option)	.then(chrome => {		start(chrome);	});async function start(chrome) {	let startTimestmap = Date.now();	let isSucc = true;	let client = await CDP();	let {Page,Network} = client;	try {		await Page.enable();		await Network.enable();		if(isBlockRequest){			let shallNotPass = (request)=>{			    const {pathname} = URL.parse(request.url);			    return pathname.match(/\.(css|png|svg|webp|jpeg|jpg|gif)$/);			};		    Network.requestIntercepted(({interceptionId, request}) => {		        // perform a test against the intercepted request		        let blocked = shallNotPass(request);		        if(blocked){			        console.log(`- ${blocked ? 'BLOCK' : 'ALLOW'} ${request.url}`);		        			        }		        // decide whether allow or block the request		        Network.continueInterceptedRequest({		            interceptionId,		            errorReason: blocked ? 'Aborted' : undefined		        });		    });						// enable request interception	        await Network.setRequestInterceptionEnabled({enabled: true});	        // disable cache	        await Network.setCacheDisabled({cacheDisabled: true});		}		// await search(client, '木鱼水心', '疯狂动物城');		let dict = getUperNameDict();		// await _.each(dict,async (url,name)=>{		// 	console.log(name);		// 	return await searchPage(client,name);		// });		let data = {};		for (let key in dict) {			let name = key;			// await searchPage(client,name);			let userData = await searchUper(client,name);			data[name] = userData			fs.writeFileSync('log.json',JSON.stringify(data));		}	}catch(e){		console.log('err:',e);		isSucc = false;	} finally {		await client.close();		if(isSucc){			let endTimestamp = Date.now();			console.log('elapsed time:',endTimestamp - startTimestmap);		}		console.log('close');		if(headless){			chrome.kill();		}	}}async function search(client, uperName, movieName) {	let page = client.Page;	let runtime = client.Runtime;	let spaceCode = dict[uperName];	if (!spaceCode) {		return new Promise((resolve, reject) => {			let err = 'no such uperName';			return resolve(err);		});	}	let url = `${bSiteSpaceUrl}${spaceCode}video?keyword=${movieName}`;	console.log(url);	await page.navigate({		url	});	await page.loadEventFired();	// await (() => {	// 	return new Promise((resolve) => {	// 		setTimeout(() => {	// 			return;	// 		}, 6000);	// 	});	// })();	// await timeout(5000);	// await wait(runtime,"#submit-video-list .small-item");	// await wait(runtime,"#dba");	let {result:{value:isAppear}} = await nodeAppears(client, "#submit-video-list .small-item2");	// runtime返回的数据格式如下	// {	// 	result:{	// 		type:string;	// 		value:any	// 	}	// }	console.log('isAppear', isAppear);	// await nodeAppears(client, ".small-item");	console.log('after nodeAppears');	await capture(page);	console.log('mid last')	return await new Promise((resolve) => {		console.log('complete inner');		resolve('complete');	});}async function capture(page) {	const {		data	} = await page.captureScreenshot();	fs.writeFileSync('screen.png', Buffer.from(data, 'base64'));}function delay(ms) {	return new Promise((resolve) => {		setTimeout(resolve, ms);	});}async function nodeAppears(client, selector, maxTimeout = 5000) {	console.log('nodeAppears',selector);	// browser code to register and parse mutations	var browserCode = (selector,maxTimeout) => {		return new Promise(resolve=>{			// 200毫秒探测一次			let interval = 200;			let elapsed = 0;			let t = setInterval(()=>{				let node = document.querySelector(selector);				if(node){					console.log({node});					clearInterval(t);					resolve(true);					return;				}				elapsed+=interval;				if(elapsed>=maxTimeout){					clearInterval(t);					resolve(false);					return;				}			},interval);		});		return new Promise((fulfill, reject) => {			// 本来就存在			if(document.querySelector(querySelector)){				fulfill(true);				return;			}			console.log(maxTimeout);			console.log(new Date());			// 超时设置			let t = setTimeout(() => {				console.log('out time:',new Date());				fulfill(false);			}, maxTimeout);			// 观察者			new MutationObserver((mutations, observer) => {				// add all the new nodes				const nodes = [];				mutations.forEach((mutation) => {					nodes.push(...mutation.addedNodes);				});				// fulfills if at least one node matches the selector				nodes.some(node => {					if (node.matches && node.matches(selector)) {						console.log(node, selector);						fulfill(true);						clearTimeout(t);						return true;					}				});				// if (nodes.find((node) => node.matches(selector))) {				// 	observer.disconnect();				// 	fulfill();				// }			}).observe(document.body, {				'childList': true,				'subtree': true			});		});	};	// inject the browser code	const {		Runtime	} = client;	return await Runtime.evaluate({		expression: `(${browserCode})(${JSON.stringify(selector)},${maxTimeout})`,		awaitPromise: true	});}// 木鱼水心的影评地址// http://space.bilibili.com/927587#!/channel/detail?cid=9860async function fetchInfo(client,browserCode){	const {Runtime} = client;	let result = await Runtime.evaluate({		expression:`(${browserCode})()`,		// awaitPromise: true	});	// console.log('result',result);	// fs.writeFileSync('log.json',result.result.value);	return result;}// 获取up主的空间信息// 此处的代码可以当成在浏览器的代码,因为这个代码会被嵌到runtime中去function fetchUper(){	let nodes = document.querySelectorAll('.small-item');	let result = [...nodes].map(node=>{		let imgUrl = node.querySelector('a.cover img').getAttribute('src');		let videoUrl = node.querySelector('a.title').getAttribute('href');		let name = node.querySelector('a.title').innerHTML;		let a0 = node.querySelector('a.cover');		let ret = {			name,			videoUrl,			imgUrl		};		// console.log(ret);		return ret;	});	return JSON.stringify(result);}// function fetchPageCount(maxTimeout=2000){// 	let nodes = document.querySelectorAll('.sp-pager .sp-pager-item');// 	let lastNode = nodes.length?nodes[nodes.length-1]:undefined;// 	console.log({lastNode});// 	let ret = lastNode ? lastNode.querySelector('a').innerHTML-0 : undefined;// 	return ret;// }async function fetchPageCount(client,maxTimeout=2000){	let {Runtime} = client;	let browserCode = (maxTimeout)=>{		let selector = '.sp-pager .sp-pager-item a';		let interval = 200;		let elapsed = 0;		let pageCount = undefined;		return new Promise(resolve=>{			let t = setInterval(()=>{				let nodes = document.querySelectorAll(selector);				if(nodes && nodes.length){					let lastNode = nodes[nodes.length-1];					let count = lastNode.innerHTML-0;					// console.log(lastNode.innerHTML);					// console.log({count});					if(count === pageCount){						clearInterval(t);						resolve(pageCount);					}else{						pageCount = count;					}				}				elapsed += interval;				if(elapsed>=maxTimeout){					clearInterval(t);					resolve(pageCount);				}			},interval);		});	};	let result = await Runtime.evaluate({		expression:`(${browserCode})(${maxTimeout})`,		awaitPromise: true	});	return result;}// pageIndex从0开始// page从1开始async function searchPage(client,uperName,pageIndex=0){	let {Page} = client;	let url = getUrlByUperName(uperName).replace(/PAGE_HOLDER/,pageIndex+1);	// url = 'http://www.baidu.com';	console.log(url);	await Page.enable();	// Page.reload({ignoreCache:true});	await Page.navigate({url});	await Page.loadEventFired();	console.log('after loadEventFired');	// 等待	// 一直追到img,这样去节约"延迟"	let {result:{value:isAppear}} = await nodeAppears(client, ".small-item a.cover img",10*1000);	console.log({isAppear});	if(isAppear){		// await delay(5000);		let info = await fetchInfo(client,fetchUper);		await client.close();		return info;	}	console.log('searchPage:page fail');	throw 'page fail';}// 查询async function searchUper(client,uperName){	let {Page} = client;	let url = `${getUrlByUperName(uperName)}`;	let data = readData(uperName);	await Page.navigate({url});	await Page.loadEventFired();	// 找到总共的页数	let pageCount;	{		// let {result:{value:isAppear}} = await nodeAppears(client, ".sp-pager .sp-pager-item",10000);		// console.log({isAppear});		// if(isAppear){		// 	await delay(1000);		// 	let result = await fetchInfo(client,fetchPageCount);		// 	pageCount = result.result.value;		// }else{		// 	pageCount = 1;		// }		let result = await fetchPageCount(client);		pageCount = result.result.value;		// 这个是因为这个连接是保证存在的，所以1就是它本身		pageCount = pageCount || 1;	}		try{		let temp = [];		for(let i=0;i<pageCount;i++){			console.log(i);			let target = await CDP.New();			let cli = await CDP(target);			let result = await searchPage(cli,uperName,i);			// console.log(result);			let arr =JSON.parse(result.result.value);			// 检查是不是已经是被录入了			// flag表示需要搜索下一页			let flag = true;			arr.some(n=>{				let ret = data.find(d=>d.name == n.name);				if(ret){					flag = false;					return true;				}else{					temp.push(n);				}			});			if(!flag){				break;			}		}		console.log(temp);		data = [].concat(temp,data);		// await Promise.all(arr);		return data;	}	catch(e){		console.log('in searchUper err:',e);		throw e;	}}function getUrlByUperName(uperName){	let dict =getUperNameDict();	return dict[uperName];}function getUperNameDict(){	let dict = {		'电影小镇':'http://space.bilibili.com/51149308#!/channel/detail?cid=17601&page=PAGE_HOLDER',		'谷阿莫':'http://space.bilibili.com/8578857#!/video?order=0&page=PAGE_HOLDER',		'木鱼水心':'http://space.bilibili.com/927587#!/channel/detail?cid=8536&order=0&page=PAGE_HOLDER',		'刻薄影评':'http://space.bilibili.com/74988157#!/channel/detail?cid=5145&page=PAGE_HOLDER',		'亚食人':'http://space.bilibili.com/80304#!/video?order=0&page=PAGE_HOLDER'	};	return dict;}let dataCache;let dataTimestamp;let dataCacheTimeout = 8*60*60*1000;function readData(uperName){	let path = 'log.json';	if(!fs.existsSync(path)){		fs.writeFileSync(path,'{}','utf-8');	}	let now = Date.now();	if(!dataCache || now-dataTimestamp >= dataCacheTimeout){		dataCache = JSON.parse(fs.readFileSync('log.json','utf-8'));		dataTimestamp = now;	}	return dataCache[uperName]||[];}