import { addBasicTrack } from "components/tracks/basicTrackSlice"
import { addDraggable } from "features/draggable/draggableSlice"
import { text } from "d3-fetch"
import { useDispatch } from "react-redux"
import { useEffect } from "react"



async function parseGFF(demoFile){
    
    // useEffect (() => {

        // const dispatch = useDispatch()
       
    let x = text(demoFile).then(data =>{
            let temporary = data.split(/\n/)
            let dataset = {}
            if(demoFile.indexOf(".bed") > -1){
                temporary.forEach(d => {
                    let info = d.split('\t')
                    if (info.length > 1) {
                        let key = info[1] + info[2] + info[3]
                        var stats = {
                            chromosome: info[0],
                            start: info[1],
                            end: info[2],
                            key: key,
                            ortholog: false,
                            siblings: [],
                            value: +info[3]
                        }
                        dataset[key] = stats
                    }
                    
                })
            }
            else{
                
                temporary.forEach(d => {
                    let info = d.split('\t')
                if (info.length > 1) {
                    let key = info[1].toLowerCase()
                    var stats = {
                        chromosome: info[0],
                        start: info[2],
                        end: info[3],
                        key: key,
                        ortholog: false,
                        siblings: [],
                    }
                    
                    dataset[key] = stats
                }
                
            })
        }
        
        
        
        // Building up the different chromosomes
        let chromosomeNameList = []
        let chromosomalData = []
        let ignore = "Scaffold"
        for (let item in dataset) {
            // this.dataset.forEach((item) => {
                if (!chromosomeNameList.some((x) => x.chromosome == dataset[item].chromosome) && !dataset[item].chromosome.includes(ignore)) {
                    var check = item
                    var temp = {
                        chromosome: dataset[item].chromosome,
                        designation: check.slice(0, check.indexOf('g'))
                    }
                    // Building a list of the chromosome names, used for later finding information on that dataset
                    chromosomeNameList.push(temp)
            }
        }
        // )
        
        // Changing the default lexicographical order, since chromosome11 should come after chromosome2 
        // additional logic so that all chromosomes from the same line should be grouped   
        chromosomeNameList.sort((a, b) => {
            if (a.chromosome[0].localeCompare(b.chromosome[0]) == 0) {
                return a.chromosome.length - b.chromosome.length
            }
            else {
                return a.chromosome[0].localeCompare(b.chromosome[0])
            }
        })
        
        chromosomeNameList.forEach((chr) => {
            var subset = Object.entries(dataset).filter(d => {
                return d[1].chromosome == chr.chromosome
            }).map(x => x[1])
            
            var temp = {
                key: chr,
                data: subset,
            }
            chromosomalData.push(temp)
        })
        return chromosomalData
        // let color = 360 / chromosomalData.length
        // let tick = -1
        // chromosomalData.forEach(point => {
        //     tick += 1
        //     dispatch(addDraggable({
        //         key: point.key.chromosome
        //     }))
        //     dispatch(addBasicTrack({
        //         key: point.key.chromosome,
        //         array: point.data,
        //         color: color*tick,
        //         zoom: 1.0,
        //         pastZoom: 1.0,
        //         offset: 0,
        //     }))
            // addNewDraggable(point.key.chromosome, point.data, color * tick)
            
        // })
        // dispatch(addDraggable({
        //     key: 'links'
        // }))
    })
    return x
    // debugger
    // })
}

export default parseGFF