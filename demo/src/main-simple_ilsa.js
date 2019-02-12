import { tsv } from 'd3-request';
import { SentenTreeBuilder, SentenTreeVis, tokenizer } from '../../src/main.js';

const container = document.querySelector('#vis');
container.innerHTML = 'Loading ...';

tsv('data/version_ilsa.tsv', (error, rawdata) => {
  const data = rawdata.map(d => Object.assign({}, d, { count: +d.count }));
  console.time('Build model');
  const model = new SentenTreeBuilder()
    // enforce tokenize by space
    //.tokenize(tokenizer.tokenizeBySpace) 
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
    .on('nodeClick', node => {
      console.log('node', node);
    })
    // .on('nodeMouseenter', node => {
    //   // Do something
    // })
    // .on('nodeMousemove', node => {
    //   // Do something
    // })
    // .on('nodeMouseleave', () => {
    //   // Do something
    // });
});