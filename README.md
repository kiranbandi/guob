# Intended Uses

---

The Grand Unified Track Browser (GUTB) is a visualisation tool intended to be used to visualise one-dimensional data. The primary use so far has been to visualise 'omics data (gene density, methylation, etc). A working version of the GUTB can be found at https://genomevis.usask.ca/guob/ .

The various track components can be used to visualise other sets of data as well.

The GUTB has been built with React/Redux, and incorporates the [Groupware Toolkit](https://github.com/kiranbandi/GroupwareToolkitClient) for real-time collaboration.

# Features

---

**Multiple Track Types**

The GUTB supports several track types, rendering datasets procedurally as a line graph, histogram, bar-chart, scatter plot, or heatmap.
If self-hosting, there is another track type configured to use pre-rendered images, for faster load times.
![Track Types](/documentation/track_types.gif)

**Linkages**

The GUTB supports synteny linkages like those found in [Synviso](https://synvisio.github.io/#/), to visualise relations between data points.
![Linkages](/documentation/synvisio_links.gif)

**Interactive**

The GUTB is fully interactive, supporting modern interaction techniques, such as zooming, panning and dragging to re-arrange tracks.
![Dragging](/documentation/draggable.gif)

**Annotation**

The GUTB supports annotating track positions, so the user is able to make note of important data points or regions and can easily compare them against other areas.
![Annotation demonstration](/documentation/annotations.gif)

**Search**

Find important areas instantly with the search feature.

**Split View**

Compare different areas of the same dataset.

