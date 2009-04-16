/******************************************************************************\
 * 
 * Kaioo OpenSocial Voting Tool
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


/**
 * 
 * 
 */
function KVote(){
	/*
	 * KOSJSF.Tools.synchronize(['KOSJSF.viewer.init()', 'KVote.vote.load(1)'],
	 * function() { KVote.view.init(); KVote.view.update();
	 * $('#kosjsf-tabs').tabs(); $('#kosjsf-vote div.footer a.previous').hide();
	 * $('#kosjsf-vote div.footer a.submit').hide(); $("#kosjsf-tabs,
	 * #kosjsf-vote").css("visibility","visible");
	 * _IG_AdjustIFrameHeight($('#kosjsf-tabs').height()+7); });
	 */
	// TODO: clean up this mess
	KOSJSF.viewer.init();
	(function(){
		if(KOSJSF.FETCHING > 0){
			setTimeout(arguments.callee,50);
		} else {
			KVote.vote.load(1);			
			(function(){
				if(KOSJSF.FETCHING > 0){
					setTimeout(arguments.callee,50);
				} else {
					
					KVote.view.init();
					KVote.view.update();
					$('#kosjsf-tabs').tabs();
					$('#kosjsf-vote div.footer a.previous').hide();
					$('#kosjsf-vote div.footer a.submit').hide();
					$("#kosjsf-tabs, #kosjsf-vote").css("visibility","visible");
					_IG_AdjustIFrameHeight($('#kosjsf-tabs').height()+7);  
				}
			})();
		}
	})();
};

KVote.selected = new Array();

KVote.translate = {
	'poll' : 'Umfrage',
	'question_count' : 'Frage %d von %d:',
	'next' : 'Weiter',
	'back' : 'Zur&uuml;ck',
	'submit' : 'Absenden',
	'finish' : 'Fertig!',
	'finish_text' : 'Vielen Dank f&uuml;r deine Teilnahme.',
	'participation_info' : 'Deine Umfrage wurde am %s entgegen genommen.<br /> Solltest du zu diesem Zeitpunkt nicht an der Umfrage teilgenommen haben, melde dich bitte beim Kaioo OpenSocial Voting Tool Team.',
	'participated' : 'Danke!',
	'participated_text' : 'Du hast an dieser Umfrage bereits teilgenommen.'
};

/**
 * 
 */
KVote.vote = {

	/**
	 * 
	 */
	participated : false,
	
	/**
	 * 
	 */	
	UID : null,
	
	/**
	 * 
	 */
	name : null,
	
	/**
	 * 
	 */
	load : function(voteId) {
		KOSJSF.FETCHING++;
		$.getJSON("http://taynt.de/kaioo/kaioo_vote.php?vid=" + voteId + "&uid=" + KOSJSF.viewer.id + "&lang=" + KOSJSF.viewer.lang + "&jsonp=?", this.loadCallback);
		this.registerHandler();
	},
	
	/**
	 * 
	 */
	registerHandler : function() {
		$('#kosjsf-vote div.footer a.next').html(KVote.translate['next']).click(function(){
			KVote.selected[KVote.vote.cid] = $("#kosjsf-vote input:radio:checked").val();
			$('#kosjsf-vote div.footer a.previous').show();
			KVote.vote.cid++;
			if(KVote.vote.cid == (KVote.vote.questions.length - 1)) {
				$('#kosjsf-vote div.footer a.next').hide();
				$('#kosjsf-vote div.footer a.submit').show();
			}
			KVote.view.update();
		});
		// previous question
		$('#kosjsf-vote div.footer a.previous').html(KVote.translate['back']).click(function(){
			KVote.selected[KVote.vote.cid] = $("#kosjsf-vote input:radio:checked").val();
			KVote.vote.cid--;
			$('#kosjsf-vote div.footer a.submit').hide();
			$('#kosjsf-vote div.footer a.next').show();
			if(KVote.vote.cid <= 0) {
				KVote.vote.cid = 0;
				$('#kosjsf-vote div.footer a.previous').hide();
			}
			KVote.view.update();
		});
		$('#kosjsf-vote div.footer a.submit').html(KVote.translate['submit']).click(function(){
			KVote.selected[KVote.vote.cid] = $("#kosjsf-vote input:radio:checked").val();
			$.getJSON("http://taynt.de/kaioo/kaioo_vote.php?jsonp=?&data=" + escape(JSON.stringify(KVote.selected)),KVote.view.finishPoll);
		});
	},
	
	/**
	 * 
	 */
	loadCallback : function(json) {
		if(json[0].datetime) {
			KVote.vote.participated = json[0].datetime;
		}
		KVote.vote.UID = json[0].id;
		KVote.vote.name = json[0].name;
		KVote.vote.questions = json[0].questions;
		KVote.vote.cid = 0;
		KOSJSF.FETCHING--;
	},

	/**
	 * 
	 */
	cid : 0,
	
};

/**
 * 
 * 
 */
KVote.view = {

	init : function() {
		$('#kosjsf-tabs li.vote a').html(KVote.translate['poll']);
	},
	inputTemplate : $('#kosjsf-vote p.input:first').clone(),
	/**
	 * 
	 */
	update : function() {
		var vote = KVote.vote;
		$('#kosjsf-tabs legend').html(vote.name);
		$('#kosjsf-vote p.input').remove();
		
		if(KVote.vote.participated) {
			$('#kosjsf-vote div.question h2').html(KVote.translate['participated']);
			$('#kosjsf-vote div.question p.text')
				.html(KVote.translate['participated_text'])
				.after('<p class="info"><b>Info:</b>' + String.format(KVote.translate['participation_info'],KVote.vote.participated) + '</p>');
			$('#kosjsf-vote p.input').remove();
			$('#kosjsf-vote div.footer').hide();
			return;
		}
		
		
		$('#kosjsf-vote h2').html(String.format(KVote.translate['question_count'], (vote.cid + 1) , vote.questions.length ));
		$('#kosjsf-vote p.text').html(vote.questions[vote.cid].name);
		
		var type, option_name, option_count = 0;
		if(vote.questions[vote.cid].type == "single") {
			type = "radio";
			option_name = ' name="kvote-radiogroup-' + vote.cid + '" ';
		} else {
			type = "checkbox";
			option_name = "kvote-checkbox-" + this.currentQuestionId + "-";
		}
		
		for each(var option in vote.questions[vote.cid].options) {
			option_count++;
			var optionTemplate = this.inputTemplate.clone();
			if(type == "checkbox") {
				option_name += ''+option_count;
			}
			var selected = "";
			if(KVote.selected[KVote.vote.cid] == option_count) {
				selected = ' checked="checked" ';
			}
			$("label",optionTemplate)
				.attr("for","kvote-" + vote.questions[vote.cid].id + "-" + vote.cid + "-" + option_count)
				.html(option)
				.after('<input type="' + type + '" value="' + option_count + '" id="'+"kvote-" + vote.questions[vote.cid].id + "-" + vote.cid + "-" + option_count +'" '+option_name+selected+' />')
			$('#kosjsf-vote p.text').after(optionTemplate);
		}
		_IG_AdjustIFrameHeight($('#kosjsf-tabs').height()+7);		
	},
	
	/**
	 * 
	 */
	finishPoll : function(json) {
		KVote.vote.participated = json[0].datetime;
		$('#kosjsf-vote div.question h2').html(KVote.translate['finish']);
		$('#kosjsf-vote div.question p.text')
			.html(KVote.translate['finish_text'])
			.after('<p class="info"><b>Info:</b>' + String.format(KVote.translate['participation_info'], KVote.vote.participated) + '</p>');
		$('#kosjsf-vote p.input').remove();
		$('#kosjsf-vote div.footer').hide();
	},
};

// onload handler
$(document).ready(function() {
	var vote = new KVote();
});
