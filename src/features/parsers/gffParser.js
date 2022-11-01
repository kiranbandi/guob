
import { text } from "d3-request"


/**
 * These functions are pulled from the previous gene density maps, need to be updated for the GUTB
 */
 
let info,  temporary, savedDensityData

// Pulls collinearity info and makes links
function pullGeneInfo(collinearityFile, nomenclature) {

    return text(collinearityFile).then(function (data) {
        let rawCollinearity = process(data);
        let selectedCollinearity = []
        nomenclature.forEach(n => {
            let temporaryCollinearity = rawCollinearity.alignmentList.filter((d) => d.source.indexOf(n) > -1 && d.target.indexOf(n) > -1)
            selectedCollinearity.push(...temporaryCollinearity)
        })
        let genePairs = selectedCollinearity.reduce((c, e) => { return [...c, ...e.links] }, [])
        let trueMatch = genePairs.filter((x) => +x.e_value == 0)

        return trueMatch
    })
}

// Turns gff file into model
export function pullInfo(genomeFile) {
    return text(genomeFile).then(function (data) {
            temporary = data.split(/\n/)
            // dataset = []
            savedDensityData = []

            let dataset = {}
            temporary.forEach(d=>{
                info = d.split('\t')
                // console.log(info)
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
                    // console.log(stats)
                    // console.log(key)
                   dataset[key] = stats
            }
        })
            return dataset
        })
    }


function process(collinearityData) {
    // The first 11 lines contain information regarding the MCSCANX Parameters
    // and can be processed seperately 
    var FileLines = collinearityData.split('\n'),
        information = parseInformation(FileLines.slice(0, 11)),
        alignmentList = [],
        alignmentBuffer = {};
    // remove the first 11 lines and then process the file line by line
    FileLines.slice(11).forEach(function (line, index) {
        if (line.indexOf('Alignment') > -1) {
            // store the previous alignment in list , 
            // and skip for the first iteration since buffer is empty
            if (alignmentBuffer.links) {
                alignmentList.push(alignmentBuffer);
            }
            alignmentBuffer = parseAlignmentDetails(line);
            alignmentBuffer.links = [];
        } else if (line.trim().length > 1) {
            // condition to skip empty lines
            alignmentBuffer.links.push(parseLink(line));
        }
    })
    // push the last alignment still in the buffer
    alignmentList.push(alignmentBuffer);
    // get the unique list of IDs of all chromosomes or scaffolds that have alignments mapped to them
    let uniqueIDList = [];
    alignmentList.map((d) => { uniqueIDList.push(d.source, d.target) });
    return { "information": information, "alignmentList": alignmentList, 'uniqueIDList': uniqueIDList.filter(onlyUnique) };
};


function parseInformation(informationLines) {
    return {
        'parameters': [
            ['match score', informationLines[1].split(':')[1].trim()],
            ['match size', informationLines[2].split(':')[1].trim()],
            ['gap penality', informationLines[3].split(':')[1].trim()],
            ['overlap wndow', informationLines[4].split(':')[1].trim()],
            ['e value', informationLines[5].split(':')[1].trim()],
            ['maximum gaps', informationLines[6].split(':')[1].trim()]
        ],
        'stats': {
            'no_of_collinear_genes': informationLines[8].split(',')[0].split(":")[1].trim(),
            'percentage': Number(informationLines[8].split(',')[1].split(":")[1].trim()),
            'no_of_all_genes': informationLines[8].split(',')[1].split(":")[1].trim()
        }
    };
}

function parseAlignmentDetails(alignmentDetails) {
    let alignmentDetailsList = alignmentDetails.split(' ');
    return {
        'score': Number(alignmentDetailsList[3].split('=')[1].trim()),
        'e_value': Number(alignmentDetailsList[4].split('=')[1].trim()),
        'count': Number(alignmentDetailsList[5].split('=')[1].trim()),
        'type': alignmentDetailsList[7].trim() == 'plus' ? 'regular' : 'flipped',
        'source': alignmentDetailsList[6].split('&')[0].trim(),
        'target': alignmentDetailsList[6].split('&')[1].trim(),
        'sourceKey': Number(alignmentDetailsList[6].split('&')[0].trim().slice(2)),
        'targetKey': Number(alignmentDetailsList[6].split('&')[1].trim().slice(2)),
        'alignmentID': Number(alignmentDetailsList[2].split(':')[0].trim())
    };
}

function parseLink(link) {
    let linkInfo = link.split('\t');
    return {
        'source': linkInfo[1],
        'target': linkInfo[2],
        'e_value': linkInfo[3]
    };
}

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}