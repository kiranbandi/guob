/* eslint import/no-webpack-loader-syntax: off */
import testWorker from "workerize-loader?inline!../workers/test.worker"

export default function(bedFile, collinearityFile=undefined, additionalParams={}){
    return new Promise((resolve, reject) => {
        // let instance = new Worker(gffWorker);
        // let instance = gffWorker()
        // debugger
        // let test = useSelector(selectBasicTracks)

        // console.log(test)

        let instance = new testWorker()
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