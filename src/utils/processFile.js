/* eslint import/no-webpack-loader-syntax: off */
import gffWorker from "workerize-loader?inline!../workers/gff.worker"

export default function(bedFile, collinearityFile=undefined, additionalParams={}){
    return new Promise((resolve, reject) => {

        let instance = new gffWorker()
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