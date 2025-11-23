
import { Component, ElementRef, ViewChild, AfterViewInit, effect, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

interface DataPoint {
  axis: string;
  value: number; // 0-100 normalized
}

@Component({
  selector: 'app-stat-radar', // Keeping selector for compatibility
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full flex items-center justify-center relative overflow-hidden">
      <div #chartContainer class="w-full h-full"></div>
    </div>
  `
})
export class StatRadarComponent implements AfterViewInit, OnDestroy {
  data = input.required<DataPoint[]>();
  
  // Custom color palette for the rings
  colors = ['#ef4444', '#f97316', '#eab308', '#22d3ee', '#8b5cf6']; // Red, Orange, Yellow, Cyan, Violet

  @ViewChild('chartContainer') chartContainer!: ElementRef;
  private resizeObserver: ResizeObserver | null = null;

  constructor() {
    effect(() => {
      if (this.data()) {
        setTimeout(() => this.drawChart(), 0);
      }
    });
  }

  ngAfterViewInit() {
    this.drawChart();
    this.resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(() => this.drawChart());
    });
    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  ngOnDestroy() {
    if (this.resizeObserver) {
        this.resizeObserver.disconnect();
    }
  }

  drawChart() {
    if (!this.chartContainer) return;
    const element = this.chartContainer.nativeElement;
    d3.select(element).selectAll('*').remove();

    const width = element.clientWidth;
    const height = element.clientHeight;

    if (width === 0 || height === 0) return;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const data = this.data();
    const numRings = data.length;
    
    // Calculate Radius dimensions
    const maxRadius = Math.min(width, height) / 2 - 20;
    const innerRadius = 40; // Space for center content
    const ringWidth = (maxRadius - innerRadius) / numRings;
    const gap = 4; // Gap between rings

    // --- Draw Rings ---
    data.forEach((d, i) => {
      const rInner = innerRadius + i * ringWidth + gap;
      const rOuter = innerRadius + (i + 1) * ringWidth;
      const color = this.colors[i % this.colors.length];

      // 1. Background Track (dimmed)
      const bgArc = d3.arc()
        .innerRadius(rInner)
        .outerRadius(rOuter)
        .startAngle(0)
        .endAngle(2 * Math.PI)
        .cornerRadius(ringWidth / 2);

      svg.append('path')
        .attr('d', bgArc as any)
        .attr('fill', color)
        .attr('opacity', 0.1);

      // 2. Foreground Value Arc
      // Map value 0-100 to radians
      const endAngle = (d.value / 100) * 2 * Math.PI;
      
      const fgArc = d3.arc()
        .innerRadius(rInner)
        .outerRadius(rOuter)
        .startAngle(0)
        .endAngle(endAngle)
        .cornerRadius(ringWidth / 2);

      svg.append('path')
        .attr('fill', color)
        .attr('d', fgArc as any) // Initial draw (optional, animation handles it)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attrTween('d', function() {
          const interpolate = d3.interpolate(0, endAngle);
          return function(t) {
            const arcFn = d3.arc()
              .innerRadius(rInner)
              .outerRadius(rOuter)
              .startAngle(0)
              .endAngle(interpolate(t))
              .cornerRadius(ringWidth / 2);
            return arcFn(null as any) || '';
          };
        });

      // 3. Label at the start of the ring (optional, or use legend)
      // Let's add a small icon/text indicator at the top
      // Actually, let's put labels inside the ring or hover?
      // Clean look: Add a label at the 12 o'clock position if value > 0
      
      svg.append('text')
        .attr('x', 5)
        .attr('y', -(rInner + (ringWidth - gap)/2))
        .attr('dy', '0.35em')
        .text(d.axis.substring(0, 3).toUpperCase())
        .attr('fill', '#fff')
        .attr('font-size', '9px')
        .attr('font-weight', 'bold')
        .attr('opacity', 0.8)
        .style('pointer-events', 'none');
    });
  }
}
