/*
 * js-ripple - v1.0.0 - 2016-07-29
 * Ripple effects
 * https://github.com/vmitsaras/js-button
 * Copyright (c) 2016 Vasileios Mitsaras (@vmitsaras)
 * License MIT
 */

/* global Modernizr:true */
;(function( w ){
	"use strict";

	var utils = {};

	utils.classes = {
		hiddenVisually: "u-hidden-visually",
		modifier: "--",
		isActive: "is-active",
		isClosed: "is-closed",
		isOpen: "is-open",
		isClicked: "is-clicked",
		isAnimating: "is-animating",
		hidden: "u-hidden"
	};

	utils.keyCodes = {
		BACKSPACE: 8,
		COMMA: 188,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		LEFT: 37,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SPACE: 32,
		TAB: 9,
		UP: 38
	};

	/**
	 * a11yclick
	 * Slightly modified from: http://www.karlgroves.com/2014/11/24/ridiculously-easy-trick-for-keyboard-accessibility/
	 */
	utils.a11yclick = function(event) {
		var code = event.charCode || event.keyCode,
			type = event.type;

		if (type === 'click') {
			return true;
		} else if (type === 'keydown') {
			if (code === utils.keyCodes.SPACE || code === utils.keyCodes.ENTER) {
				return true;
			}
		} else {
			return false;
		}
	};

	utils.doc = w.document;
	utils.supportTransition = Modernizr.csstransitions;
	utils.supportAnimations = Modernizr.cssanimations;
	utils.transEndEventNames = {
		'WebkitTransition'	: 'webkitTransitionEnd',
		'MozTransition'		: 'transitionend',
		'OTransition'		: 'oTransitionEnd',
		'msTransition'		: 'MSTransitionEnd',
		'transition'		: 'transitionend'
	};
	utils.animEndEventNames = {
		'WebkitAnimation' : 'webkitAnimationEnd',
		'OAnimation' : 'oAnimationEnd',
		'msAnimation' : 'MSAnimationEnd',
		'animation' : 'animationend'
	};
	utils.transEndEventName = utils.transEndEventNames[Modernizr.prefixed('transition')];
	utils.animEndEventName = utils.animEndEventNames[Modernizr.prefixed('animation')];

	utils.onEndTransition = function( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( utils.supportTransition ) {
				if( ev.target != this ) return;
				this.removeEventListener( utils.transEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};
		if( utils.supportTransition ) {
			el.addEventListener( utils.transEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	};

	utils.onEndAnimation = function( el, callback ) {
		var onEndCallbackFn = function( ev ) {
			if( utils.supportAnimations ) {
				if( ev.target != this ) return;
				this.removeEventListener( utils.animEndEventName, onEndCallbackFn );
			}
			if( callback && typeof callback === 'function' ) { callback.call(); }
		};
		if( utils.supportAnimations ) {
			el.addEventListener( utils.animEndEventName, onEndCallbackFn );
		}
		else {
			onEndCallbackFn();
		}
	};

	utils.createModifierClass = function( cl, modifier ){
		return cl + utils.classes.modifier + modifier
	};

	utils.cssModifiers = function( modifiers, cssClasses, baseClass ){
		var arr = modifiers.split(",");
		for(var i=0, l = arr.length; i < l; i++){
			cssClasses.push( utils.createModifierClass(baseClass,arr[i]) );
		}
	};

	utils.getMetaOptions = function( el, name, metadata ){
		var dataAttr = 'data-' + name;
		var dataOptionsAttr = dataAttr + '-options';
		var attr = el.getAttribute( dataAttr ) || el.getAttribute( dataOptionsAttr );
		try {
			return attr && JSON.parse( attr ) || {};
		} catch ( error ) {
			// log error, do not initialize
			if ( console ) {
				console.error( 'Error parsing ' + dataAttr + ' on ' + el.className + ': ' + error );
			}
			return;
		}
	};

	// expose global utils
	w.utils = utils;

})(this);


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
