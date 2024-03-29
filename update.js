const util = require('util');
const exec = util.promisify(require('child_process').exec);

const print = (err, stdout, stderr) => {
	if(err){
		console.log(`error: ${err.message}`);
		error = true;
		return;
	}
	if(stderr){
		console.log(`stderr: ${stderr}`);
		error = true;
	}
	console.log(`stdout: ${stdout}`);
}

(async function(){
	console.log();
	console.log(new Date().toString());

	try{
		await exec('git pull');	

		await exec('./deploy', {cwd: '/home/ec2-user/server/client'});


		// process called in express/src --> treat it as if your in that folder
		console.log("current directory: ", process.cwd());

	} catch(e){
		console.error(e);
	}

})();
