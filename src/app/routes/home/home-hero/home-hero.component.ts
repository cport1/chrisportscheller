import { Component, OnInit, ViewContainerRef, ElementRef } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3Hexbin from 'd3-hexbin';
import * as topojson from 'topojson';

@Component({
  selector: 'app-home-hero',
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss']
})
export class HomeHeroComponent implements OnInit {
  elem;
  svg;
  p;
  width;
  height;
  parseDate;
  color;
  hexbin;
  radius;
  projection;
  path;

  constructor(private viewContainerRef:ViewContainerRef) { }

  ngOnInit() {
    this.elem = this.viewContainerRef.element.nativeElement;
    this.draw();
  }

  draw() {
    this.svg = d3.select(this.elem).select('div');
    console.log(this.svg);
    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');

    this.parseDate = d3.timeParse('%x');

    this.color = d3.scaleTime()
      .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
      .range(['black', 'steelblue'])
      .interpolate(d3.interpolateLab);

    this.hexbin = d3Hexbin()
      .extent([[0, 0], [this.width, this.height]])
      .radius(10);

    this.radius = d3.scaleSqrt()
      .domain([0, 12])
      .range([0, 10]);

// Per https://github.com/topojson/us-atlas
    this.projection = d3.geoAlbersUsa()
      .scale(1280)
      .translate([480, 300]);

    this.path = d3.geoPath();

    d3.queue()
      .defer(d3.json, 'https://d3js.org/us-10m.v1.json')
      .defer(d3.tsv, 'https://bl.ocks.org/mbostock/raw/4330486/walmart.tsv', typeWalmart)
      .await(ready);

    function ready(error, us, walmarts) {
      if (error) { throw error; }

      this.svg.append('path')
        .datum(topojson.feature(us, us.objects.nation))
        .attr('class', 'nation')
        .attr('d', this.path);

      this.svg.append('path')
        .datum(topojson.mesh(us, us.objects.states, function (a, b) {
          return a !== b;
        }))
        .attr('class', 'states')
        .attr('d', this.path);

      this.svg.append('g')
        .attr('class', 'hexagon')
        .selectAll('path')
        .data(this.hexbin(walmarts).sort(function (a, b) {
          return b.length - a.length;
        }))
        .enter().append('path')
        .attr('d', function (d) {
          return this.hexbin.hexagon(this.radius(d.length));
        })
        .attr('transform', function (d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        })
        .attr('fill', function (d) {
          return this.color(d3.median(d, function (d) {
            return +d.date;
          }));
        });
    }

    function typeWalmart(d) {
      this.p = this.projection(d);
      d[0] = this.p[0], d[1] = this.p[1];
      d.date = this.parseDate(d.date);
      return d;
    }
  }

}
