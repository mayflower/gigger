/*

This file is part of Ext JS 4

Copyright (c) 2011 Sencha Inc

Contact:  http://www.sencha.com/contact

GNU General Public License Usage
This file may be used under the terms of the GNU General Public License version 3.0 as published by the Free Software Foundation and appearing in the file LICENSE included in the packaging of this file.  Please review the following information to ensure the GNU General Public License version 3.0 requirements will be met: http://www.gnu.org/copyleft/gpl.html.

If you are unsure which license is appropriate for your use, please contact the sales department at http://www.sencha.com/contact.

*/
Ext.require('Ext.chart.*');
Ext.require(['Ext.Window', 'Ext.fx.target.Sprite', 'Ext.layout.container.Fit']);

var Renderers = {};

(function() {
     var ColorManager = {
       rgbToHsv: function(rgb) {
           var r = rgb[0] / 255,
               g = rgb[1] / 255,
               b = rgb[2] / 255,
               rd = Math.round,
               minVal = Math.min(r, g, b),
               maxVal = Math.max(r, g, b),
               delta = maxVal - minVal,
               h = 0, s = 0, v = 0,
               deltaRgb;

           v = maxVal;

           if (delta == 0) {
             return [0, 0, v];
           } else {
             s = delta / maxVal;
             deltaRgb = {
                 r: (((maxVal - r) / 6) + (delta / 2)) / delta,
                 g: (((maxVal - g) / 6) + (delta / 2)) / delta,
                 b: (((maxVal - b) / 6) + (delta / 2)) / delta
             };
             if (r == maxVal) {
                 h = deltaRgb.b - deltaRgb.g;
             } else if (g == maxVal) {
                 h = (1 / 3) + deltaRgb.r - deltaRgb.b;
             } else if (b == maxVal) {
                 h = (2 / 3) + deltaRgb.g - deltaRgb.r;
             }
             //handle edge cases for hue
             if (h < 0) {
                 h += 1;
             }
             if (h > 1) {
                 h -= 1;
             }
           }

           h = rd(h * 360);
           s = rd(s * 100);
           v = rd(v * 100);

           return [h, s, v];
       },

       hsvToRgb : function(hsv) {
           var h = hsv[0] / 360,
               s = hsv[1] / 100,
               v = hsv[2] / 100,
               r, g, b, rd = Math.round;

           if (s == 0) {
             v *= 255;
             return [v, v, v];
           } else {
             var vh = h * 6,
                 vi = vh >> 0,
                 v1 = v * (1 - s),
                 v2 = v * (1 - s * (vh - vi)),
                 v3 = v * (1 - s * (1 - (vh - vi)));

             switch(vi) {
                 case 0:
                     r = v; g = v3; b = v1;
                     break;
                 case 1:
                     r = v2; g = v; b = v1;
                     break;
                 case 2:
                     r = v1; g = v; b = v3;
                     break;
                 case 3:
                     r = v1; g = v2; b = v;
                     break;
                 case 4:
                     r = v3; g = v1; b = v;
                     break;
                 default:
                     r = v; g = v1; b = v2;
             }
             return [rd(r * 255),
                     rd(g * 255),
                     rd(b * 255)];
           }
       }
    };
    //Generic number interpolator
    var delta = function(x, y, a, b, theta) {
            return a + (b - a) * (y - theta) / (y - x);
    };
    //Add renderer methods.
    Ext.apply(Renderers, {
        color: function(fieldName, minColor, maxColor, minValue, maxValue) {
            var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*/,
                minColorMatch = minColor.match(re),
                maxColorMatch = maxColor.match(re),
                interpolate = function(theta) {
                    return [ delta(minValue, maxValue, minColor[0], maxColor[0], theta),
                             delta(minValue, maxValue, minColor[1], maxColor[1], theta),
                             delta(minValue, maxValue, minColor[2], maxColor[2], theta) ];
                };
            minColor = ColorManager.rgbToHsv([ +minColorMatch[1], +minColorMatch[2], +minColorMatch[3] ]);
            maxColor = ColorManager.rgbToHsv([ +maxColorMatch[1], +maxColorMatch[2], +maxColorMatch[3] ]);
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    rgb = ColorManager.hsvToRgb(interpolate(value)),
                    rgbString = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
                return Ext.apply(attr, {
                    fill: rgbString
                });
            };
        },

        grayscale: function(fieldName, minColor, maxColor, minValue, maxValue) {
            var re = /rgb\s*\(\s*([0-9]+)\s*,\s*([0-9]+)\s*,\s*([0-9]+)\s*\)\s*/,
            minColorMatch = minColor.match(re),
            maxColorMatch = maxColor.match(re),
            interpolate = function(theta) {
                var ans = delta(minValue, maxValue, +minColorMatch[1], +maxColorMatch[1], theta) >> 0;
                return [ ans, ans, ans ];
            };
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    rgb = interpolate(value),
                    rgbString = 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';

                return Ext.apply(attr, {
                    fill: rgbString,
                    strokeFill: 'rgb(0, 0, 0)'
                });
            };
        },

        radius: function(fieldName, minRadius, maxRadius, minValue, maxValue) {
            var interpolate = function(theta) {
                return delta(minValue, maxValue, minRadius, maxRadius, theta);
            };
            //Return the renderer
            return function(sprite, record, attr, index, store) {
                var value = +record.get(fieldName),
                    radius = interpolate(value);

                return Ext.apply(attr, {
                    radius: radius,
                    size: radius
                });
            };
        }
    });
})();

Ext.onReady(function () {
    //current renderer configuration
    var rendererConfiguration = {
        xField: 'x',
        yField: 'y',
        color: false,
        colorFrom: 'rgb(250, 20, 20)',
        colorTo: 'rgb(127, 0, 240)',
        scale: false,
        scaleFrom: 'rgb(20, 20, 20)',
        scaleTo: 'rgb(220, 220, 220)',
        radius: false,
        radiusSize: 50
    };
    //update the visualization with the new renderer configuration
    function refresh() {
        var chart = Ext.getCmp('chartCmp'),
            series = chart.series.items,
            len = series.length,
            rc = rendererConfiguration,
            color, grayscale, radius, s;

        for(var i = 0; i < len; i++) {
            s = series[i];
            s.xField = rc.xField;
            s.yField = rc.yField;
            color = rc.color? Renderers.color(rc.color, rc.colorFrom, rc.colorTo, 0, 100) : function(a, b, attr) { return attr; };
            grayscale = rc.grayscale? Renderers.grayscale(rc.grayscale, rc.scaleFrom, rc.scaleTo, 0, 100) : function(a, b, attr) { return attr; };
            radius = rc.radius? Renderers.radius(rc.radius, 10, rc.radiusSize, 0, 100) : function(a, b, attr) { return attr; };
            s.renderer = function(sprite, record, attr, index, store) {
                return radius(sprite, record, grayscale(sprite, record, color(sprite, record, attr, index, store), index, store), index, store);
            };
        }
        chart.redraw();
    }

    var win = Ext.create('Ext.Window', {
        width: 400,
        height: 300,
        hidden: false,
        maximizable: true,
        title: 'Scatter Chart Renderer',
        renderTo: Ext.getBody(),
        layout: 'fit',
        items: {
            id: 'chartCmp',
            xtype: 'chart',
            style: 'background:#fff',
            animate: true,
            store: heatStore,
            axes: [{
                type: 'Numeric',
                position: 'bottom',
                fields: ['x'],
                title: 'X-Axis',
                minimum: 800,
                maximum: 0
            }, {
                type: 'Numeric',
                position: 'left',
                fields: ['y'],
                title: 'Y-Axis',
                minimum: 800,
                maximum: 0
            }],
            insetPadding: 50,
            series: [{
                type: 'cartesian',
                axis: true,
                xField: 'x',
                yField: 'y',
                color: '#ccc',
                markerConfig: {
                    type: 'circle',
                    radius: 5,
                    size: 20
                }
            }]
        }
    });
});
