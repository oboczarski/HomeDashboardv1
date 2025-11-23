
import { Component, ElementRef, ViewChild, AfterViewInit, effect, input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as d3 from 'd3';

export interface BarData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-stat-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full h-full relative">
      <div #chartContainer class="w-full h-full"></div>
    </div>
  `
})
export class StatBarComponent implements AfterViewInit, OnDestroy {
  data = input.required<BarData[]>();

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

    const margin = { top: 40, right: 15, bottom: 30, left: 15 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const defs = svg.append('defs');

    // 1. Neon Blur Filter for the glow
    const filter = defs.append('filter')
      .attr('id', 'neon-glow')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '3') // Slightly tighter blur for cleaner look
      .attr('result', 'coloredBlur');
    
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const data = this.data();

    // X Scale
    const x = d3.scaleBand()
      .range([0, innerWidth])
      .domain(data.map(d => d.label))
      .padding(0.45); // Slightly tighter bars

    // Y Scale
    const maxValue = d3.max(data, d => d.value) || 0;
    const y = d3.scaleLinear()
      .range([innerHeight, 0])
      .domain([0, maxValue * 1.15]); 

    // Color Scale: Based on Index (Position) for smooth L -> R flow
    // Left (Index 0) = Cyan/Blue
    // Right (Index N) = Purple/Violet
    const colorScale = d3.scaleLinear<string>()
        .domain([0, data.length - 1]) 
        .range(['#06b6d4', '#a855f7']) // Cyan-500 -> Purple-500
        .interpolate(d3.interpolateRgb);

    // Generate per-bar gradients
    data.forEach((d, i) => {
      const color = colorScale(i);
      const gradId = `bar-grad-${i}`;
      const grad = defs.append('linearGradient')
        .attr('id', gradId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      
      // Top: Semi-transparent color (Glassy)
      grad.append('stop').attr('offset', '0%').attr('stop-color', color).attr('stop-opacity', 0.5);
      // Mid: Fading out
      grad.append('stop').attr('offset', '70%').attr('stop-color', color).attr('stop-opacity', 0.1);
      // Bottom: Transparent
      grad.append('stop').attr('offset', '100%').attr('stop-color', color).attr('stop-opacity', 0.0);
    });

    const barGroups = g.selectAll('.bar-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'bar-group');

    const barWidth = x.bandwidth();
    const radius = barWidth / 2; // Fully rounded pill shape

    // 1. The "Glow" Layer (Blurred Stroke Background)
    barGroups.append('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', innerHeight)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', 'none')
      .attr('stroke', (d, i) => colorScale(i))
      .attr('stroke-width', 6)
      .attr('stroke-opacity', 0.3)
      .style('filter', 'url(#neon-glow)')
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerHeight - y(d.value));

    // 2. The "Fill" Layer (Gradient Interior)
    barGroups.append('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', innerHeight)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', (d, i) => `url(#bar-grad-${i})`) // Use the dynamic gradient
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerHeight - y(d.value));

    // 3. The "Outline" Layer (Solid Stroke - The "Tube")
    barGroups.append('rect')
      .attr('x', d => x(d.label)!)
      .attr('y', innerHeight)
      .attr('width', barWidth)
      .attr('height', 0)
      .attr('rx', radius)
      .attr('ry', radius)
      .attr('fill', 'none') 
      .attr('stroke', (d, i) => colorScale(i))
      .attr('stroke-width', 2.5)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.value))
      .attr('height', d => innerHeight - y(d.value));

    // 4. Value Labels (Above Bar)
    barGroups.append('text')
      .text(d => d.value.toFixed(1))
      .attr('x', d => x(d.label)! + barWidth / 2)
      .attr('y', innerHeight)
      .attr('text-anchor', 'middle')
      .attr('fill', (d, i) => colorScale(i))
      .attr('font-size', '14px')
      .attr('font-weight', '700')
      .style('text-shadow', '0 0 10px rgba(0,0,0,1)')
      .style('opacity', 0)
      .transition()
      .duration(1000)
      .delay((d, i) => i * 50 + 400)
      .attr('y', d => y(d.value) - 10)
      .style('opacity', 1);

    // 5. X Axis Labels (Names)
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('fill', '#94a3b8')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .attr('dy', '18px'); // Push text down slightly

    g.select('.domain').remove();
  }
}
