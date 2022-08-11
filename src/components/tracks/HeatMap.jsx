import React, { useEffect, useRef } from "react";
import { extent } from "d3-array";
import { select } from "d3-selection";

const HeatMap = ({ data }) => {

    const chartRef = useRef('chart-' + (Math.floor(Math.random() * 1000000)));

    useEffect(() => {

        if (data) {

            const dataMap = data.monthlyVariance,
                baseTemperature = data.baseTemperature,
                yearRange = extent(dataMap, d => { return d.year; });

            const legendData = [
                { 'interval': 2.7, 'color': 'purple' },
                { 'interval': 3.9, 'color': 'darkorchid' },
                { 'interval': 6.1, 'color': 'mediumpurple' },
                { 'interval': 7.2, 'color': 'lightskyblue' },
                { 'interval': 8.3, 'color': 'khaki' },
                { 'interval': 9.4, 'color': 'orange' },
                { 'interval': 10.5, 'color': 'salmon' },
                { 'interval': 11.6, 'color': 'indianred' },
                { 'interval': 15, 'color': 'darkred' }
            ];

            const width = document.body.offsetWidth*0.85,
                height = 800,
                margins = { top: 10, right: 10, bottom: 10, left: 10 };


            //Setting chart width and adjusting for margins
            const chart = select('#' + chartRef.current)
                .attr('width', width + margins.right + margins.left)
                .attr('height', height + margins.top + margins.bottom)
                .append('g')
                .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

            const barWidth = width / (yearRange[1] - yearRange[0]),
                barHeight = 50;

            //Return dynamic color based on intervals in legendData
            const colorScale = d => {
                for (let i = 0; i < legendData.length; i++) {
                    if (d.variance + baseTemperature < legendData[i].interval) {
                        return legendData[i].color;
                    }
                }
                return 'darkred';
            };

            //Append heatmap bars, styles, and mouse events
            chart.selectAll('g')
                .data(dataMap).enter().append('g')
                .append('rect')
                .attr('x', d => { return (d.year - yearRange[0]) * barWidth })
                .attr('y', d => { return (d.month - 1) * barHeight + (d.month * 15) })
                .style('fill', colorScale)
                .attr('width', barWidth)
                .attr('height', barHeight)
        }

        return () => {
            select('#' + chartRef.current).selectAll('*').remove();
        };


    }, [data])


    return <svg
        id={chartRef.current}
        className='track heat-map'
    />
}

HeatMap.defaultProps = {
    data: [],
    width: '500px',
    height: '100px'
}


export default HeatMap;
