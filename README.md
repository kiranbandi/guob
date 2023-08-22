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

**Linkages**
The GUTB supports synteny linkages like those found in [Synviso](https://synvisio.github.io/#/), to visualise relations between data points.

**Interactive**
The GUTB is fully interactive, supporting modern interaction techniques, such as zooming, panning and dragging to re-arrange tracks.

**Annotation**
The GUTB supports annotating track positions, so the user is able to make note of important data points or regions and can easily compare them against other areas.

**Search**
Find important areas instantly with the search feature.

# Demo of Components on this Branch

![Demo](/documentation/Groupable_components.gif)

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!
