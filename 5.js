
function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function delay2(ms){
	await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


async function main(){


	let arr = [];
	for(let i=0;i<10;i++){
		let fn = async()=>{
			await delay2(~~(Math.random()*1000));
			console.log(i);
		};
		arr.push(fn());

	}

	await Promise.all(arr);
	console.log('ok');
}


main();