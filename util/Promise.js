var _slice = [].slice;
var Callbacks = function(options){
	var unique = (options || "").unique;
	var queue = [],
		callbacks = {
		add: function(fn){
			if(typeof fn==='function' && (unique!==true || queue.indexOf(fn)!=-1)){
				queue.push(fn);
			}
			return callbacks
		},
		fire: function(){
			return callbacks.fireWith(null, arguments);
		},
		fireWith: function(context, args){
			args = _slice.call(args);
			while(queue.length){
				queue.shift().apply(context, args);
			}
			return callbacks;
		},
		once: function(){
			callbacks.fire.apply(callbacks, arguments);
			queue.length = 0;
			return callbacks;
		}
	};
	return callbacks;
};
var Promise = function(){
		
	var tuples = [
		['done', Callbacks(), 'resolved', 'resolve'],
		['fail', Callbacks(), 'rejected', 'reject']
	];
	var state = 'pending';
	
	var promise = {
		then: function(resolved, rejected){
			return this.done(resolved).fail(rejected);
		},
		promise: function(obj){
			for(var i in promise){
				obj[i] = promise[i];
			}
			return obj;
		},
		state: function(){
			return state;
		}
	};
	
	tuples.forEach(function(tuple){
		var list = tuple[1];
		promise[ tuple[0] ] = function(fn){
			list.add(fn);
			return promise;
		};
		
		promise[ tuple[3] ] = function(fn){
			state = tuple[2];
			list.once.apply(list, arguments);
			return promise;
		};
	});
	return promise;
};

function Async(){
	var operations = _slice.call(arguments, 0),
		//determine operations done or not.
		remaind = operations.length,
		//put all arguments into args,
		allArgs = [],
		onceFns = [],
		//add callbacks when all operations done.
		callbacks = Callbacks({unique: true}),
	async = {
		fire: function(){
			callbacks.add.apply(callbacks, arguments);
			return async;
		},
		once: function(fn){
			onceFns.push(fn);
			return async.fire.apply(async, arguments);
		},
		add: function(){
			remaind++;
			operations.push.apply(operations, arguments);
			return async;
		},
		remove: function(operation){
			var idx = operations.indexOf(operation);
			if(idx!=-1){
				allArgs.splice(idx, 1);
				operations.splice(idx, 1);
				remaind--;
				fire();
			}
			return async;
		},
		done: function(){
			var args = _slice.call(arguments),
				operation = args.shift(),
				idx = operations.indexOf(operation);
			if(idx!=-1){
				remaind--;
				allArgs[idx] = args;
				fire();
			}
			return async;
		}
	};
	function fire(){
		if(!!remaind)return async;
		callbacks.fire.apply(callbacks, allArgs);
		remaind = operations.length;
		var fn;
		while( (fn = onceFns.pop()) ){
			callbacks.remove(fn);
		}
		return async;
	}
	return async;
}

module.exports.Promise = Promise;
module.exports.Async = Async;
module.exports.Callbacks = Promise;