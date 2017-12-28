import {Component, OnInit, ViewContainerRef, ElementRef, ViewChild} from '@angular/core';
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
import {GoogleMapsService} from '../../../services/google-maps.service';




@Component({
  selector: 'app-home-hero',
  templateUrl: './home-hero.component.html',
  styleUrls: ['./home-hero.component.scss']
})
export class HomeHeroComponent implements OnInit {
  elem;
  svg;
  p;
  usJSON;
  width;
  height;
  parseDate;
  color;
  hexbin;
  radius;
  projection;
  path;
  data;
  map;
  @ViewChild('map') mapRef: ElementRef;
  constructor(
    private viewContainerRef: ViewContainerRef,
    private gmapService: GoogleMapsService
  ) {
    this.projection = d3Geo.geoAlbersUsa()
      .scale(1280)
      .translate([480, 300]);
  }

  ngOnInit() {
    this.elem = this.viewContainerRef.element.nativeElement;
    this.draw();

    this.gmapService.onReady().then(() => {
      this.map = new google.maps.Map(this.mapRef.nativeElement, {
        center: {lat: 40.7128, lng: -74.0060},
        scrollwheel: true,
        zoom: 8
      });
    });

  }

  draw() {
    this.svg = d3.select(this.elem).select('svg');
    this.width = +this.svg.attr('width');
    this.height = +this.svg.attr('height');

    this.parseDate = d3TimeFormat.timeParse('%x');

    this.color = d3Scale.scaleTime()
      .domain([new Date(1962, 0, 1), new Date(2006, 0, 1)])
      .range(['black', 'steelblue'])
      .interpolate(d3Interpolate.interpolateLab);

    this.hexbin = d3Hexbin.hexbin()
      .extent([[0, 0], [this.width, this.height]])
      .radius(5);

    this.radius = d3Scale.scaleSqrt()
      .domain([0, 10])
      .range([2, 5]);

// Per https://github.com/topojson/us-atlas

    this.path = d3Geo.geoPath();

    d3Queue.queue()
      .defer(d3Request.json, 'https://d3js.org/us-10m.v1.json')
      // .defer(d3Request.tsv, '/assets/walmart.tsv', this.places.bind(this))
      .defer(d3Request.json, '/assets/places.json')
      .await(this.ready.bind(this));
  }

  places2(d) {
    let $data = [];
    d.forEach((dd) => {
      let coors = dd.geometry.coordinates;
      this.p = this.projection(coors);
      if (this.p) {
        coors[0] = this.p[0];
        coors[1] = this.p[1];
        $data.push(coors);
      }
    });
    console.log(this.data);
    return $data;
  }

  ready(error, us, places) {
    this.data = this.places2(places);
    console.log(this.data);
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
      .data(this.hexbin(this.data).sort(function (a, b) {
        return b.length - a.length;
      }))
      .enter().append('path')
      .attr('d', (d) => {
        return this.hexbin.hexagon(this.radius(d.length));
      })
      .attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      })
      .attr('fill', 'white');
  }



}
