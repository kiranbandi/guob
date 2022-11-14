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

function searchTrack(geneSearched, trackDataset){
    return trackDataset.find((d) => d.key.toLowerCase() == geneSearched.toLowerCase())
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
const OrthologLinks = ({index, id, topTrack, bottomTrack, ...props}) =>{

    let aboveLength = topTrack ? topTrack.array.length : 0
    let aboveCap = aboveLength > 0 ?  Math.max(...topTrack.array.map(d=> d.end)) : 0
    let belowLength = bottomTrack ? bottomTrack.array.length : 0
    let belowCap = belowLength > 0 ? Math.max(...bottomTrack.array.map(d=> d.end)) : 0

    let topKey = topTrack ? topTrack.key : undefined
    let bottomKey = bottomTrack ? bottomTrack.key : undefined

    let orthologPairs =  findOrthologs(topKey,  bottomKey);
    //{type: "polygon", source: {x: 0,x1: 0,y1:0, y:0}, target: {x:100,x1: 200, y1: 100, y:100}}

    let arrayLinks = [];
    let parentWrapperHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height,
        parentWrapperWidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width;

    const maxWidth = Math.round(parentWrapperWidth * 0.98);


    for (var pair of orthologPairs){


        // let geneAbove = findGene(pair.source);
        let geneAbove = searchTrack(pair.source, topTrack.array)
        // let geneBelow = findGene(pair.target);
        let geneBelow = findGene(pair.target, bottomTrack.array)
        console.log(geneAbove)

        const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;
        let xScale1 = scaleLinear().domain([0, aboveCap]).range([paddingLeft, (maxWidth * topTrack.zoom) - paddingRight])
        let xScale2 = scaleLinear().domain([0, belowCap]).range([paddingLeft, (maxWidth * bottomTrack.zoom) - paddingRight])
        
        let widthScale1 = scaleLinear().domain([0, aboveCap]).range([0, (maxWidth * topTrack.zoom) - paddingRight])
        let widthScale2 = scaleLinear().domain([0, belowCap]).range([0, (maxWidth * bottomTrack.zoom) - paddingRight])

        let topX1 = xScale1(geneAbove.start) + topTrack.offset
        let topX2 = xScale1(geneAbove.start) + widthScale1(geneAbove.end - geneAbove.start) + topTrack.offset
        
        let bottomX1 = xScale2(geneBelow.start) + bottomTrack.offset
        let bottomX2 = xScale2(geneBelow.start) + widthScale2(geneBelow.end - geneBelow.start) + bottomTrack.offset

        
        console.log(widthScale1(geneAbove.end - geneAbove.start))
        console.log(topX2)

        arrayLinks.push({type: "polygon",color: "purple", source: {x: topX1, x1:  topX2, y:0 }, target: {x: bottomX1, x1: bottomX2, y: parentWrapperHeight}})

       
    }
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