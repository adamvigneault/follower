/**
* follower r3.5 // 2015.04.23 // jQuery 1.7+
* <http://www.adamvigneault.com>
* 
* @param     scope     || $(window)
* @param     margin    || {top : 0, right : "auto", bottom : "auto", left : 0}
* @param     z-index   || inherit
* @param     animate   || true
* @author    Adam Vigneault <adam@adamvigneault.com>
*/

(function($){
	var methods = {
		"init"     : function (params) {
			var that      = this,
			    index     = $.fn.follower.index,
			    dataAttrs = $.extend(
			    		{"offset" : this.offset()},
					$.fn.follower.defaults,
					params
			    );
			
			// Compensate for mid-page offsets and resets
			dataAttrs.offset.top+=dataAttrs.scope.scrollTop();
			dataAttrs.offset.left+=dataAttrs.scope.scrollLeft();
						
			this.uniqueId();  //ID follower elements
			
			this.each(function(i, el) {
				if (!(el.id in index)) {
					// Register a new follower with the index
					index[el.id] = dataAttrs;
					methods["update"].apply($(el));
					methods["start"].apply($(el));
				} else {
					methods["update"].apply($(el)); // Otherwise update the position
					return this
				}
			});
			
			return this;
		},
		"update" : function() {
			var da = $.fn.follower.index[this.attr("id")];
			da.offset = this.offset();
		},
		"start" : function() {
			var that = this,
			    da = $.fn.follower.index[this.attr("id")];
			// Run the follower logic on each scroll frame with a unique namespace
			da.scope.on("scroll."+this.attr("id"),function(e) {
				methods["_follow"].apply(that);
			});
		},
		"stop" : function() {
			var da = $.fn.follower.index[this.attr("id")];
			da.scope.off("scroll."+this.attr("id")); // terminate the event handler
			delete $.fn.follower.index[this.attr("id")]; // Cleanup the index
		},
		"_follow" : function() {
			var da = $.fn.follower.index[this.attr("id")];
			// Scope scrolling offset; set to zero if the scope is the whole window object.
			var vOffset = (da.scope[0]==window) ?
				0 : da.scope.offset().top;
			var hOffset = (da.scope[0]==window) ?
				0 : da.offset.left+da.scope.offset().left;
			// How far from the top of the scope the user has scrolled
			var sTop = da.scope.scrollTop();
			// Element top relative to the scope
			var eTop = this.offset().top+da.margin.top-vOffset;
			
			if (eTop<=0 && !this.hasClass("Following")) {
				this.addClass("Following"); // Element is now following
				da.aTop = sTop; // Record the inflection point
				
				// Generate a sanitized spacer for the element
				this.data('clone', this.clone()
					.removeAttr("id")
					.removeClass("Following").addClass("Clone")
					.css("visibility","hidden")
					.insertAfter(this)
				);
				
				// Fix the follower's position
				this.css({
					"position" : "fixed",
					"top"      : da.offset.top + da.margin.top+"px",
					"left"     : da.offset.left + da.margin.left + "px",
					"right"    : da.margin.right + "px",
					"z-index"  : da["z-index"]
				});
				
				// Animate element into margined position
				if (da.animate) {
					this.css('top', vOffset);
					this.animate({
						top : vOffset+da.margin.top
					}, 500, "easeInOutQuint", function () {
						// animation complete
					});
				} else {
					this.css('top', vOffset+da.margin.top);
				}
			}
			if (sTop<da.aTop && this.hasClass("Following")) {
				this.removeClass("Following") // Element is no longer following
				    .removeAttr("style") // Clean up
				    .data('clone').remove();
				this.removeData('clone');
			}
		}
	}
	
	$.fn.follower = function(arg) {
		
		if (this.length<=0) return;
		
		if (methods[arg]) {
			return methods[arg].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof arg === 'object' || !arg) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + arg + " does not exist on jQuery.follower");
		}
	};
	
	$.fn.follower.defaults = {
		// The scrolling element to follow
		"scope"   : $(window),
		// Stacking order of the following objects
		"z-index" : "inherit",
		// Activation point
		"aTop"    : 0,
		// Margins from the edges of the scope
		"margin"  : {
			top    : 0,
			right  : "auto",
			bottom : "auto",
			left   : 0
		},
		// Margin reveal animation
		"animate" : true
	};
	
	// Maintains an index of followers for quick access by other components
	$.fn.follower.index = {};
})(jQuery)
