async function a1() {
	return new Promise(resolve=>{
		setTimeout(()=>{
			console.log(new Date());
			resolve();
		},2000);
	});
}

async function a2() {
	await a1();
	throw 'err';
	await a1();
}

async function main() {
	try {
		await a1();
		await a2();
	} catch (e) {
		console.log('myerr:', e);
	} finally {
		console.log('end');

	}
}


main();