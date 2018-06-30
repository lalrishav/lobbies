var request = require('request');
var lobbies = [];
var steam   = require('steam-login');

function validatePosting(req,res,next){
	console.log(req.body);
	var lobbyInfo = req.body;
	var n = lobbies.length;
	if(lobbies.length >=3){
		if(lobbies[n-1].ip == lobbies[n-2].ip && lobbies[n-2].ip == lobbyInfo.ip && lobbies[n-1] == lobbyInfo.ip){
			res.json({"res":false,"msg":"Cannot post 3 lobby continously from same ip"})
		}
		else{
			next();
		}
	}else{
		next();
	}
}

module.exports = function(app,con){
	app.use(require('express-session')({ resave: false, saveUninitialized: false, secret: 'a secret' }));
	var isLoggedIn = function(req,res,next){
		if(req.user == null){
			req.flash("info","Not logged in")
			res.redirect("/")
		}else{
			next();
		}
	}
	app.use(steam.middleware({
	    realm: 'http://localhost:4200/', 
	    verify: 'http://localhost:4200/verify',
	    apiKey: "62C51431523877C2F948BD0FC86C8A4D"

	}));

	app.get('/authenticate', steam.authenticate(), function(req, res) {
	    res.redirect('/');
	});

	app.get("/getReferral",isLoggedIn,function(req,res){
		var steamid = req.user.steamid;
		con.query("SELECT * FROM referral_code WHERE steamid="+steamid,(err,result)=>{
			if(err)
				throw err;
			else{
				if(result.length == 0){
					res.json({"res":true,"isFound":false});
				}
			}
		})
	})

	app.get('/verify', steam.verify(), function(req, res) {
		console.log(req.user._json.steamid);
		con.query("SELECT COUNT(*) AS count FROM users WHERE steamid="+req.user._json.steamid,(err,result,fields)=>{
			if(err)
				throw err
			else{
				if(result[0].count == 0){
					var sql = "INSERT INTO `csgopeer`.`users` (`steamid`, `username`, `profileUrl`) VALUES ?"
					var values = [[req.user._json.steamid,req.user.username,req.user.profile]];
					con.query(sql,[values],function(err,result){
						if(err)
							throw err
						else{
							req.flash("info","Welcome to csgopeer for the first time.Continue enjoyin our services")
							res.redirect("/dashboard")
						}
					})
				}else{
					req.flash("info","Welcome back!!You have been successfully logged in")
					res.redirect("/dashboard")
				}
			}
		})
    	
	});

	var cnt = 0;
	app.get("/",(req,res)=>{
		cnt++;
		res.render("index")
	})

	app.get("/getCount",(req,res)=>{
		res.json(cnt);
	})

	app.post("/postLobby",validatePosting,(req,res)=>{
		req.body.time = new Date();
		lobbies.push(req.body);
		res.json({"res":true})
	})

	app.get("/getLobbies",(req,res)=>{
		console.log(lobbies)
	})

	app.get("/findNearestLobby",function(req,res){
		var info = req.body;

	})

	app.get("/getLobby",function(req,res){
		res.json({"res":lobbies})
	})

	app.get("/dashboard",(req,res)=>{
		var info = req.flash("info");
		var pageInfo = {}
		pageInfo.info = info;
		res.render("dashboard",pageInfo)
		
		/*console.log(req.user);
		var ip = req.connection.remoteAddress;
		if(lobbies.length == 0){
			res.render("findMates")
		}
		else{
			var address = request("https://api.ipdata.co/8.8.8.8",(err,response,body)=>{
				var json = JSON.parse(body);
				var country = json.country_name;
				var continent = json.continent_code;
				var lat = json.latitude;
				var long = json.longitude;
				var language = [];
				for(var i=0;i<json.languages.length;i++){
					languages.push(json.languages[i].name)
				}

			})
		}*/
		
	})
}