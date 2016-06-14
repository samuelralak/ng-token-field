angular.module('ngTokenField', []).directive('ngTokenField', function () {
		return {
	        restrict: 'E',
	        scope: {
	            data: '='
	        },
			require : 'ngModel', 
			scope: {
			  ngModel: '=?',
			  placeholder: '@placeholder'
			},
	        template: '<div class="ng-token-field"><span class="ng-token-field-placeholder">{{placeholder}}</span><input type="text"/></div>',
			link: function(scope, element, attrs) {
					var _tokenField;
					var _input;
					var _SEPARATOR = ",";
				    var _validatorFunction = null;
				    
					_tokenField = element.find('.ng-token-field');  
					_input = _tokenField.find('input');
	
					////////////////////////////////////////////////
				    // INPUT FIELD EVENT HANDLING
				    ////////////////////////////////////////////////
				    
				    _tokenField.on('click', function (event) {
				        _input.focus();
				    });
					
					_input.on('focus', function (event) {
						_tokenField.addClass("focus");
						hidePlaceholder();
					});
				
					_input.on('input', function (event) {
						var value = event.target.value;
						var tokens = value.split(_SEPARATOR);
						if (tokens.length>1) {
							this.value = "";
							createTokens(tokens);
						}
					});
					
				    _input.on('keydown', function (event) {
				        var code = (event.keyCode ? event.keyCode : event.which);
				        if(code == 13) { //Enter keycode
				            var value = event.target.value;
				            var tokens = value.split(_SEPARATOR);
				            this.value = "";
				            createTokens(tokens);
				        } else if( code == 8 || code == 46 ) { // Backspace or Delete keycode
				            if (this.value == '') {
				                // remove last token
				                var remaining = _tokenField.find('.token-wrapper');
				                var last = remaining[remaining.length-1];
				                if (typeof last != 'undefined') {
				                    removeToken(last);
				                }
				            }
				        }
				    })
				    
					_input.on('blur', function (event) {
						_tokenField.removeClass("focus");
						var value = event.target.value;
						var tokens = value.split(_SEPARATOR);
						this.value = "";
						createTokens(tokens);
						togglePlaceholder();
					});
				
				    ////////////////////////////////////////////////
				    // APPEARANCE AND MAIN LOGIC
				    ////////////////////////////////////////////////
					
					/**
					 * Generates and display token elements out of a given array of text elements
					 *
					 * 
					 * @param tokens An array containing the text values for each token to be created. Example: ['joe@email.com', 'alice@bob.com']
					 */
					function createTokens(tokens) {
						for (var i=0; i<tokens.length; i++) {
							var text = tokens[i];
							if (text != '') {
				                var tokenWrapper = $("<div>");
								tokenWrapper.addClass("token-wrapper");
				
								var token = $("<div>");
								token.addClass("token");
								
								// Validate text to see if we should mark the token as valid/invalid
								if (_validatorFunction != null && _validatorFunction(text)==false) {
									token.addClass("invalid");
								} else {
									token.addClass("valid");
								}
								
				                tokenWrapper.append(token);
				                
								var close = $("<div>");
								close.addClass("close");
								close.append(document.createTextNode('✕')); 
								
								var onclickWrapper = function(w) {
						            return function callback() {
						                var ftokenWrapper = w;	
					                    removeToken(ftokenWrapper);
									}
						        }
				                close.on('click', onclickWrapper(tokenWrapper));
					                
				
								var tokenText = $("<span>");
								tokenText.addClass("token-text");
								tokenText.append(document.createTextNode(text)); 
				                
				                token.append(tokenText); 
								token.append(close);    
								tokenWrapper.insertBefore(_input); 
				                
				                // Resize input field accordingly
				                resizeInput(tokenWrapper);
							}
						}
						
						updateModel();
					}
				
				    ////////////////////////////////////////////////
				    // UTIL METHODS
				    ////////////////////////////////////////////////
				    
				    /**
					 * Removes a token (tokenWrapper) and adjusts the width of the text input field.
					 *
					 * 
					 * @param tokenWrapper The tokenWrapper element to remove
					 */
				    function removeToken(tokenWrapper) {					
				        var ftokenWrapper = tokenWrapper;
						ftokenWrapper.remove();
				
				        // find last token in list
				        var remaining = _tokenField.find('.token-wrapper');
				        if (remaining.size() > 0) {
					        var last = $(remaining[remaining.length-1]);
				            resizeInput(last);
				        } else {
				            _input.css('width', 100+"%");
				        }
						
						updateModel();
				    }
				    
				    /**
					 * Adjusts the width of the text input field based on the last tokenWrapper element.
					 *
					 * 
					 * @param tokenWrapper The last tokenWrapper element in the JSTokenField.
					 */
				    function resizeInput(tokenWrapper) {
					    var xoffset = tokenWrapper.offset().left + tokenWrapper.width() - _tokenField.offset().left;
				        var newWidth = (_tokenField.width() - xoffset - 20);
				        if (newWidth<20) {
				            newWidth = 100+"%";
				            _input.css('width',newWidth);
				        } else {
				            _input.css('width',(newWidth/_tokenField.width())*100+"%");
				        }
				    }
				    
				    ////////////////////////////////////////////////
				    // PUBLIC METHODS
				    ////////////////////////////////////////////////
				    
				    /**
					 * Returns an array containing the text value of all the tokens in _tokenField.
					 *
					 * e.g. ['joe@mail.com', 'mike@awesome.com', 'alice@bob.com']
					 *
					 */
				    function getContent() {
				        var content = [];
				        var tokens = _tokenField.find('.token-text');
				        for (var i=0; i<tokens.length; i++) {
				            content.push(tokens[i].textContent);
				        } 
				        
				        return content;
				    }
					
					function updateModel() {
						scope.$apply(function() {
						  scope.ngModel = getContent();
						});
					}
					
					/**
					 * Show/hide placeholder based on whether we have tokens
					 *
					 *
					 */
					function togglePlaceholder() {
						var placeholder = element.find('.ng-token-field-placeholder');
						if (getContent().length == 0) {
							// no tokens -> show placeholder
							showPlaceholder();
						} else {
							// hide placeholder
							hidePlaceholder();
						}
					}
					
					function hidePlaceholder() {
						var placeholder = element.find('.ng-token-field-placeholder');
						placeholder.hide();
					}
					
					function showPlaceholder() {
						var placeholder = element.find('.ng-token-field-placeholder');
						placeholder.show();
					}
			}
	}
});
