!function($) {

// SVG Donut animation, can animate a path element as a donut shape, useful for timers.
// detect svg: document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1");
// example usage:
// var spinner = $('<svg class="spinner" width="100" height="100" viewbox="0 0 100 100"><path fill="none" stroke="#900" stroke-width="20"></svg>');
// $('body').append(spinner);
// spinner.find('path').animate({donutAngle: 360}, 10000);
var Donut = {
    setPath: function(el, donut) {
        var angle = donut.angle;
        if( angle != 360)
            angle = angle % 360;
        if( angle < 0 )
            angle += 360;
        if( angle > 359.99 & angle <= 360 )
            angle = 359.99;
        angle = angle / 360 * Math.PI*2;
        var radius = donut.radius;
        var centerX = donut.centerX;
        var centerY = donut.centerY;
        var x1 = centerX;
        var y1 = centerY - radius;
        var x2 = Math.sin(angle)*radius + centerX;
        var y2 = -Math.cos(angle)*radius + centerY;
        var largeArc = angle > Math.PI;
        var path = 'M {X1} {Y1} A {R} {R} 0 {LARGE} 1 {X2} {Y2}'.
            replace(/{R}/g, radius).
            replace(/{X1}/g, x1).
            replace(/{Y1}/g, y1).
            replace(/{X2}/g, x2).
            replace(/{Y2}/g, y2).
            replace(/{LARGE}/g, largeArc ? 1 : 0);
        el.setAttribute('d', path);
    },
    getDonut: function(el) {
        var donut = $.data(el, 'donut');
        if(!donut) {
            donut = {
                angle: 0,
                radius: 40,
                centerX: 50,
                centerY: 50
            };
            $.data(el, 'donut', donut);
        }
        return donut;
    }
}
var DonutHook = function(prop) {
    this.get = function(el) {
        return Donut.getDonut(el)[prop];
    }
    this.set = function(el, val) {
        val = parseFloat(val);
        var donut = Donut.getDonut(el);
        donut[prop] = val;
        Donut.setPath(el, donut);
    }
}
$.cssHooks.donutAngle = new DonutHook('angle');
$.cssHooks.donutRadius = new DonutHook('radius');
$.cssHooks.donutCenterX = new DonutHook('centerX');
$.cssHooks.donutCenterY = new DonutHook('centerY');

}(jQuery);
