var  http = require("http");
var  fs = require('fs');
var  url = require("url");
var  mime = require('mime');
var  io = require('socket.io-client');
var  CryptoJS = require('cryptojs');
var messageCompress = require('../../../support/client/lib/messageCompress').messageCompress;
var async = require('async');
var GUID = require('node-uuid').v4;
global.appPath = "/adl/sandbox"		
var EncryptPassword = function (password, username,salt)
	{
		console.log(password,username,salt);
		var unencrpytedpassword = password + username + salt;
		for (var i = 0; i < 1000; i++)
		{
			unencrpytedpassword = CryptoJS.Crypto.SHA256(unencrpytedpassword) + '';
		}
		
		return unencrpytedpassword;
	}

function LaunchAvatar(username_in,password_in,server_in,port_in,session_in)
{
	var username = username_in;
	var passwordHASH;
	var password = password_in;
	var session = session_in;
	var socket;
	var socketid;
	var server = server_in;
	var port = port_in;
	var currenttime = 0;
	
	// some #defines for readability
	var UP =0;
	var DOWN = 1;
	var salt;
	
	process.on('exit', function() {
	  
	  socket.disconnect();
	});
	
	
	var stdin = process.openStdin();
	stdin.on('data', function(chunk) {
		if(!chunk) return;
		
		
		chunk = chunk + '';
		chunk = chunk.replace(/\r\n/g,'');
		
		if(chunk == 'quit')
			process.exit();
	});
	console.log('Launching Avatar at ' + server +':'+port+' with username: ' + username +' and password: ' + password+' in world '+session);
	
	//quick macro to send a message
	function send(data)
	{
		//console.log(data);
		socket.emit('message',messageCompress.pack(JSON.stringify(data)));	
	}
	function RandomTurn()
	{
		console.log("Randonturm");
		var keyevent = {"time": currenttime,
		"node": "character-vwf-" + username,
		"action": "callMethod",
		"member": 'lookat',   //key up or key down
		"parameters": [
			[[
				Math.random(),Math.random(),0
			]]
		],
		"client": socketid}
		send(keyevent);		
	}
	//generate a key event and send it
	// State is either UP or DOWN, key is a char
	function KeyEvent(state,key)
	{
		
		key = key.toUpperCase()[0];
		
		//the proper keyevent message
		var keyevent = {"time": currenttime,
		"node": "index-vwf",
		"action": "dispatchEvent",
		"member": (state == UP ? 'keyUp' :  'keyDown'),   //key up or key down
		"parameters": [
			[
				{
					"keysDown": {},
					"mods": {
						"alt": false,
						"shift": false,
						"ctrl": false,
						"meta": false
					},
					"keysUp": {}
				}
			],
			null
		],
		"client": socketid}
	  
	  
		keyevent.parameters[0][0][state == UP ? 'keysUp' :  'keysDown'][key] = {
							"key": key,
							"code": key.charCodeAt(0),
							"char": key
						}
		//send the event				
		//console.log('send key');
		send(keyevent);		

	}


	var mouseevent  = {"time":5.799999999999987,"node":"index-vwf","action":"dispatchEvent","member":"pointerMove","parameters":[[{"button":"right","clicks":1,"buttons":{"left":false,"middle":false,"right":true},"modifiers":{"alt":false,"ctrl":false,"shift":false,"meta":false},"position":[0.37105263157894736,0.20229405630865485],"screenPosition":[705,194]}],{"":[{"distance":0.25039778107183475,"globalPosition":[null,null,null],"globalNormal":[0,0,1],"globalSource":[1.202807068824768,-3.8025035858154297,-3.8025035858154297]}],"box2-vwf-9d1cb46-c41b-e63-1ac-8fb9a3f7f073":[{"source":{"0":-1.5917856693267822,"1":5.0322041511535645,"2":-5.0322041511535645},"distance":0.25039778107183475,"globalSource":[1.202807068824768,-3.8025035858154297,-3.8025035858154297]}]}],"client":"wRI1voo6_Fp_h5ZMYXrM"};
	
	function startMouseTest()
	{
		send(mouseevent);
		console.log('mouseevent');
		setTimeout(startMouseTest,20);
	}
    function startBandwidthTest() {
    	
        async.forever(function(cb) {

            http.request('http://' + server + ':' + port + '/adl/sandbox/vwf.js', function(response) {

                
                var str = '';
                //the whole response has been recieved, so we just print it out here
                response.on('end', function() {
                	console.log('downloaded');
                	setTimeout(cb,Math.random() * 10000)
                	    
                });
                
                 //another chunk of data has been recieved, so append it to `str`
				  response.on('data', function (chunk) {
					str += chunk;
				  });

            }).end();

        }, function(e) {
            console.log(e);
        })

    }
	//once the entire login procedure is done, we can start sending commands over the socket
	worldLoginComplete = function(response) {

		
		
		//we are finally done logging in, so let's send the avatar object over the socket to be created
		//The object below is the proper defination of an avatar
		var component = 	
        {
            "time": 0,
            "node": "index-vwf",
            "action": "createChild",
            "member": username,
            "parameters": [{
                    "extends": "character.vwf",
                    "source": "./avatars/VWS_Business_Male2.DAE",
                    "type": "subDriver/threejs/asset/vnd.collada+xml",
                    "properties": {
                        "PlayerNumber": username,
                        "isDynamic": true,
                        "castShadows": true,
                        "receiveShadows": true,
                        "activeCycle": [],
                        "standingOnID": null,
                        "standingOnOffset": null,
                        "___physics_activation_state": 4,
                        "___physics_deactivation_time": 0,
                        "___physics_velocity_linear": [0, 0, 0],
                        "___physics_velocity_angular": [0, 0, 0],
                        "___physics_factor_linear": [0, 0, 0],
                        "___physics_factor_angular": [0, 0, 0],
                        "___physics_enabled": true,
                        "___physics_mass": 100,
                        "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, Math.random() * 5, Math.random() * 5, 0, 1],
                        "cycles": {
                            "stand": {
                                "start": 1,
                                "length": 0,
                                "speed": 1.25,
                                "current": 0,
                                "loop": true
                            },
                            "walk": {
                                "start": 6,
                                "length": 27,
                                "speed": 1,
                                "current": 0,
                                "loop": true
                            },
                            "straferight": {
                                "start": 108,
                                "length": 16,
                                "speed": 1.5,
                                "current": 0,
                                "loop": true
                            },
                            "strafeleft": {
                                "start": 124,
                                "length": 16,
                                "speed": -1.5,
                                "current": 0,
                                "loop": true
                            },
                            "walkback": {
                                "start": 0,
                                "length": 30,
                                "speed": -1.25,
                                "current": 0,
                                "loop": true
                            },
                            "run": {
                                "start": 70,
                                "length": 36,
                                "speed": 1.25,
                                "current": 0,
                                "loop": true
                            },
                            "jump": {
                                "start": 70,
                                "length": 36,
                                "speed": 1.25,
                                "current": 0,
                                "loop": false
                            },
                            "runningjump": {
                                "start": 109,
                                "length": 48,
                                "speed": 1.25,
                                "current": 0,
                                "loop": false
                            }
                        },
                        "materialDef": {
                            "color": {
                                "r": 1,
                                "g": 1,
                                "b": 1
                            },
                            "ambient": {
                                "r": 1,
                                "g": 1,
                                "b": 1
                            },
                            "emit": {
                                "r": 0.27058823529411763,
                                "g": 0.2549019607843137,
                                "b": 0.2549019607843137
                            },
                            "specularColor": {
                                "r": 0.2,
                                "g": 0.2,
                                "b": 0.2
                            },
                            "specularLevel": 1,
                            "alpha": 1,
                            "shininess": 0,
                            "side": 0,
                            "reflect": 0,
                            "layers": [{
                                "mapTo": 1,
                                "scalex": 1,
                                "scaley": 1,
                                "offsetx": 0,
                                "offsety": 0,
                                "alpha": 1,
                                "src": "./avatars/VWS_B_Male2-3.jpg",
                                "mapInput": 0
                            }],
                            "type": "phong",
                            "depthtest": true,
                            "morphTargets": true
                        },
                        "standing": 0,
                        "owner": username,
                        "ownerClientID": socket.id,
                        "profile": {
                            "Username": username,
                            "Email": "rchadwic@gmail.com",
                            "Avatar": "usmale.dae",
                            "Salt": "bfcd9933-faae-74e9-3715-893021c71340",
                            "inventoryKey": "eccb29cf-c98f-410d-ab10-6d428a1a5b30",
                            "id": "Rob"
                        },
                        "scale": [1, 1, 1]
                    },
                    "events": {
                        "ShowProfile": null,
                        "Message": null
                    },
                    "scripts": ["this.ShowProfile = function(){if(vwf.client() != vwf.moniker()) return; _UserManager.showProfile(this.ownerClientID)     }; \nthis.Message = function(){if(vwf.client() != vwf.moniker()) return; setupPmWindow(this.ownerClientID)     }"],
                    "children": {
                        
                        
                    }
                },
                null
            ]
        };
        component.parameters[0].children[GUID()] =  {
                            "extends": "box2.vwf",
                            "source": "vwf/model/threejs/box.js",
                            "type": "subDriver/threejs",
                            "properties": {
                                "___physics_activation_state": 1,
                                "___physics_deactivation_time": 0,
                                "___physics_velocity_linear": [0, 0, 0],
                                "___physics_velocity_angular": [0, 0, 0],
                                "DisplayName": "CharacterCollision",
                                "_length": 0.8,
                                "height": 1.54,
                                "isSelectable": false,
                                "owner": username,
                                "transform": [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0.8009999394416809, 1],
                                "type": "Primitive",
                                "width": 0.62,
                                "visible": false,
                                "___physics_enabled": true
                            }
                        }
		//console.log('sending avatar');
		socket.emit('message',messageCompress.pack(JSON.stringify(component)));
		startBandwidthTest();
		startMouseTest();
	}

	//here, we handle incomming data from the server
	function OnMessage(data)
	{
		
		data = JSON.parse(messageCompress.unpack(data));
		//console.log(data);
		//keep track of the server time pulse
		currenttime = data.time;
		if(data.instance && data.instance != session.replace(/\//g,'_'))
		{
			console.log('GOT MESSAGE FROM WRONG INSTANCE');
			process.exit();
		}
		//if we are keeping track of state and the server requests it, send it
		if(data.action == 'getState')
		{
			//send({action:'getState','parameters':[],'result':{nodes:[global.state],queue:[]} || {}});
		}
		//if the server sends is world state, keep track of it
		if(data.action == 'createNode')
		{
			global.state = data.parameters[0];
			//console.log(global.state);
		}
		if(data.action == 'createChild')
		{
			
			
			
			var childComponent = JSON.parse(JSON.stringify(data.parameters[0]));
			if(!childComponent) return;
			var childName = data.member;
			if(!childName) return;
			var childID = childComponent.id || childComponent.uri || ( childComponent["extends"] ) + "." + childName.replace(/ /g,'-'); 
			childID = childID.replace( /[^0-9A-Za-z_]+/g, "-" ); 
			if(!global.state.children)
			global.state.children={};
			global.state.children[childID] = childComponent;
		}
		if(data.action == 'setState')
		{
			global.state = data.parameters[0].nodes[0];
			console.log(global.state);
		}
		//Here is the real meat of the simulation.
		//This bot randomly hits the keys, and the avatar will move.
		if(data.action == 'tick')
		{
		
			
			//send a fake mouse event, to test server 
			
			var rnd = Math.floor(require('../cryptoRandom.js').random() * 100);
			if(rnd == 0)
			{
				KeyEvent(DOWN,'w');
			}
			if(rnd == 1)
			{
				KeyEvent(UP,'w');
			}
			if(rnd == 2)
			{
				KeyEvent(DOWN,'s');
			}
			if(rnd == 3)
			{
				KeyEvent(UP,'s');		
			}
			if(rnd == 4)
			{
				KeyEvent(DOWN,'z');
			}
			if(rnd == 5)
			{
				KeyEvent(UP,'z');
			}
			if(rnd == 6)
			{
				RandomTurn();
			}
			if(rnd == 7)
			{
				KeyEvent(UP,'c');
			}
		
		}
	}   //end onMessage

	//now that we know the session cookie, we can call the world login endpoint
	function connectSocket(cookie)
	{

	  //first, we connect the websocket to the server	
	  socket = io('http://'+server+':'+port+'/',{reconnection : false,transports:['websocket'],query:'pathname='+session});
	  
	  socket.on('connect',function()
	  {

	  	socket.emit('authenticate', {cookie:cookie});
		socketid = socket.id;
		socket.on('message', function (data) {
		OnMessage(data);
	  	});
		worldLoginComplete();


	  })


	  socket.connect();
	  //we need to know this so we can tell the server that the user with the given session cookie ownes the socket
	  
	  /*
	  console.log(socket);
	  //link up the handler for the incomming data
	  
	  
	  //now that we have set the socket to the world, tell the server that the user at the session cookie are the owner of this socket
	  socket.on('namespaceSet', function (data) {
		console.log(socket.socket.sessionid);
		
		//we now must use an http request to tell the server that 'we' own the socket.
		//'we' meaning the user logged into the client with the given session cookie
		//goto worldLoginComplete when done
		worldLoginComplete();//var req = http.request({hostname:server,port:port,method:'GET', path:global.appPath+'///vwfDataManager.svc/login?S='+session+'&CID=' + socket.socket.sessionid,headers:{cookie:cookie}}, worldLoginComplete).end();
	  });
	  //This is a special case for the simulated client
	  //we must ask the server to associate this websocket with a the given world
	  //when complete, the server will call namespaceSet
	  socket.emit('setNamespace', messageCompress.pack({ space: session }));
	 */
	  
	}

	
	//we get here after the client has submitted the username and pass properly to the server
	siteLoginComplete = function(response) {
	  var str = '';

	  //another chunk of data has been recieved, so append it to `str`
	  response.on('data', function (chunk) {
		str += chunk;
	  });

	  //the whole response has been recieved, so we just print it out here
	  response.on('end', function () {
		console.log(str);
		
		//this is the session cookie for the client. It identifies that this client has session on the server
		console.log(response.headers['set-cookie']);
			
		//the server sends a session ID to the client. We need to remember this to log into the world
		connectSocket(response.headers['set-cookie']);
	  });
	}

	//after we have the salt for the user, we can create the proper username/pass hash to log in
	saltRetreiveComplete = function(response) {
	  var str = '';

	  //another chunk of data has been recieved, so append it to `str`
	  response.on('data', function (chunk) {
		str += chunk;
	  });

	  //the whole response has been recieved, so we just print it out here
	  response.on('end', function () {
		console.log('salt: '+str);
		salt = str.trim();
		
		//create the proper hash for the pass, and try to loging this client to the server
		//when complete, goto siteLoginComplete
		passwordHASH = EncryptPassword(password,username,salt);
		//http.request('http://'+server+':'+port+'/login?UID='+username+'&P='+passwordHASH, siteLoginComplete).end();

		var payload = {};
			
			
			payload.username = username;
			payload.password = passwordHASH;
			

			var postdata = JSON.stringify(payload);
			
			var options = {
			 hostname : server,
			 port : port,
			 path : '/auth/local',
			 method: 'POST',
			 headers: {
		          'Content-Type': 'application/json; charset=UTF-8',
		          'Content-Length': postdata.length
		      }
			};

			var req = http.request(options, siteLoginComplete);
			req.write(postdata);
			req.end();

	  });
	}
	
	
	var postdata;
	function SignupPostCompete(response)
	{
	
		var str = '';

		  //another chunk of data has been recieved, so append it to `str`
		  response.on('data', function (chunk) {
			str += chunk;
		  });

		  //the whole response has been recieved, so we just print it out here
		  response.on('end', function () {
			console.log(str);
			//boot up the whole client, start by getting the hash for this user
			//when complete, goto saltRetreiveComplete
			http.request('http://'+server+':'+port+'/vwfDataManager.svc/salt?UID='+username, saltRetreiveComplete).end();





		  });
		  
	
	
	}
	
	function Signup()
	{
	
			var salt = GUID();
			var enc_password = EncryptPassword(password,username,salt);
			
			var profile = {};
			
			
			profile.Username = username;
			profile.Password = enc_password;
			profile.Avatar = 'usmale.dae';
			profile.Salt = salt;
			profile.Email = 'test@test.com'
			
			

			postdata = JSON.stringify(profile);
			
			var options = {
			 hostname : server,
			 port : port,
			 path : '/vwfDataManager.svc/CreateProfile?UID='+username+ "&P=" +enc_password,
			 method: 'POST',
			 headers: {
		          'Content-Type': 'application/json; charset=UTF-8',
		          'Content-Length': postdata.length
		      }
			};

			var req = http.request(options, SignupPostCompete);
			req.write(postdata);
			req.end();
			
			
	
	
	}
	Signup();
	
	

}

// -u is the username of the account to use
var p = process.argv.indexOf('-u');
var user = p >= 0 ? process.argv[p+1] : "test";

// -p is the pass
p = process.argv.indexOf('-p');
var password = p >= 0 ? process.argv[p+1] : "1111";

// -s the name of the server to connect to
p = process.argv.indexOf('-s');
var server = p >= 0 ? process.argv[p+1] : "localhost";

// -t is the port to use on the server
p = process.argv.indexOf('-t');
var port = p >= 0 ? process.argv[p+1] : "3000";
 
// -w is the UID of the world to attach to 
p = process.argv.indexOf('-w');
var world = p >= 0 ? process.argv[p+1] : "YLGSwHUNuviUx37r";

//launch the simulated client 
LaunchAvatar(user,password,server,port,global.appPath + "/" + world + "/");

process.on('message', function(m) {
  console.log('CHILD got message:', m);
  if(m == 'kill')
	process.exit();
});	

  
