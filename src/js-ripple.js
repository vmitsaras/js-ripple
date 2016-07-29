(function( w, $ ){
	"use strict";

	var name = "ripple",
		componentName = name + "-component",
		utils = w.utils;

	w.componentNamespace = w.componentNamespace || {};

	var Ripple = w.componentNamespace.Ripple = function( element, options ){
		if( !element ){
			throw new Error( "Element required to initialize object" );
		}
		// assign element for method events
		this.element = element;
		this.$element = $( element );
		// Options
		this.options = options = options || {};
		this.metadata = utils.getMetaOptions( this.element, name );
		this.options = $.extend( {}, this.defaults, this.metadata, options );
	};


	Ripple.prototype.init = function(){

		if ( this.$element.data( componentName ) ) {
			return;
		}

		this.$element.data( componentName, this );
		if( !utils.supportAnimations ) {
			return;
		}
		this.isAnimating = false;
		this.$element.trigger( "beforecreate." + name );
		this._create();
		this.$element.bind('mousedown', this._animate.bind(this) );
	};

	Ripple.prototype.refresh = function(){
		var self = this,
			d = Math.max(self.$element.outerWidth(), self.$element.outerHeight())/this.options.widthDivider;
		this.$ripple.css({height: d, width: d});
		this.$element.trigger( "refreshed." + name );
	};

	Ripple.prototype._create = function(){
		var self = this,
			options = this.options,
			rippleClasses = [options.baseClass];

		if ( options.modifiers ) {
			utils.cssModifiers(options.modifiers,rippleClasses,options.baseClass);
		}

		this.$ripple = $( '<span></span>' ).addClass( rippleClasses.join( " " ) ).appendTo(this.$element);
		this.refresh();
		this.$element.trigger( "create." + name );
		$( w.document ).on( "refresh." + name, function(){
			self.refresh();
		});
	};

	Ripple.prototype._animate = function(){
		var self = this,x,y,point;
		if( this.isAnimating ) {
			return;
		}
		this.isAnimating = true;
		// record the x for threshold calculations
		point = this._getPoint( event );
		this.downX = point.x;
		this.downY = point.y;

		x = this.downX - this.$element.offset().left - this.$ripple.width()/2;
		y = this.downY - this.$element.offset().top - this.$ripple.height()/2;

		this.$ripple.css({top: y+'px', left: x+'px'}).addClass(utils.classes.isAnimating);
		this.$element.addClass(utils.classes.isClicked);

		utils.onEndAnimation( this.$ripple[0], function() {
			self.$element.removeClass(utils.classes.isClicked);
			self.$ripple.removeClass(utils.classes.isAnimating);
			self.isAnimating = false;
		} );
	};

	Ripple.prototype._getPoint = function( event ) {
		var touch = event.touches || (event.originalEvent && event.originalEvent.touches);
		if( touch ){
			return {
				x: touch[0].pageX,
				y: touch[0].pageY
			};
		}

		return {
			x: event.pageX || event.clientX,
			y: event.pageY || event.clientY
		};
	};

	Ripple.prototype.defaults = {
		baseClass:"o-ripple",
		modifiers: null,
		widthDivider: 4
	};

	Ripple.defaults = Ripple.prototype.defaults;

})(this, jQuery);

(function( w, $ ){
	"use strict";

	var pluginName = "ripple",
		initSelector = ".js-" + pluginName;

	$.fn[ pluginName ] = function(){
		return this.each( function(){
			new w.componentNamespace.Ripple( this ).init();
		});
	};

	// auto-init on enhance (which is called on domready)
	$( document ).bind( "enhance", function( e ){
		$( $( e.target ).is( initSelector ) && e.target ).add( initSelector, e.target ).filter( initSelector )[ pluginName ]();
	});
})(this, jQuery);
