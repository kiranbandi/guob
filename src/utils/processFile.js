/* eslint import/no-webpack-loader-syntax: off */
import gffWorker from "workerize-loader?inline!../workers/gff.worker"
// import triadWorker from "workerize-loader?inline!../workers/triad.worker";

export default function(typeOfFile, bedFile, collinearityFile=undefined, additionalParams={}){
    return new Promise((resolve, reject) => {

        let instance;
        switch (typeOfFile){
            case 'gff':
                instance = gffWorker()
                break
            // case 'triad':
            //     instance = triadWorker()
            //     break

        } 
        instance.process(bedFile, collinearityFile).catch(() => {
            console.log("Error in parsing " + bedFile)
            reject()
            instance.terminate()
        }).then(data => {
            resolve(data)
            instance.terminate()
        })

    })
}