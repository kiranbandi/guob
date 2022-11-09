import { selectDraggables } from "features/draggable/draggableSlice"
import { useDispatch, useSelector } from "react-redux"
import { scaleLinear } from "d3-scale"
import Links from 'components/layout/Links';
import React, { useState, useEffect } from 'react';


// import * as d3 from 'd3';

import { selectBasicTracks } from "./basicTrackSlice"



var orthologs = window.orthologs;  

function  findGene(geneSearched) {


    for ( let entry of window.dataset){
        if (entry.gene.toLowerCase() == geneSearched.toLowerCase()){

            return entry;
        }
    }
}


function findChromosome(gene){
    // console.log(window.orthologs)
    let chrom = gene.slice(0, 3);
    return chrom.toLowerCase();
}
function findOrthologs (c1, c2){
    let orthologPairs=[];

    for ( let gene of orthologs){
        if (findChromosome(gene.source.toLowerCase()) ==  c1 && findChromosome(gene.target.toLowerCase()) == c2){

            orthologPairs.push({source: gene.source, target: gene.target})
        }
        else if (findChromosome(gene.target.toLowerCase()) ==  c1 && findChromosome(gene.source.toLowerCase()) == c2){

            orthologPairs.push({source: gene.target, target: gene.source})
        }
    }

    return orthologPairs;

}

let dataSet1 = [{type: "line", source: {x: 623.9910809660769, y:0}, target: {x: 624.2136712245092, y:50}}];
const OrthologLinks = ({index, id,...props}) =>{

    
    const trackSelector =  useSelector(selectBasicTracks)
    const indexSelector = useSelector(selectDraggables)

    // These should have all the information from the tracks, including zoom level + offset
    let aboveData = trackSelector[indexSelector[index - 1]]
    let belowData = trackSelector[indexSelector[index + 1]]
    console.log(aboveData)
    // Just finding these values for the returned example div below
    let aboveArray = trackSelector[indexSelector[index - 1]] ? trackSelector[indexSelector[index - 1]].array : []
    let belowArray =  trackSelector[indexSelector[index + 1]] ? trackSelector[indexSelector[index + 1]].array : []
    let aboveLength = aboveArray.length 
    let aboveCap = aboveLength > 0 ?  Math.max(...aboveArray.map(d=> d.end)) : 0
    let belowLength = belowArray.length
    let belowCap = belowLength > 0 ? Math.max(...belowArray.map(d=> d.end)) : 0

    let orthologPairs =  findOrthologs(indexSelector[index - 1],  indexSelector[index + 1]);
    //{type: "polygon", source: {x: 0,x1: 0,y1:0, y:0}, target: {x:100,x1: 200, y1: 100, y:100}}

    let arrayLinks =[];
    let parentWrapperHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width;

    const maxWidth =Math.round(parentWrapperWidth * 0.98);


    // console.log(maxWidth)

    for (var pair of orthologPairs){
        let chromAbove = indexSelector[index - 1];
        let chromoBelow = indexSelector[index + 1];

        let geneAbove = findGene(pair.source);
        let geneBelow = findGene(pair.target);
        const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;
        let xScale1 = scaleLinear().domain([0, aboveCap]).range([paddingLeft, (maxWidth) - paddingRight])
        let xScale2 = scaleLinear().domain([0, belowCap]).range([paddingLeft, (maxWidth) - paddingRight])

        arrayLinks.push({type: "polygon",color: "purple", source: {x: xScale1(geneAbove.start), x1:  xScale1(geneAbove.end), y:0 }, target: {x: xScale2(geneBelow.start), x1: xScale2(geneBelow.end), y: parentWrapperHeight}})

       
    }
    console.log(arrayLinks)
    // console.log(window.dataset)

    return(
    <>
        <div id={id}>
            {/* <a>The track above this is {indexSelector[index - 1]}, it has {aboveLength} items in the datataset, with the end being {aboveCap}</a>
            <br/>
            <a>The track below this is {indexSelector[index + 1]}, it has {belowLength} items in the datataset, with the end being {belowCap}</a> */}

            <Links arrayCoordinates={arrayLinks} type="svg"  width={(maxWidth) - 10} />
        </div>
    </>
    )
}

export default OrthologLinks;