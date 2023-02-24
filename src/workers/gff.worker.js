import { parseSubmittedGFF } from "features/parsers/gffParser";

export function process(gff_file, collinearity_file=undefined, additionalParams={}) {
        return parseSubmittedGFF(gff_file, collinearity_file)

}

