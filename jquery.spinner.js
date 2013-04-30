!function($) {

// SVG based spinner.
// For no SVG, an alternate element is inserted instead (e.g. animated gif).
// Requires requestAnimationFrame shim.
// start() returns promise object, e.g.:
//   $('.spinner').spinner('=start').done(function() { console.log('done'); });
// Alternatively, "spinnerStart" and "spinnerStop" events are called, e.g.:
//   $('.spinner').on('spinnerStop', function() { console.log('done'); });
// The elements created:
//	 svg.spinner-svg, the SVG element, should have height and width
//	 path.spinner-svg-path, the PATH element, should have a fill set to none and stroke set
//	 span.spinner-no-svg, the alternate element if SVG is not supported
// These elements can be affected with svgStyle, pathStyle, and alternateElement options, respectively.
var Spinner = {
	init: function(el, options) {
		this.$el = $(el);
    this.options = $.extend({}, Spinner.defaults, options);

		// create object
    this.hasSVG = document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
    if(!this.hasSVG) {
    	this.$svg = $(this.options.alternateElement);
    	this.$svg.css('visibility', 'hidden');
    	this.$path = $();
    } else {
	    this.$svg = $('<svg class="spinner-svg" viewbox="0 0 2 2"><path class="spinner-svg-path"/></svg>');
	    this.$path = this.$svg.find('path');
	    this.$svg.css(this.options.svgStyle);
	    this.$path.css(this.options.pathStyle);
	    this.$path.attr('transform', this.options.transform);
	  }
    this.$el.append(this.$svg);

    // add hide helper
    if(this.options.hideWhenInactive) {
	    this.$el.on('spinnerStart', function() { $(this).css('visibility', 'visible') });
	    this.$el.on('spinnerStop', function() { $(this).css('visibility', 'hidden') });
	    this.$el.css('visibility', 'hidden');
	  }

    // setup initial path
    var width = this.$svg.width();

    // this.rawPath = 'M 0 -{R2} v -{R1} A 1 1 0 {LARGE} 1 {X1} {Y1} L {X2} {Y2} A {R2} {R2} 0 {LARGE} 0 0 -{R2} z';
    this.rawPath = 'M 1 {1-R1} A {R1} {R1} 0 {LARGE} 1 {X2} {Y2}';
    this.rawPath = this.rawPath.
    	replace(/{R1}/g, this.options.radius).
    	replace(/{1-R1}/g, 1 - this.options.radius);
	},
	start: function() {
		this.stop();

		this.duration = this.options.relativeDuration ?
			this.options.duration :
			this.options.duration * this.totalAngles / 360;

		this.deferred = $.Deferred();
		this.deferred.done(this._done.bind(this));

		if(!this.hasSVG) {
			this.$svg.replaceWith(this.options.alternateElement);
			setTimeout(this.stop.bind(this), this.duration);
		} else {
			this.startTime = +new Date();
			this.requestFrameId = requestAnimationFrame(this._frame.bind(this));
		}

		this.$el.trigger('spinnerStart');
		return this.deferred.promise();
	},
	_done: function() {
		cancelAnimationFrame(this.requestFrameId);
		this.$el.removeClass('spinning');

		this.$el.trigger('spinnerStop');
	},
	stop: function() {
		if(!this.deferred) return;
		this.deferred.resolve();
		this.deferred = null;
	},
	_frame: function() {
		var now = +new Date();
		var keyframe = (now - this.startTime) / this.duration;

		if(keyframe > 1) {
			keyframe = 1;
		} else {
			this.requestFrameId = requestAnimationFrame(this._frame.bind(this));
		}

		var angle = keyframe*this.options.totalAngles / 360 * Math.PI * 2;
		var x1 = Math.sin(angle);
		var y1 = -Math.cos(angle);
 		var x2 = x1*this.options.radius + 1;
		var y2 = y1*this.options.radius + 1;
		var largeArc = angle > Math.PI;
		var path = this.rawPath.
			replace(/{X1}/g, x1).
			replace(/{Y1}/g, y1).
			replace(/{X2}/g, x2).
			replace(/{Y2}/g, y2).
			replace(/{LARGE}/g, largeArc ? 1 : 0);
		this.$path.attr('d', path);

		if(keyframe == 1) {
			this.stop();
		}
	}
}
Spinner.defaults = {
	radius: 0.75, // 0 - 1, specify to compliment stroke width
	totalAngles: 360, // in degrees, 0-360
	duration: 5000, // in milliseconds
	relativeDuration: true, // duration is for totalAngles path, rather than 0-360
	hideWhenInactive: true, // sets element to visibility: hidden when inactive

	alternateElement: '<span class="spinner-no-svg"></span>',
	transform: '', // a transform to apply to the path
	svgStyle: {},
	pathStyle: {}

	// example styling:
	// svgStyle: {
	// 	width: 500,
	// 	height: 500
	// },
	// pathStyle: {
	// 	fill: '#fff',
	// 	stroke: '#aaa',
	// 	strokeWidth: 0.01 // view box is 2 tall, so this is 1% of element height
	// },
	// transform: 'translate(1,1) scale(0.9, 0.9)', // reduce size to fit stroke
}

$.fn.spinner = function(method) {
  var methodArguments = $.makeArray(arguments).slice(1);
  var returnValue = /^=/.test(method);

  // init
  if(typeof method !== "string") {
    var options = method;
    return this.each(function() {
      var spinner = $(this).data('Spinner');
      if(!spinner) {
        spinner = Object.create(Spinner)
        spinner.init(this, options);
        $.data(this, 'Spinner', spinner);
      }
    });
  }

  // otherwise, method call

  // NOTE: we wrap the result in an array to ensure
  // null and undefine results do not get dropped.
  // However, if some elements do not have a spinner,
  // they are still silently dropped from the result array!
  return this.map(function() {
    var spinner = $(this).data('Spinner');
	  if( !spinner ) {
      return returnValue ?
        undefined :
        this;
    }

    var result = spinner[method].apply(spinner, methodArguments);

    return returnValue ?
      [result] :
      this;
	});
};

}(jQuery);