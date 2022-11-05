
import { text } from "d3-fetch"


async function parseGFF(demoFile) {

    let x = text(demoFile).then(data => {
        let temporary = data.split(/\n/)
        let dataset = {}
        let trackType = 'default'

        // BED file processor for methylation data
        if (demoFile.indexOf('.bed') > -1) {

            trackType = 'scatter'

            temporary.forEach(d => {
                let info = d.split('\t')
                if (info.length > 1) {
                    let key = info[0] + "-" + info[1] + "-" + info[2]
                    var stats = {
                        chromosome: info[0],
                        start: info[1],
                        end: info[2],
                        key,
                        ortholog: false,
                        siblings: [],
                        value: info[3]
                    }
                    dataset[key] = stats
                }
            })
        }

        // gff file parser
        else {
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
                        value: 0
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

        chromosomeNameList.forEach((chr, chrIndex) => {
            var subset = Object.entries(dataset).filter(d => {
                return d[1].chromosome == chr.chromosome
            }).map(x => x[1])

            //   temporary stub for demo purposes 
            let tempTrackType = trackType;
            if (trackType === 'scatter') {

                if (chrIndex % 3 === 1) {
                    tempTrackType = 'scatter';
                }
                else if (chrIndex % 3 === 2) {
                    tempTrackType = 'line';
                }
                else {
                    tempTrackType = 'histogram';
                }
            }

            var temp = {
                key: chr,
                data: subset,
                trackType: tempTrackType,
            }
            chromosomalData.push(temp)
        })

        return { chromosomalData, dataset }
    })

    return x

}

export default parseGFF