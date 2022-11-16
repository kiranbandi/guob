import { selectDraggables } from "features/draggable/draggableSlice"
import { useDispatch, useSelector } from "react-redux"
import { scaleLinear } from "d3-scale"
import Links from 'components/layout/Links';
import React, { useState, useEffect, useRef } from 'react';
import { pan, changeZoom } from "./basicTrackSlice";
import { panComparison } from "features/miniview/miniviewSlice";

// import * as d3 from 'd3';

import { selectBasicTracks } from "./basicTrackSlice"



var orthologs = window.orthologs;

function findGene(geneSearched) {

    for (let entry of window.dataset) {
        if (entry.gene.toLowerCase() == geneSearched.toLowerCase()) {

            return entry;
        }
    }
}

function searchTrack(geneSearched, trackDataset) {
    return trackDataset.find((d) => d.key.toLowerCase() == geneSearched.toLowerCase())
}

function findChromosome(gene) {
    let chrom = gene.slice(0, 3);
    return chrom.toLowerCase();
}
function findOrthologs(c1, c2) {
    let orthologPairs = [];

    for (let gene of orthologs) {
        if (findChromosome(gene.source.toLowerCase()) == c1 && findChromosome(gene.target.toLowerCase()) == c2) {
            orthologPairs.push({ source: gene.source, target: gene.target })
        }
        else if (findChromosome(gene.target.toLowerCase()) == c1 && findChromosome(gene.source.toLowerCase()) == c2) {

            orthologPairs.push({ source: gene.target, target: gene.source })
        }
    }

    return orthologPairs;

}

let dataSet1 = [{ type: "line", source: { x: 623.9910809660769, y: 0 }, target: { x: 624.2136712245092, y: 50 } }];
const OrthologLinks = ({ index, id, normalize, ...props }) => {


    const trackSelector = useSelector(selectBasicTracks)
    const indexSelector = useSelector(selectDraggables)
    const linkRef = useRef(1)

    const dispatch = useDispatch()

    const [clickLocation, setClickLocation] = useState()
    const [dragging, setDragging] = useState()

    // These should have all the information from the tracks, including zoom level + offset
    let topTrack = trackSelector[indexSelector[index - 1]]
    let bottomTrack = trackSelector[indexSelector[index + 1]]

    const parentWrapperWidth = document.querySelector('.draggable')?.getBoundingClientRect()?.width;
    const maxWidth = Math.round(parentWrapperWidth * 0.98)

    useEffect(() => {
        linkRef.current.addEventListener('wheel', preventScroll, { passive: false });
        // if alt key is pressed then stop the event 
        function preventScroll(e) {
            if (e.altKey == true) {
                e.preventDefault();
                // e.stopPropagation();
                return false;
            }
        }
    }, [])


    function handleScroll(e) {
        if (e.altKey == true) {
            let factor = 0.8
            if (e.deltaY < 0) {
                factor = 1 / factor
            }

            let boundingBox = e.target.getBoundingClientRect()
            let normalizedLocation = ((e.clientX - boundingBox.x) / boundingBox.width) * maxWidth
            let dx = ((normalizedLocation - topTrack.offset) * (factor - 1))
            let offsetX = Math.max(Math.min(topTrack.offset - dx, 0), -((maxWidth * topTrack.zoom * factor) - maxWidth))
            if (Math.max(topTrack.zoom * factor, 1.0) === 1.0) offsetX = 0

            dispatch(pan({
                key: topTrack.key,
                offset: offsetX
            }))

            dx = ((normalizedLocation - bottomTrack.offset) * (factor - 1))
            offsetX = Math.max(Math.min(bottomTrack.offset - dx, 0), -((maxWidth * bottomTrack.zoom * factor) - maxWidth))
            if (Math.max(bottomTrack.zoom * factor, 1.0) === 1.0) offsetX = 0

            dispatch(pan({
                key: bottomTrack.key,
                offset: offsetX
            }))

            dispatch(changeZoom({
                key: topTrack.key,
                zoom: Math.max(topTrack.zoom * factor, 1.0)
            }))
            dispatch(changeZoom({
                key: bottomTrack.key,
                zoom: Math.max(bottomTrack.zoom * factor, 1.0)
            }))
        }
    }

    function handleClick(e) {
        if (e.type == 'mousedown') {
            setDragging(true)
            setClickLocation(e.clientX)
        }
        if (e.type == 'mouseup') {
            setDragging(false)
            setClickLocation(null)
        }
    }

    function handlePan(e) {
        // Panning both tracks
        if (dragging === true) {

            if (!topTrack || !bottomTrack) return

            
            let boundingBox = e.target.parent ? e.target.parent.getBoundingClientRect() : e.target.getBoundingClientRect()
            let offsetX = Math.max(Math.min(topTrack.offset + e.movementX, 0), -((maxWidth * topTrack.zoom) - maxWidth))
           
            dispatch(pan({
                key: topTrack.key,
                offset: offsetX,
            }))
            // debugger
            dispatch(panComparison({
                key: topTrack.key,
                offset: offsetX + boundingBox.x,
                zoom: Math.max(topTrack.zoom, 1.0),
                width: maxWidth,
                ratio: maxWidth / boundingBox.width,
                left: boundingBox.left,
                realWidth: boundingBox.width,
                factor: 1.0
            }))

            offsetX = Math.max(Math.min(bottomTrack.offset + e.movementX, 0), -((maxWidth * bottomTrack.zoom) - maxWidth))
            dispatch(pan({
                key: bottomTrack.key,
                offset: offsetX,
            }))

            dispatch(panComparison({
                key: bottomTrack.key,
                offset: offsetX + boundingBox.x,
                zoom: Math.max(bottomTrack.zoom, 1.0),
                width: maxWidth,
                ratio: maxWidth / boundingBox.width,
                left: boundingBox.left,
                realWidth: boundingBox.width,
                factor: 1.0
            }))
        }
    }

    //######################################################################################

    let aboveLength = topTrack ? topTrack.array.length : 0
    let aboveCap = aboveLength > 0 ? Math.max(...topTrack.array.map(d => d.end)) : 0
    let belowLength = bottomTrack ? bottomTrack.array.length : 0
    let belowCap = belowLength > 0 ? Math.max(...bottomTrack.array.map(d => d.end)) : 0

    let topKey = topTrack ? topTrack.key : undefined
    let bottomKey = bottomTrack ? bottomTrack.key : undefined

    let orthologPairs = findOrthologs(topKey, bottomKey);
    //{type: "polygon", source: {x: 0,x1: 0,y1:0, y:0}, target: {x:100,x1: 200, y1: 100, y:100}}

    let arrayLinks = [];
    let parentWrapperHeight = document.querySelector('.draggable')?.getBoundingClientRect()?.height



    for (var pair of orthologPairs) {

        // let geneAbove = findGene(pair.source);
        let geneAbove = searchTrack(pair.source, topTrack.array)
        // let geneBelow = findGene(pair.target);
        let geneBelow = searchTrack(pair.target, bottomTrack.array)

        const paddingRight = 10, paddingLeft = 10, paddingTop = 10, paddingBottom = 10;

        let topRatio = normalize ? aboveCap / topTrack.normalizedLength : 1.0
        let bottomRatio = normalize ? belowCap / bottomTrack.normalizedLength : 1.0

        let xScale1 = scaleLinear().domain([0, aboveCap]).range([paddingLeft, (maxWidth * topRatio * topTrack.zoom) - paddingRight])
        let xScale2 = scaleLinear().domain([0, belowCap]).range([paddingLeft, (maxWidth * bottomRatio * bottomTrack.zoom) - paddingRight])

        let widthScale1 = scaleLinear().domain([0, aboveCap]).range([0, (maxWidth * topTrack.zoom) - paddingRight])
        let widthScale2 = scaleLinear().domain([0, belowCap]).range([0, (maxWidth * bottomTrack.zoom) - paddingRight])

        let topX1 = xScale1(geneAbove.start) + topTrack.offset
        let topX2 = xScale1(geneAbove.start) + widthScale1(geneAbove.end - geneAbove.start) + topTrack.offset

        let bottomX1 = xScale2(geneBelow.start) + bottomTrack.offset
        let bottomX2 = xScale2(geneBelow.start) + widthScale2(geneBelow.end - geneBelow.start) + bottomTrack.offset

        arrayLinks.push({ type: "polygon", color: "purple", above: geneAbove.key, below: geneBelow.key, source: { x: topX1, x1: topX2, y: 0 }, target: { x: bottomX1, x1: bottomX2, y: parentWrapperHeight } })

    }

    let topColor = topTrack ? topTrack.color : undefined
    let bottomColor = bottomTrack ? bottomTrack.color : undefined

    let gradient = [topColor, bottomColor]

    function locate(e) {

        const genes = e.target.id.split("-")
        if (genes.length < 2) return

        let boundingBox = e.target.getBoundingClientRect()

        let topGene = searchTrack(genes[0], topTrack.array)
        let bottomGene = searchTrack(genes[1], bottomTrack.array)

        let topRatio = topGene.start / aboveCap
        let bottomRatio = bottomGene.start / belowCap

        // If near the bottom, snap to the bottom, if near the top, snap to top
        if (e.clientY > boundingBox.top +( boundingBox.height / 2)) {
            
            // Find location of gene on top track to snap
            let bottomLocation = bottomRatio * maxWidth * bottomTrack.zoom + bottomTrack.offset
            dispatch(pan({
                key: topTrack.key,
                offset: -(topRatio * maxWidth * topTrack.zoom) + bottomLocation
            }))

            dispatch(panComparison({
                key: topTrack.key,
                offset: -(topRatio * maxWidth * topTrack.zoom) + bottomLocation,
                zoom: Math.max(topTrack.zoom, 1.0),
                width: maxWidth,
                ratio: maxWidth / boundingBox.width,
                left: boundingBox.left,
                realWidth: boundingBox.width,
                factor: 1.0
            }))
        }
        else {

            // Find location of gene on top track
            let topLocation = topRatio * maxWidth * topTrack.zoom + topTrack.offset
            dispatch(pan({
                key: bottomTrack.key,
                offset: -(bottomRatio * maxWidth * bottomTrack.zoom) + topLocation
            }))
        }
    }

    return (
        <>
            <div id={id} ref={linkRef} onWheel={handleScroll} onMouseDown={handleClick} onMouseUp={handleClick} onMouseMove={handlePan} >
                <Links arrayCoordinates={arrayLinks} type="svg" width={(maxWidth) - 10} gradient={gradient} locate={locate} />
            </div>
        </>
    )
}

export default OrthologLinks;