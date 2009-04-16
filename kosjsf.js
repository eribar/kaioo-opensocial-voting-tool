/******************************************************************************\
 * 
 * Kaioo OpenSocial JavaScript Foundation
 * 
 * Copyright (C) 2009 Eric Barmeyer
 * 
 * This program is free software; you can redistribute it and/or modify it 
 * under the terms of the GNU General Public License as published by the 
 * Free Software Foundation; either version 3 of the License, or (at your 
 * option) any later version.
 * 
 * This program is distributed in the hope that it will be useful, but WITHOUT 
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or 
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for 
 * more details.
 * 
 * You should have received a copy of the GNU General Public License along with 
 * this program; if not, see <http://www.gnu.org/licenses/>.
 * 
 ******************************************************************************/


function KOSJSF(){};


KOSJSF.FETCHING = 0;
/**
 * usefull tools
 */
KOSJSF.Tools = {
	
	/**
	 * 
	 */
	getArguments : function(from) {
		var args = new Array();
		var query = from.substring(1);
		var pairs = query.split("&");
		for(var i = 0; i < pairs.length; i++) {
			var pos = pairs[i].indexOf('=');
			if(pos == -1) continue;
			var argname = pairs[i].substring(0,pos);
			var value = pairs[i].substring(pos+1);
			args[argname] = decodeURIComponent(value);
		}
		return args;
	},
	
	synchronize : function(calls, func) {
		var k = 0;
		for(var i=0;i<calls.length;i++) {
			eval(calls[i]);
			(function(){
				if(KOSJSF.FETCHING > 0) {
					setTimeout(arguments.callee,50);
				} else {
					k++
					if(k==calls.length) {
						alert("bla");
						func();
					}
				}
			})();
		}
	},
};

KOSJSF.viewer = {

	/**
	 * Retrieves information about the current viewer from the server and stores
	 * them into <var>viewer</var>.
	 */
	init : function() {
		KOSJSF.FETCHING++;
		var request = opensocial.newDataRequest();
		request.add(
			request.newFetchPersonRequest(opensocial.DataRequest.PersonId.VIEWER),
			'viewer'
		);
		request.send(function(response){
			if(response.hadError()) {
				// TODO: add some fancy error handling
				return;
			}
			KOSJSF.viewer.name = response.get('viewer').getData().getDisplayName();
			KOSJSF.viewer.id   = parseInt(response.get('viewer').getData().getId());
			KOSJSF.FETCHING--;
		});	
	},
	
	/**
	 * 
	 */
	name : null,
	
	/**
	 * 
	 */
	id : -1,
	
	/**
	 * 
	 */
	lang : (function(){
		return KOSJSF.Tools.getArguments(parent.document.location.search)['locale'];
	})(),
	
	/**
	 * 
	 */
	friends : null,
};

function format(){
	if(arguments.length < 2) return;
	var str = arguments[0];
	for(var i=1;i<arguments.length;i++){
		switch(typeof(arguments[i])){
			case 'string':
				str = str.replace(/%s/, arguments[i]);
				break;
			case 'number':
				str = str.replace(/%d/, arguments[i]);
				break;
			case 'boolean':
				str = str.replace(/%b/, arguments[i] ? 'true' : 'false' );
				break;
			default:
				// TODO: function | object | undefined
				break;
		}
	}
	return str;
}
if(!String.format) {
	String.format = format;
}