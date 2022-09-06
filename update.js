const util = require('util');

//const exec = util.promisify(require('child_process').exec);
const exec = require('child_process').exec

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

const deploy = function(){

	console.log();
	console.log(new Date().toString());

	try{
//		exec('pm2 stop 0')
		
		exec('git pull', (err, stdin, stderr) => print(err, stdin, stderr))
		
		exec('./deploy', {cwd: '/home/ec2-user/server/client'}, (err, stdin, stderr) => {
			print(err, stdin, stderr)
//			exec('pm2 start 0')
		})

		// process called in express/src --> treat it as if your in that folder
		console.log("current directory: ", process.cwd());

	} catch(e){
		console.error(e);
	}

}

deploy()
