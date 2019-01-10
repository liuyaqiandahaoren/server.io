'use strict';
var app = require('express')();
// var mysql = require('mysql');
var http = require('http').Server(app);
var io = require('socket.io')(http);
// mysql连接池的定义
// var pool = mysql.createPool({
// 	host : "127.0.0.1",
// 	user : "root",
// 	password: "123456",
// 	database: 'gatdzyw',
//     port: 3306
// });
// var query=function(sql,callback){
// 	pool.getConnection(function(err,conn){
//         if(err){
//             throw err;
//         }else{
//             conn.query(sql,function(res,vals,fields){
//                 //释放连接
//                 conn.release();
//                 //事件驱动回调
//                 callback(res,vals,fields);
//             });
//         }
//     });
// };
// query(" select * from yw_user ",function(res,vals,fields){
// 	var user = vals;
// });
app.get('/post', function(req, res){
	res.sendFile(__dirname + '/index.html');
});
//在线用户
var onlineUsers = [];
io.on('connection', function(socket){
	console.log('a user connected');
	//监听新用户加入
	socket.on('login', function(obj){
		console.log(obj.username);
		// query(" select * from yw_user where username = " + obj.username ,function(res,val,fields){
		// 	console.log( val );
		// 	return;
		// 	obj.uid = vals.id;
		// 	socket.name = obj.uid;
		// 	obj.sid = socket.id;
		// 	obj.shenfen = vals.identity_id
		// });
		//检查在线列表，如果不在里面就加入
		if(!onlineUsers.hasOwnProperty(obj.uid)) {
			onlineUsers[obj.uid] = obj;
			console.log(JSON.stringify(onlineUsers));
		}
		socket.emit('login', obj);
	});
	//监听用户退出
	socket.on('disconnect', function(){
		console.log('退出' + socket.name );
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//删除
			delete onlineUsers[socket.name];
			console.log('退出' + socket.name );
			console.log(JSON.stringify(onlineUsers));
		}
	});
	//监听用户发布聊天内容
	socket.on('message', function(obj){
		//向服务员广播发布的消息
		console.log(JSON.stringify(obj))
		for(var i = 0 ; i<onlineUsers.length ; i++){
			if(onlineUsers[i]&&onlineUsers[i].shenfen == 2){
				io.to(onlineUsers[i].sid).emit('message', obj);
			}
		}	
	});
  
});
//设置监听端口
http.listen(3000, "127.0.0.1", function () {
  console.log("server is started listen port 3000");
});
