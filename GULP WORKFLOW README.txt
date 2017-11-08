README

Node installation instructions can be found here: https://www.e2enetworks.com/help/knowledge-base/how-to-install-node-js-and-npm-on-centos/
Note - steps 1 and 2 will not be necessary once Brownrice includes node, npm and gulp on their servers by default.  Expect this by Dec 2017

Once all servers come with node.js and npm, skip to step 3

1. Get root access to site (contact Oban for permissions)

	Once ssh'd in as xynergy, run
    	# su root
	and enter the password.

	You can then change root's password via the passwd command.


2. Install nodeJs
	
	First we need to add yum repository of node.js to our system which is sourced from nodejs’ official website. Run the following commands in succession to add the yum repository.
		# yum install -y gcc-c++ make
		# curl -sL https://rpm.nodesource.com/setup_6.x | sudo -E bash -

	Now it’s time to install the node.js package and NPM package. Run the following command to do so. This single command will install node.js, npm and also other dependent packages.
		# yum install nodejs

	Having installed the packages, you need to check their versions.

	For checking node.js version:
		# node -v 
		v6.11.5
	
	For checking npm version:
		# npm -v 
		3.10.10

3. Install npm dependencies.  These are listed in the package.json file.  The first one is gulp, which tells NPM to install the latest version of gulp.  

	# npm install

4. Useful gulp tasks thus far written:
	
	# gulp
		gulp default task is used for development - 
		1. concatenates all js files into one output file, currently named 'sum-of-all.js'.
		2. compiles all "*.scss" into styles.css (styles.scss imports all other scss files we need, so this should be the one and only css file of ours we need to edit).
		3. concatenates all .css files into one output file, currently named 'sum-of-all.css'
		4. watches for changes to "*.scss" and "*.js".  If changes are detected, recompiles and concatenates the appropriate files.

	# gulp watch
		Just watches for changes without compiling or concatenating anything in advance.  Upon detecting changes, will recompile and concatenate as appropriate.

	# gulp dist
		meant for distribution.  Does not watch for changes (it's rather slow).  Concatenates, compiles, and uglifys (minifys) code, puts sum-of-all.min.js and sum-of-all.css into /dist folder.


Adding new js and css files to the build:
	In gulpfile.js you can add source files to the jsScripts and cssFiles arrays.  The order matters, so if something is dependent upon something else, add it afterwards.  Currently, there are no catchall *.js or *.css behaviors in there, but you can use gulp glob syntax (google it)) to define what files it pulls in, if you want to get get multiple files, similar to a regular expression.  You can also change the source and destination directories by editing the variables at the beginning of the file.  It's just a js file, so you can add all sorts of javascript processing, if you want.  

	The basics of how the tasks are defined is pretty simple.  This tutorial was useful to me: https://semaphoreci.com/community/tutorials/getting-started-with-gulp-js. 

