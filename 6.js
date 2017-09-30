const URL = require('url');

let dict = getUperNameDict();
for (let key in dict) {
	let name = key;
	// await searchPage(client,name);
	let link = dict[name];
	console.log(link);

	let myurl = URL.parse(link);
	console.log(myurl.query);
	console.log(myurl.hash);
	console.log(getHashParam(myurl));
}


function getUperNameDict(){
	let dict = {
		// '木鱼水心':'http://space.bilibili.com/927587#!/channel/detail?cid=9860'
		'木鱼水心':'http://space.bilibili.com/927587#!/channel/detail?cid=8536',
		'谷阿莫':'http://space.bilibili.com/8578857?from=search&seid=10061590049150792682#!/video'
	};
	return dict;
}

function getHashParam(url){
	let {hash}= URL.parse(url);
	let [basic,paramStr] = hash.split('?');
	let param = {};
	if(paramStr){
		let arr = paramStr.split('&');
		arr.forEach(n=>{
			let [key,value] = n.split('=');
			param[key] = value;
		});
	}
	return {basic,param};
}

function editHashParam(){}