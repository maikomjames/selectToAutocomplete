/**
 * selectToAutocomplete.js
 *
 * Copyright 2012, Simples agência
 * @author Maikom James , Pable Demier
 * 
 */
$.fn.extend({
	selectToAutocomplete : function(options){
		
		if ( typeof options !== 'object' || options === 'destroy' ) {
			
			$(this).show();
			$(this).next('.select-autocomplete').remove();
			return;
		}
		
		var defaults = {
			change : function (){ }, // 
			keyup : function (){ },
			keydown : function () {},
			select : function (){},
			destroy : function () { console.log($(this)); }
		};
		options = $.extend(defaults, options);
		
		this.each(function(indice) {
			var $select = $(this); 
			var json_option = {}; // json de valores options 
			var json_search = {}; // json para pesquisa
			var json_result_search = {}; // json de resultado de busca
			
			$.each($(this).find('option'), function (index , elem_option){
				json_option[index] = { label : $(elem_option).html() , value : $(elem_option).attr('value') };
				json_search[index] = $.fn.selectToAutocomplete.normalizeAccents($(elem_option).html());
			});
			
			//console.log(json_option);
			//console.log(json_search);
			
			var $contentInput = $('<div class="select-autocomplete">'+
					'<div>'+
					'<input type="text" name="' + $(this).data('name') + '_' + indice + '" placeholder="'+$(this).data('name')+'" />'+
					'<a class="btnlist ui-selectmenu-icon ui-icon ui-icon-triangle-1-s"></a>'+
					'</div>'+
					'<ul class="list-autocomplete" style="display:none;"></ul>'+
					'</div>').appendTo($(this).parent());
			var $input = $contentInput.find('input[type=text]');
			var $ul = $contentInput.find('ul.list-autocomplete');
			var $btnlist = $contentInput.find('a.btnlist');
			$input.attr('autocomplete', 'off');
			$(this).hide();
			var $ctrlValue = '';
			$input.on('keyup', function (e){
				e.preventDefault();
				$this = $(this);
				var keyCode = (e) ? e.which : e.keyCode;
				
				if($this.val() == "" && keyCode != '40' && keyCode != '38' && keyCode != '13') { $ul.hide(); return; }
				
				if($ctrlValue == $this.val() && keyCode != '40' && keyCode != '38' && keyCode != '13' ) { return; }
				
				// Eventos key up key down
				if(keyCode == '40'){ // Down
					if($ul.find('li.selected-selectAutocomplete').length == 0){						
						$ul.find('li:first').addClass('selected-selectAutocomplete');
					}else{
						$listSelected = $ul.find('li.selected-selectAutocomplete');
						
						if($listSelected.next('li').length !=  0){							
							$listSelected.next('li').addClass('selected-selectAutocomplete');
							$listSelected.removeClass('selected-selectAutocomplete');
						}
					}
					$li = ($ul.find('li.selected-selectAutocomplete').length == 0) ? $ul.find('li:first') : $ul.find('li.selected-selectAutocomplete');
					$input.val($li.data('label'));
					$select.val($li.data('value')).trigger('change');
					return;
				}else if(keyCode == '38'){ // Up
					if($ul.find('li.selected-selectAutocomplete').length == 0){						
						$ul.find('li:last').addClass('selected-selectAutocomplete');
					}else{
						$listSelected = $ul.find('li.selected-selectAutocomplete');
						if($listSelected.prev('li').length != 0){
							$listSelected.prev('li').addClass('selected-selectAutocomplete');
							$listSelected.removeClass('selected-selectAutocomplete');
						}
					}
					$li = ($ul.find('li.selected-selectAutocomplete').length == 0) ? $ul.find('li:first') : $ul.find('li.selected-selectAutocomplete');
					$input.val( $li.data('label') );
					$select.val($li.data('value')).trigger('change');
					return;
				}else if(keyCode == '13') {
					$li = ($ul.find('li.selected-selectAutocomplete').length == 0) ? $ul.find('li:first') : $ul.find('li.selected-selectAutocomplete');
					$input.val( $li.data('label') );
					$select.val($li.data('value')).trigger('change');
					options.select({ label : $li.data('label') , value : $li.data('value')});
					$ul.html('');
					$.fn.selectToAutocomplete.hideList($ul);
					return;
				}
				// ---- 
				
				$ctrlValue = $this.val();
				json_result_search = {};
				$ul.html('');
				$.each(json_search, function(i, v) {
			        //if (v.search(new RegExp($this.val(), 'gi')) != -1) {
					
					if (v.search(new RegExp("(.*?)(" + $.fn.selectToAutocomplete.normalizeAccents($this.val()) + ")", 'gi')) != -1) {
			        	json_result_search[i] = v;
			        	var $itemlist = $('<li>'+json_option[i]['label']+'</li>').appendTo($ul);
			        	$itemlist.data('value', json_option[i]['value']);
			        	$itemlist.data('label', json_option[i]['label']);
			        }
			    });
				if(json_result_search != {} && $this.val() != ""){
					$.fn.selectToAutocomplete.showList($ul);
				}else{
					$.fn.selectToAutocomplete.hideList($ul);
				}
				//console.log(json_result_search, $this.val());
				//console.log(json_result_search);
			});
			
			
			$btnlist.on('click', function (e){
				e.preventDefault();
				$ul.html('');
				$.each(json_search, function(i, v) {
					var $itemlist = $('<li>'+v+'</li>').appendTo($ul);
		        	$itemlist.data('value', json_option[i]['value']);
		        	$itemlist.data('label', json_option[i]['label']);
				});
				$ul.css({
					overflow : 'auto',
					//width : '100px',
					height : '200px'
				});
				$ul.toggle();
				$input.focus();
			});
			
			$ul.on( 'mouseover', 'li', function (){
				$ul.find('li.selected-selectAutocomplete').removeClass('selected-selectAutocomplete');
				$(this).addClass('selected-selectAutocomplete');
			});
			
			$ul.on('mouseout', 'li',  function (){
				$ul.find('li.selected-selectAutocomplete').removeClass('selected-selectAutocomplete');
			});
		
			$ul.on('click', 'li',  function (){
				$input.val( $(this).data('label') );
				$select.val( $(this).data('value')).trigger('change');
				options.select({ label : $(this).data('label') , value : $(this).data('value')});
				$ul.html('');
				$.fn.selectToAutocomplete.hideList($ul);
			});
			
			$select.on('change', function (){
				options.change($(this).val());
			});
			
			
				
		});
		
		return this;
	}
});
$.fn.selectToAutocomplete.showList = function($ul) {
	$ul.show();
};
$.fn.selectToAutocomplete.hideList = function ($ul){
	$ul.hide();
};
$.fn.selectToAutocomplete.normalizeAccents = function(str) {
    var accents = { "\u00C0": "A", "\u00E0": "a", "\u00C1": "A", "\u00E1": "a", "\u00C2": "A", "\u00E2": "a", "\u0102": "A", "\u0103": "a", "\u00C6": "AE", "\u00E6": "ae", "\u00C5": "A", "\u00E5": "a", "\u0100": "A", "\u0101": "a", "\u0104": "A", "\u0105": "a", "\u00C4": "A", "\u00E4": "a", "\u00C3": "A", "\u00E3": "a", "\u00C8": "E", "\u00E8": "e", "\u00C9": "E", "\u00E9": "e", "\u00CA": "E", "\u00EA": "e", "\u00CB": "E", "\u00EB": "e", "\u0112": "E", "\u0113": "e", "\u0118": "E", "\u0119": "e", "\u011A": "E", "\u011B": "e", "\u0114": "E", "\u0115": "e", "\u0116": "E", "\u0117": "e", "\u00CC": "I", "\u00EC": "i", "\u00CD": "I", "\u00ED": "i", "\u00CE": "I", "\u00EE": "i", "\u00CF": "I", "\u00EF": "i", "\u012A": "I", "\u012B": "i", "\u0128": "I", "\u0129": "i", "\u012C": "I", "\u012D": "i", "\u012E": "I", "\u012F": "i", "\u0130": "I", "\u0131": "i", "\u0132": "IJ", "\u0133": "ij", "\u0134": "J", "\u0135": "j", "\u0136": "K", "\u0137": "k", "\u0138": "k", "\u0141": "L", "\u0142": "l", "\u013D": "L", "\u013E": "l", "\u0139": "L", "\u013A": "l", "\u013B": "L", "\u013C": "l", "\u013F": "l", "\u0140": "l", "\u00D2": "O", "\u00F2": "o", "\u00D3": "O", "\u00F3": "o", "\u00D4": "O", "\u00F4": "o", "\u00D6": "O", "\u00F6": "o", "\u00D5": "O", "\u00F5": "o", "\u00D8": "O", "\u00F8": "o", "\u014C": "O", "\u014D": "o", "\u0150": "O", "\u0151": "o", "\u014E": "O", "\u014F": "o", "\u0152": "OE", "\u0153": "oe", "\u0154": "R", "\u0155": "r", "\u0158": "R", "\u0159": "r", "\u0156": "R", "\u0157": "r", "\u00D9": "U", "\u00F9": "u", "\u00DA": "U", "\u00FA": "u", "\u00DB": "U", "\u00FB": "u", "\u00DC": "U", "\u00FC": "u", "\u016A": "U", "\u016B": "u", "\u016E": "U", "\u016F": "u", "\u0170": "U", "\u0171": "u", "\u016C": "U", "\u016D": "u", "\u0168": "U", "\u0169": "u", "\u0172": "U", "\u0173": "u", "\u00C7": "C", "\u00E7": "c", "\u0106": "C", "\u0107": "c", "\u010C": "C", "\u010D": "c", "\u0108": "C", "\u0109": "c", "\u010A": "C", "\u010B": "c", "\u010E": "D", "\u010F": "d", "\u0110": "D", "\u0111": "d", "\u00D1": "N", "\u00F1": "n", "\u0143": "N", "\u0144": "n", "\u0147": "N", "\u0148": "n", "\u0145": "N", "\u0146": "n", "\u0149": "n", "\u014A": "N", "\u014B": "n", "\u00DF": "ss", "\u015A": "S", "\u015B": "s", "\u0160": "S", "\u0161": "s", "\u015E": "S", "\u015F": "s", "\u015C": "S", "\u015D": "s", "\u0218": "S", "\u0219": "s", "\u0164": "T", "\u0165": "t", "\u0162": "T", "\u0163": "t", "\u0166": "T", "\u0167": "t", "\u021A": "T", "\u021B": "t", "\u0192": "f", "\u011C": "G", "\u011D": "g", "\u011E": "G", "\u011F": "g", "\u0120": "G", "\u0121": "g", "\u0122": "G", "\u0123": "g", "\u0124": "H", "\u0125": "h", "\u0126": "H", "\u0127": "h", "\u0174": "W", "\u0175": "w", "\u00DD": "Y", "\u00FD": "y", "\u0178": "Y", "\u00FF": "y", "\u0176": "Y", "\u0177": "y", "\u017D": "Z", "\u017E": "z", "\u017B": "Z", "\u017C": "z", "\u0179": "Z", "\u017A": "z" };
    for (var a in accents) {
            if (str.indexOf(a) != -1) {
                    str = str.replace(new RegExp(a, "g"), accents[a]);
            }
    }
    return str;
};
