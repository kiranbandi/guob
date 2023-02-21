import parseGFF from "features/parsers/gffParser";
import { parseSubmittedGFF } from "features/parsers/gffParser";

export function process(gff_file, collinearity_file=undefined, additionalParams={}) {
    

    
    // onmessage = function(){
        // let { testone, testtwo } = parseGFF(gff_file, collinearity_file)
        // let { testone, testtwo } = parseSubmittedGFF(gff_file, collinearity_file)
        
        // // postMessage([testone,testtwo])
        // console.log("Thread :" + testone)

       

        return parseSubmittedGFF(gff_file, collinearity_file)
    // }
}

