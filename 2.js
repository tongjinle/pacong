async function t1() {
	throw 'err';
	// return 14;
	// return await 12;
	// return await d1();
}

function d1() {
	return new Promise((resolve, reject) => {
		resolve(2);
	});
}

// t1()
// .then(function(data){
// 	console.log(data);
// },function(err){
// 	console.log('myerr',err);
// });



async function t2() {

	// return 0;
	await 1;
	// return await 2;
	// await new Promise(resolve=>resolve(4));
}

// t2().then(d=>{
// 	console.log(d);
// });

// async函数最后returned回来的值,是被包裹在一个promise中
// eg: return 0;

async function timeout(ms) {
	return await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

async function asyncPrint(value, ms) {
	let a = await timeout(ms);
	console.log(value);
	console.log(a);
	return a;
}

// asyncPrint('hello world', 2000).then(d=>{
// 	console.log(d);
// });



function delay(ms, str) {
	return new Promise((resolve) => {
		setTimeout(() => {
			console.log(str);
			resolve('complete');
		}, ms);
	});
}

async function delay2() {
	return 123321;
}


async function test() {
	await delay(1000, 'h');
	await delay(1000, 'e');
	await delay(1000, 'l');
	await delay(1000, 'l');
	// await delay(1000, 'o');
	// return await delay2();
	return delay(1000, 'o');
}

test()
	.then(d => {
		console.log(d);
	})

.then(() => {
		return new Promise((resolve) => {
			resolve(123);
		});
	})
	.then(d => {
		console.log(d);
	});