import { tsv } from 'd3-request';
import { SentenTreeBuilder, SentenTreeVis, tokenizer } from '../../src/main.js';

const container = document.querySelector('#vis');
container.innerHTML = 'Loading .......';

tsv('https://ankuharev.github.io/SentenTree/data/version_as.tsv', (error, rawdata) => {
  const data = rawdata.map(d => Object.assign({}, d, { count: +d.count }));
  console.time('Build model');
  const model = new SentenTreeBuilder()
    // enforce tokenize by space
    .tokenize(tokenizer.tokenizeBySpace) 
	//.tokenize(tokenizer.tokenize) 
    .transformToken(token => (/score(d|s)?/.test(token) ? 'score' : token))
    // you can adjust the maxSupportRatio (0-1)
    // higher maxsupport will tend to group the graph together in one piece
    // lower maxsupport will break it into multiple graphs  maxSupportRatio: 1, 
    .buildModel(data, { minSupportCount: 10, 
						minSupportRatio: 0.0001, 
						maxSupportRatio: 1 });
    //.buildModel(data, { minSupportCount: 1, 
	//					minSupportRatio: 0,
	//					maxSupportRatio: 1, });
  console.timeEnd('Build model');

  container.innerHTML = '';

  new SentenTreeVis(container)
    .data(model.getRenderedGraphs(70))
    .on('onInit', chart => { this.chart = chart; })	
    .on('nodeClick', node => {
      console.log('node', node);
    })
    .on('nodeMouseenter', node => {
	  this.selectNode(node); this.chart.highlightNeighbors(node); 
     })
    .on('nodeMousemove', node => {
      this.selectNode(node);
    })
    .on('nodeMouseleave', () => {
      this.clearNode(); this.chart.clearHighlightNeighbors();
    });
});