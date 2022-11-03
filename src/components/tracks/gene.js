
/*
Should hold some basic information about the drawn box. Currently passing in more information than necessary
*/
export class gene {
    constructor(geneInfo, color) {
        this.start = geneInfo.start;
        this.end = geneInfo.end;
        this.chromosome = geneInfo.chromosome;
        this.key = geneInfo.key;
        this.value = geneInfo.value;
        this.color = color;
        this.lightness = geneInfo.lightness;
        this.hover = false
        this.siblings = geneInfo.siblings
        this.lightness = geneInfo.lightness
        //! Adjusting the color just to find orthologs as a proof of concept
        if (this.siblings != undefined && this.siblings.length > 0) {
            this.color = "#ff0000"
        }
    }

    create(context, coordinateX, coordinateY, width, height) {
        this.coordinateX = coordinateX
        this.coordinateY = coordinateY
        this.width = width
        this.height = height
        context.fillStyle = this.color
        context.beginPath()
        context.rect(coordinateX, coordinateY, width, height)
        context.fill()
    }

    update(context, coordinateX, coordinateY, width, height) {
        this.coordinateX = coordinateX
        this.coordinateY = coordinateY
        this.width = width
        this.height = height
        context.fillStyle = this.color
        context.beginPath()
        context.rect(coordinateX, coordinateY, width, height)
        context.fill()
    }

    hovering(mouseX) {
        // TODO update to RGB, this is currently not working
        if (mouseX >= this.coordinateX && mouseX <= this.coordinateX + this.width) {
            this.saturation = 0
            return true
        }
        else {
            this.saturation = 50
            return false
        }
    }

}