import * as DataService from './DataService_catalog.js';
import * as DataServ from './DataServ.js';
import * as d3 from 'd3-selection';

import React, { PropTypes } from 'react';
import { SentenTreeBuilder, SentenTreeVis as _SentenTreeVis, tokenizer } from '../../src/main.js';

import { DATASETS } from './datasets_catalog.js';
import { DATASETS_BRAND } from './datasets_lang.js';
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
	  langs: [],
      langsKey: 0,
	  pairLangs: [],
      pairLangsKey: 1,
    };
  }

  componentDidMount() {
	this.loadLangsFile('cat_langs.tsv');
	this.loadPairLangsFile('cat_pair_langs.tsv');
	this.loadFile(//DATASETS[this.state.dataset].name
            //this.state.langs[this.state.langsKey].id,
            "en ru",
            DATASETS[this.state.dataset].file, this.state.key);
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

  changeLangsKey(value) {
    let first_filter = this.state.langs[value].id;
    if (this.state.langs[value].id == 'en') {
        first_filter = first_filter + ' ru'; 
    } else {
        first_filter = first_filter + ' en';
    }
    let cur_pair_array = this.state.pairLangs.filter((data) => data.id.substring(0,2) == value).map((data) => data.id);
    let pair_index = cur_pair_array.indexOf(first_filter);

    this.setState({
      selectedNode: null,
      renderedGraphs: [],
	  //keyControl: [],
	  langsKey: value,
      pairLangsKey: pair_index,
    });
    
	if (this.state.entity == null)
		this.loadFile(
                first_filter, 
                DATASETS[this.state.dataset].file, 
                this.state.key);
	else
		this.loadFileAccentEntity(
                first_filter, 
                DATASETS[this.state.dataset].file,
                this.state.entity, 
                this.state.key);
  }

  changePairLangsKey(value) {
    let condence_menu = this.state.pairLangs
                            .filter((data) => 
                                data.id.substring(0,2) == this.state.langs[this.state.langsKey].id
                                )
                            .map((data) => data.id);
    let menu_item = condence_menu[value];
    let all_menu_items = this.state.pairLangs
                            .map((data) => data.id);
    let menuValue = all_menu_items.indexOf(menu_item);
      
    this.setState({
      selectedNode: null,
      renderedGraphs: [],
	  //keyControl: [],
	  pairLangsKey: value, //menuValue,
    });
	if (this.state.entity == null)
		this.loadFile(
                menu_item, //this.state.pairLangs[value].id, 
                DATASETS[this.state.dataset].file, 
                this.state.key);
	else
		this.loadFileAccentEntity(
                menu_item, //this.state.pairLangs[value].id, 
                DATASETS[this.state.dataset].file,
                this.state.entity, 
                this.state.key);
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
  
  loadLangsFile(file) {
    console.time('Read langs');
    DataServ.loadFile(`data/${file}`, (error, langs) => {
      this.setState({
		langs, 
      });
    });
    console.timeEnd('Read langs');
  }
  
  loadPairLangsFile(file) {
    console.time('Read pair langs');
    DataServ.loadFile(`data/${file}`, (error, pairLangs) => {
      this.setState({
		pairLangs, 
      });
    });
    console.timeEnd('Read pair langs');
  }
  
  loadFile(name, file, key) {
    DataService.loadFile(name,    //this.changeNameByBrand(name), 
                        `data/${file}`, 	
                        this.state.keyControl, key, (error, data) => {
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
      if (node.leftLinks.length == 0) {
          return (
            <div
              className="popover-content"
              style={{
                top: `${nodeY + 10}px`,
                left: `${nodeX + 100}px`,
              }}
            >
              <div className="popover-inner">
                        Click to download
              </div>
            </div>
          );
      } else {
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
                    {entry.rawText}
                  </div>
                )}
                </div>
            </div>
          );
      }
    }
    return null;
  }

  render() {
    const classes = ['App'];
    if (this.props.className) {
      classes.push(this.props.className);
    }

    const { renderedGraphs } = this.state;
    
    const cur_lang = this.state.langs[this.state.langsKey];

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
            className="langs-control"
            value={this.state.langsKey}
            onChange={e => this.changeLangsKey(e.target.value)}
          >
            {this.state.langs.map((data, i) =>
              <option key={data.text} value={i}>
                {data.text}
              </option>
            )}
          </select>
          <select
            className="langs-pair-control"
            value={this.state.pairLangsKey}
            onChange={e => this.changePairLangsKey(e.target.value)}
          >
            {this.state.pairLangs
                        .filter((data) => 
                            data.id.substring(0,2) == cur_lang.id
                            )
                        .map((data, i) =>
              <option key={data.text} value={i}>
                {data.text}
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
		  <button onClick={e => this.graphRefresh()}> Clear & Refresh </button>
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
