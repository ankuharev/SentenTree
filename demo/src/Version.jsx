import * as DataService from './DataService.js';
import * as d3 from 'd3-selection';

import React, { PropTypes } from 'react';
import { SentenTreeBuilder, SentenTreeVis as _SentenTreeVis, tokenizer } from '../../src/main.js';

import { DATASETS } from './datasets_version.js';
import { DATASETS_BRAND } from './datasets_brand.js';
import { createComponent } from 'react-d3kit';
import { format } from 'd3-format';

const MINSUPPORTCOUNT = 10;
const MINSUPPORTRATIO = 0.000001;
const MAXSUPPORTRATIO = 1;

const SentenTreeVis = createComponent(_SentenTreeVis);

const propTypes = {
  className: PropTypes.string,
};
const defaultProps = {};

const formatNumber = format(',d');

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 0,
      selectedNode: null,
      renderedGraphs: [],
      brand: 0,
	  data: null,
	  entity: null,
	  keyControl: [],
	  key: 0,
    };
  }

  componentDidMount() {
	this.loadFile(DATASETS[this.state.dataset].name, DATASETS[this.state.dataset].file, this.state.key);
  }

  graphRefresh() {
	  if (this.state.renderedGraphs.length != 0) {
		  this.setState({
			selectedNode: null,
			renderedGraphs: [],
			entity: null,
		  });
	  } else {
		  console.time('Build model');
		  //this.state.data.splice(1,1);
		  this.state.data[1].count = 1;
		  const model = new SentenTreeBuilder()
			.tokenize(tokenizer.tokenizeBySpace) 
			.buildModel(this.state.data , { minSupportCount: MINSUPPORTCOUNT, 
							minSupportRatio: MINSUPPORTRATIO, 
							maxSupportRatio: MAXSUPPORTRATIO }
			);
		  console.timeEnd('Build model');
		  console.time('Build rendered graphs');
		  const renderedGraphs = model.getRenderedGraphs(200);
		  console.timeEnd('Build rendered graphs');

		  this.setState({
			selectedNode: null,
			model,
			renderedGraphs,
			entity: null,
		  });
	  }
  }
  
  changeNameByBrand(name) { //, brandNumber, brand_ilsa) {
	if (name.length > 3 && name.substring(2,3) == ' ') {
		if (DATASETS_BRAND[this.state.brand].brand_ilsa.length == 1)
			return name;
		else
			return DATASETS_BRAND[this.state.brand].brand_ilsa;
	}
    return name;
  }	  
  
  changeBrand(value) {
    this.setState({
      selectedNode: null,
      renderedGraphs: [],
      brand: value,
	  //keyControl: [],
	  key: 0,
    });
	if (this.state.entity == null)
		this.loadFile(DATASETS_BRAND[value].brand_ilsa, DATASETS[this.state.dataset].file, 0); // this.state.key);
	else
		this.loadFileAccentEntity(DATASETS_BRAND[value].brand_ilsa, DATASETS[this.state.dataset].file, this.state.entity, 0); // this.state.key);
  }

  changeDataset(value) {
    this.setState({
      dataset: value,
      selectedNode: null,
      renderedGraphs: [],
	  //keyControl: [],
	  key: 0,
    });
	if (this.state.entity == null)
		this.loadFile(DATASETS[value].name, DATASETS[value].file, this.state.key);
	else
		this.loadFileAccentEntity(DATASETS[value].name, DATASETS[value].file, this.state.entity, this.state.key);
  }

  changeKey(value) {
    this.setState({
      selectedNode: null,
      renderedGraphs: [],
	  //keyControl: [],
	  key: value,
    });
	if (this.state.entity == null)
		this.loadFile(DATASETS_BRAND[this.state.brand].brand_ilsa, DATASETS[this.state.dataset].file, value);
	else
		this.loadFileAccentEntity(DATASETS_BRAND[this.state.brand].brand_ilsa, DATASETS[this.state.dataset].file,this.state.entity, value);
  }

  modifyDataset(entity) {
    this.setState({
      selectedNode: null,
      renderedGraphs: [],
	  entity,
    });
	this.loadFileAccentEntity(DATASETS[this.state.dataset].name, DATASETS[this.state.dataset].file, entity, this.state.key);
  }

  selectNode(node) {
    const [x, y] = d3.mouse(this.c);
    this.setState({
      selectedNode: node,
      nodeY: y,
      nodeX: x,
    });
  }

  clearNode() {
    this.setState({ selectedNode: null });
  }
  
  loadFile(name, file, key) {
    DataService.loadFile(this.changeNameByBrand(name), `data/${file}`, 	this.state.keyControl, key, (error, data) => {
      console.time('Build model');
      const model = new SentenTreeBuilder()
		.tokenize(tokenizer.tokenizeBySpace) 
        .buildModel(data , { minSupportCount: MINSUPPORTCOUNT, 
						minSupportRatio: MINSUPPORTRATIO, 
						maxSupportRatio: MAXSUPPORTRATIO }
		);
      console.timeEnd('Build model');
      console.time('Build rendered graphs');
      const renderedGraphs = model.getRenderedGraphs(200);
      console.timeEnd('Build rendered graphs');

      this.setState({
        model,
        renderedGraphs,
		data,
      });
    });
  }

  loadFileAccentEntity(name, file,entity, key) {
    DataService.loadFile(this.changeNameByBrand(name), `data/${file}`, 	this.state.keyControl, key, (error, data) => {
      console.time('Build model');
	  var entityData = {
		  count: 10000, 
		  id: '0000', 
		  text: entity
	  };
	  data.splice( 1, 0, entityData);
      const model = new SentenTreeBuilder()
		.tokenize(tokenizer.tokenizeBySpace) 
        .buildModel( data, 
					  { minSupportCount: MINSUPPORTCOUNT, 
						minSupportRatio: MINSUPPORTRATIO, 
						maxSupportRatio: MAXSUPPORTRATIO }
		);
      console.timeEnd('Build model');
      console.time('Build rendered graphs');
      const renderedGraphs = model.getRenderedGraphs(200);
      console.timeEnd('Build rendered graphs');

      this.setState({
        model,
        renderedGraphs,
		data,
      });
    });
  }

  renderSelectedNode() {
    const { selectedNode: node, nodeX, nodeY } = this.state;
    if (node) {
      return (
        <div
          className="popover-content"
          style={{
            top: `${nodeY + 10}px`,
            left: `${nodeX + 100}px`,
          }}
        >
          <div className="popover-inner">
            {node.data.topEntries.slice(0, node.data.topEntries.length).map(entry =>
              <div key={entry.id} className="mock-tweet">
                <div className="word-count">
                  id {entry.id}
                </div>
                {entry.rawText}
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const classes = ['App'];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const { renderedGraphs } = this.state;

    return (
      <div className={classes.join(' ')}>
        <div className="container">
          <p>
			Click to get together all modification with selected key.
          </p>
          <select
            className="form-control"
            value={this.state.dataset}
            onChange={e => this.changeDataset(e.target.value)}
          >
            {DATASETS.map((dataset, i) =>
              <option key={dataset.file} value={i}>
                {dataset.name || dataset.file}
              </option>
            )}
          </select>
          <select
            className="brand-control"
            value={this.state.brand}
            onChange={e => this.changeBrand(e.target.value)}
          >
            {DATASETS_BRAND.map((data, i) =>
              <option key={data.brand} value={i}>
                {data.brand}
              </option>
            )}
          </select>
          <select
            className="key-control"
            value={this.state.key}
            onChange={e => this.changeKey(e.target.value)}
          >
            {this.state.keyControl.map((data, i) =>
              <option key={data} value={i}>
                {data}
              </option>
            )}
          </select>
		  <button onClick={e => this.graphRefresh()}> Refresh </button>
		  {this.state.entity}
        </div>
        <div className="container">
          <div className="vis-container">
            <SentenTreeVis
              data={renderedGraphs}
              onInit={chart => { this.chart = chart; }}
              onNodeClick={node => { console.log(node); this.modifyDataset(node.data.entity); }}
              onNodeMouseenter={node => { this.selectNode(node); }}
              onNodeMousemove={node => { this.selectNode(node); }}
              onNodeMouseleave={() => { this.clearNode(); }}
            />
          </div>
        </div>
        <div
          className="popover-container"
          ref={c => { this.c = c; }}
        >
          {this.renderSelectedNode()}
        </div>
      </div>
    );
  }
}

App.propTypes = propTypes;
App.defaultProps = defaultProps;

export default App;
