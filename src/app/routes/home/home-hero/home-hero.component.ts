import { Component, OnInit, ViewContainerRef, ElementRef } from '@angular/core';
import * as d3 from 'd3-selection';
import * as d3TimeFormat from 'd3-time-format';
import * as d3Hexbin from 'd3-hexbin';
import * as topojson from 'topojson';
import * as d3Scale from 'd3-scale';
import * as d3Geo from 'd3-geo';
import * as d3Queue from 'd3-queue';
import * as d3Request from 'd3-request';
import * as d3Array from 'd3-array';
import * as d3Interpolate from 'd3-interpolate';

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

  constructor(private viewContainerRef: ViewContainerRef) {
    this.projection = d3Geo.geoAlbersUsa()
      .scale(1280)
      .translate([480, 300]);
  }

  ngOnInit() {
    this.elem = this.viewContainerRef.element.nativeElement;
    this.draw();
  }
  // for (var i =0; i < temp1.length; i++) {
  //   delete temp1[i]['type']
  // }

  draw() {
    this.svg = d3.select(this.elem).select('svg');
    console.log(this.svg);
    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');

    this.parseDate = d3TimeFormat.timeParse('%x');

    this.color = d3Scale.scaleTime()
      .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
      .range(['black', 'steelblue'])
      .interpolate(d3Interpolate.interpolateLab);

    this.hexbin = d3Hexbin.hexbin()
      .extent([[0, 0], [this.width, this.height]])
      .radius(10);

    this.radius = d3Scale.scaleSqrt()
      .domain([0, 12])
      .range([0, 10]);

// Per https://github.com/topojson/us-atlas

    this.path = d3Geo.geoPath();

    d3Queue.queue()
      .defer(d3Request.json, 'https://d3js.org/us-10m.v1.json')
      .defer(d3Request.json, '/assets/places.json')
      .await(this.ready.bind(this));

    // this.ready(error, us, walmarts);

  }

  places2(d) {
    console.log(d);
    this.p = this.projection(d[0].geometry.coordinates);
    console.log(this.p);
    d[0] = this.p[0],
    d[1] = this.p[1];
    return d;
  }
  places(d) {
    console.log(d);
    this.p = this.projection(d);
    // console.log(this.p);
    d[0] = this.p[0], d[1] = this.p[1];
    d.date = this.parseDate(d.date);
    return d;
  }

  ready(error, us, places) {
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
      .data(this.hexbin(places.geometry.coordinates).sort(function (a, b) {
        return b.length - a.length;
      }))
      .enter().append('path')
      .attr('d', (d) => {
        return this.hexbin.hexagon(this.radius(d.length));
      })
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .attr('fill', (d) => {
        return this.color(d3Array.median(d, () => {
          return 1;
        }));
    });
  }



}
