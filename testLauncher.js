const chromeLauncher = require('chrome-launcher');
const CDP = require('chrome-remote-interface');
const fs = require('fs');

const option = {
	port: 9222,
	chromeFlags: [
		'--headless'
	]
};

let chrome;
chromeLauncher.launch(option)
	.then(async chrome=>{
		console.log('mid');
		start(chrome);
	})



function start(chrome) {
	CDP(async(client) => {
		let page = client.Page;
		try {
			await page.enable();
			await search(client, '木鱼水心', '长发公主');
		} finally {
			await client.close();
			console.log('close');
			chrome.kill();
		}
	});
}

const bSiteSpaceUrl = 'https://space.bilibili.com/';
const dict = {
	'木鱼水心': '927587#!'
};

async function search(client, uperName, movieName) {
	let page = client.Page;
	let runtime = client.Runtime;

	let spaceCode = dict[uperName];
	if (!spaceCode) {
		return new Promise((resolve, reject) => {
			let err = 'no such uperName';
			return resolve(err);
		});
	}
	let url = `${bSiteSpaceUrl}${spaceCode}video?keyword=${movieName}`;
	console.log(url);
	await page.navigate({
		url
	});
	await page.loadEventFired();
	// await (() => {
	// 	return new Promise((resolve) => {
	// 		setTimeout(() => {
	// 			return;
	// 		}, 6000);
	// 	});

	// })();
	// await timeout(5000);
	// await wait(runtime,"#submit-video-list .small-item");
	// await wait(runtime,"#dba");
	await nodeAppears(client, ".small-item");
	console.log('after nodeAppears');
	await capture(page);
	console.log('mid last')
	return await new Promise((resolve)=>{
		console.log('complete inner');
		resolve('complete');
	});
}

async function capture(page) {
	const {
		data
	} = await page.captureScreenshot();
	fs.writeFileSync('screen.png', Buffer.from(data, 'base64'));

}

function timeout(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}




async function nodeAppears(client, selector) {
	// browser code to register and parse mutations
	const browserCode = (selector) => {
		return new Promise((fulfill, reject) => {
			new MutationObserver((mutations, observer) => {
				// add all the new nodes
				const nodes = [];
				mutations.forEach((mutation) => {
					nodes.push(...mutation.addedNodes);
				});
				// fulfills if at least one node matches the selector
				nodes.some(node=>{

					if(node.matches && node.matches(selector)){
						console.log(node,selector);
						fulfill();
						return true;
					}
				});
				// if (nodes.find((node) => node.matches(selector))) {
				// 	observer.disconnect();
				// 	fulfill();
				// }
			}).observe(document.body, {
				'childList': true,
				'subtree': true
			});
		});
	};
	// inject the browser code
	const {
		Runtime
	} = client;
	await Runtime.evaluate({
		expression: `(${browserCode})(${JSON.stringify(selector)})`,
		awaitPromise: true
	});
}