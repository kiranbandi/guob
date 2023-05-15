new Promise((resolve, reject) => {


        // get the coordinate file
        
        axios.get('files/' + "bm4" + '.vcf')
            // get the collinear file
            .then((response) => {

                var chromosomeMap = {};

                var alignmentList = response.data
                    .split('\n').filter((d) => d.length > 0)
                    .map((e) => e.split('\t'))
                    .map(parts => {
                        let source = parts[0].split('.')[2].slice(3),
                            sourceIndex = +parts[1],
                            target = parts[4].split(':')[0].split('.')[2].slice(3),
                            targetIndex = +parts[4].split(':')[1].split('[').join(',').split(']').join(',').split(',')[0],
                            qualityScore = +parts[5],
                            supportValue = +parts[7].split(';')[1].split('=')[1];

                        let type = '--', tester = parts[4];
                        if (tester.indexOf('N[') == 0 && tester.indexOf('[') > -1) {
                            type = 'FF';
                        }
                        else if (tester.indexOf('N]') == 0 && tester.indexOf(']') > -1) {
                            type = 'FR';
                        }
                        else if (tester.indexOf(']') == 0 && tester.indexOf(']N') > -1) {
                            type = 'RR';
                        }
                        else if (tester.indexOf('[') == 0 && tester.indexOf('[N') > -1) {
                            type = 'RF';
                        }
                        remapChromosome(chromosomeMap, source, sourceIndex);
                        remapChromosome(chromosomeMap, target, targetIndex);
                        
                        return { type, source, sourceIndex, target, targetIndex, qualityScore, supportValue };
                    });

                // set width in chromosome map
                _.map(chromosomeMap, (val, chromosome) => {
                    chromosomeMap[chromosome].width = val.end - val.start;
                    chromosomeMap[chromosome]['label'] = chromosome;
                });

                resolve({ alignmentList, chromosomeMap });

                window.alignmentList=  alignmentList;
                window.chromosomeMap = chromosomeMap;
            })
            .catch(() => { alert('Sorry there was an error in processing the VCF file') })
    });





function remapChromosome(chromosomeMap, chromosomeID, chromosomePosition) {
    if (_.has(chromosomeMap, chromosomeID)) {
        if (chromosomePosition < chromosomeMap[chromosomeID].start) {
            chromosomeMap[chromosomeID].start = chromosomePosition;
        }
        else if (chromosomePosition > chromosomeMap[chromosomeID].end) {
            chromosomeMap[chromosomeID].end = chromosomePosition;
        }
    }
    else {
        chromosomeMap[chromosomeID] = { 'start': chromosomePosition, 'end': chromosomePosition };
    }
}


